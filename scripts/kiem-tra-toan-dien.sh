#!/usr/bin/env bash
#
# Kiem tra toan dien he thong SHMS - mot lenh, do that, tu don.
#
# Vi sao co tep nay: CI hien tai chi BIEN DICH va chay unit test, khong bao
# gio KHOI DONG ung dung. Toan bo cac loi nghiem trong tim duoc trong dot ra
# soat thang 9/2026 deu chi lo ra khi chay that:
#
#   - tao su kien tra 400 vi mot truong kieu nguyen thuy  -> chi thay khi goi API
#   - doi truong khong moi duoc thanh vien                -> chi thay khi mo trinh duyet
#   - xuat CSV nghien cuu tra 500                         -> chi thay khi quet het endpoint
#   - lenh lint cua BFF chua tung chay duoc               -> chi thay khi chay no
#   - 28 chuoi tieng Anh con sot o giao dien              -> chi thay khi doc DOM
#
# Khong dung `set -e`: chay HET moi khoi roi bao cao mot lan, de mot lan chay
# cho ra day du danh sach van de thay vi dung o loi dau tien.

set -uo pipefail

GOC="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$GOC"

SO_LOI=0
SO_DAT=0
DANH_SACH_LOI=()
declare -A TOKEN_CUA=()

dat()      { printf '  \033[32m✓\033[0m %s\n' "$*"; SO_DAT=$((SO_DAT+1)); }
hong()     { printf '  \033[31m✗\033[0m %s\n' "$*"; SO_LOI=$((SO_LOI+1)); DANH_SACH_LOI+=("$*"); }
bo_qua()   { printf '  \033[33m-\033[0m %s\n' "$*"; }
khoi()     { printf '\n\033[1m%s\033[0m\n' "$*"; }

# Cong va tien trinh
CONG_BE=8080; CONG_BFF=4000; CONG_FE=3000; CONG_PG=5440
PID=()
TMP="$(mktemp -d)"
trap 'don_dep' EXIT

don_dep() {
  for p in "${PID[@]:-}"; do [ -n "$p" ] && kill -9 "$p" 2>/dev/null; done
  for c in $CONG_BE $CONG_BFF $CONG_FE; do
    p=$(fuser "$c/tcp" 2>/dev/null | tr -d ' ')
    [ -n "$p" ] && kill -9 $p 2>/dev/null
  done
  pkill -9 -f "spring-boot:run" 2>/dev/null
  if [ "${PG_DA_CHAY:-0}" = "1" ]; then
    su postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D $TMP/pg stop" >/dev/null 2>&1
  fi
  # Lan chay hong thi GIU lai nhat ky: do la thu duy nhat giai thich duoc
  # nguyen nhan. Xoa sach di thi nguoi doc chi con moi dong "HONG" tren man
  # hinh, va buoc luu artifact cua CI khong con gi de luu.
  if [ "$SO_LOI" -gt 0 ]; then
    printf '\n  Nhat ky cua lan chay nay duoc giu lai o: %s\n' "$TMP"
  else
    rm -rf "$TMP"
  fi
}

giai_phong_cong() {  # giai_phong_cong <cong>
  # `spring-boot:run` tach ra mot tien trinh java RIENG, dong lenh cua no
  # khong he chua chuoi "spring-boot:run" — nen `pkill -f spring-boot:run`
  # chi giet vo Maven con JVM that van song va van giu cong 8080.
  #
  # Hau qua da tung xay ra that: ban backend cu (profile dev, tro toi
  # Postgres) con song, ban moi khong bind duoc cong nen chet im lang, va ca
  # bo kiem do nham vao ung dung CU — bao xanh cho mot thu khong phai thu
  # minh vua dung len. Vi vay phai giet theo CONG chu khong theo mau lenh.
  local c=$1 i=0 p
  while [ $i -lt 30 ]; do
    p=$(fuser "$c/tcp" 2>/dev/null | tr -d ' ')
    [ -z "$p" ] && return 0
    kill -9 $p 2>/dev/null
    sleep 1; i=$((i+1))
  done
  return 1
}

cho_cong() {  # cho_cong <cong> <so giay toi da> [tep nhat ky]
  local c=$1 n=${2:-120} nk=${3:-} i=0
  while [ $i -lt "$n" ]; do
    curl -s -o /dev/null --max-time 2 "http://localhost:$c/" 2>/dev/null && return 0
    # Spring Boot chet han thi cho tiep la vo ich: khong co tep nhat ky de
    # doc thi phai doi du 180 giay roi moi bao loi, che mat nguyen nhan that.
    if [ -n "$nk" ] && grep -q "APPLICATION FAILED TO START\|Error starting ApplicationContext\|BUILD FAILURE" "$nk" 2>/dev/null; then
      return 1
    fi
    sleep 1; i=$((i+1))
  done
  return 1
}

# UUID khong ton tai trong bat ky bang nao: moi phep quet deu goi bang id nay
# nen khong co ban ghi that nao bi doc, sua hay xoa.
ID_GIA="00000000-0000-4000-8000-000000000000"

# Maven chay ONLINE theo mac dinh. Truoc day co -o duoc go cung vao moi lenh
# vi kho ~/.m2 tren may phat trien da am san, chay offline thi nhanh va khoi
# phu thuoc mang. Nhung tren CI thi kho LUON thieu thu gi do, va thieu cai
# nao thi chi lo ra khi goi dung lenh can no:
#
#   backend-ci.yml tu truoc toi nay chi chay `./mvnw test`, nen bo nho dem
#   cua no co surefire nhung KHONG co maven-clean-plugin (khoi 1 can) va
#   khong co spring-boot-buildpack-platform (khoi 3 va 4 can de chay
#   spring-boot:run). Ket qua lan chay dau tien tren CI: khoi 1 hong, khoi 2
#   xanh, khoi 3 va 4 hong — dung ba cho co lenh maven khac `test`.
#
# Dat MVN_OFFLINE=1 khi muon chay nhanh tren may da co du kho cuc bo.
MVN_OFFLINE_CO=""
[ "${MVN_OFFLINE:-0}" = "1" ] && MVN_OFFLINE_CO="-o"

ma() {  # ma <PHUONG_THUC> <duong dan> [token]
  local pt=$1 dd=$2 tk=${3:-}
  local -a co=(-s -o /dev/null -w '%{http_code}' --max-time 20 -X "$pt")
  [ -n "$tk" ] && co+=(-H "Authorization: Bearer $tk")
  # Than rong cho cac lenh ghi: thieu Content-Type thi Spring tra 415 chu
  # khong phai 403, lam nhieu ket qua doc ma tran quyen.
  if [ "$pt" != "GET" ]; then co+=(-H 'Content-Type: application/json' -d '{}'); fi
  curl "${co[@]}" "http://localhost:$CONG_BE$dd"
}

thay_id() {  # thay moi {bien} trong duong dan bang ID_GIA
  printf '%s' "$1" | sed -E "s/\{[^}]+\}/$ID_GIA/g"
}

token() {  # token <email> <mat khau>
  curl -s --max-time 15 -X POST "http://localhost:$CONG_BE/api/auth/login" \
       -H 'Content-Type: application/json' \
       -d "{\"email\":\"$1\",\"password\":\"$2\"}" \
    | python3 -c "import sys,json
try: print(json.load(sys.stdin).get('accessToken',''))
except Exception: print('')" 2>/dev/null
}

# ==========================================================================
khoi "KHOI 1/8 — Bien dich sach ca ba tang"
# ==========================================================================
rm -rf backend/target frontend/dist bff/dist

if (cd backend && ./mvnw $MVN_OFFLINE_CO -q clean test-compile) >"$TMP/be-build.log" 2>&1; then
  dat "backend bien dich sach tu target/ rong"
else
  hong "backend KHONG bien dich duoc — xem $TMP/be-build.log"; tail -5 "$TMP/be-build.log"
fi

if (cd frontend && npx tsc -b --noEmit) >"$TMP/fe-tsc.log" 2>&1; then
  dat "frontend typecheck sach"
else
  hong "frontend typecheck HONG"; head -5 "$TMP/fe-tsc.log"
fi

if (cd bff && npm run build) >"$TMP/bff-build.log" 2>&1; then
  dat "bff bien dich sach"
else
  hong "bff KHONG bien dich duoc"; tail -5 "$TMP/bff-build.log"
fi

# ==========================================================================
khoi "KHOI 2/8 — Chay MOI lenh npm duoc khai bao"
# ==========================================================================
# Loi lint cua BFF ton tai lau vi CI khong he goi `npm run lint` o tang do.
# Khoi nay chay moi lenh duoc coi la phai xanh, khong bo sot tang nao.
for tang in frontend bff; do
  for lenh in lint build test; do
    if ! (cd "$tang" && node -e "
const p=require('./package.json');
process.exit(p.scripts && p.scripts['$lenh'] ? 0 : 1)") 2>/dev/null; then
      bo_qua "$tang: khong khai bao lenh '$lenh'"
      continue
    fi
    if (cd "$tang" && npm run "$lenh") >"$TMP/$tang-$lenh.log" 2>&1; then
      dat "$tang: npm run $lenh"
    else
      hong "$tang: npm run $lenh THAT BAI — xem $TMP/$tang-$lenh.log"
      tail -6 "$TMP/$tang-$lenh.log"
    fi
  done
done

if (cd backend && ./mvnw $MVN_OFFLINE_CO -q test) >"$TMP/be-test.log" 2>&1; then
  SO_TEST_BE=$(grep -ho 'tests="[0-9]*"' backend/target/surefire-reports/TEST-*.xml 2>/dev/null | grep -o '[0-9]*' | paste -sd+ | bc)
  dat "backend: $SO_TEST_BE test, 0 loi"
else
  hong "backend: test THAT BAI"; grep -E "Tests run:.*Failures: [1-9]|ERROR\]   " "$TMP/be-test.log" | head -5
fi

# ==========================================================================
khoi "KHOI 3/8 — Flyway tren Postgres that"
# ==========================================================================
# Chay tren Postgres that chu khong phai H2: cac migration dung cu phap rieng
# cua Postgres (gen_random_uuid, crypt, pgcrypto) nen H2 khong kiem duoc.
# Sua noi dung mot migration DA AP DUNG se lam Flyway bao sai checksum va tu
# choi khoi dong - khoi nay bat dung truong hop do.
if [ "${BO_QUA_POSTGRES:-0}" = "1" ]; then
  bo_qua "Flyway: bo qua theo BO_QUA_POSTGRES=1"
elif [ -n "${DB_URL_CI:-}" ]; then
  # CI cung cap san mot Postgres qua service container.
  PG_USER="${DB_USERNAME_CI:-postgres}"; PG_PASS="${DB_PASSWORD_CI:-postgres}"

  # Suy ra URL kieu libpq tu URL kieu JDBC de khoi phai khai hai lan:
  #   jdbc:postgresql://localhost:5432/shms -> postgresql://user:pass@localhost:5432/shms
  PSQL_URL="$(printf '%s' "$DB_URL_CI" \
     | sed -E "s#^jdbc:postgresql://#postgresql://$PG_USER:$PG_PASS@#")"

  (cd backend && DB_URL="$DB_URL_CI" DB_USERNAME="$PG_USER" DB_PASSWORD="$PG_PASS" \
     timeout 300 ./mvnw $MVN_OFFLINE_CO spring-boot:run -Dspring-boot.run.profiles=dev \
     >"$TMP/fw.log" 2>&1) &
  PID+=($!)
  if cho_cong $CONG_BE 180 "$TMP/fw.log"; then
    SO_MG=$(psql "$PSQL_URL" -tAc "SELECT count(*) FROM flyway_schema_history WHERE success" 2>/dev/null)
    SO_TEP=$(ls backend/src/main/resources/db/migration/V*.sql 2>/dev/null | wc -l)
    if [ "${SO_MG:-0}" = "$SO_TEP" ]; then
      dat "Flyway: $SO_MG/$SO_TEP migration ap dung sach tren Postgres (CI)"
    else
      hong "Flyway (CI): chi ${SO_MG:-0}/$SO_TEP migration thanh cong"
    fi
    grep -qi "checksum\|Validate failed" "$TMP/fw.log" && hong "Flyway bao sai checksum"

    # Cung phep kiem tai khoan nhu nhanh cuc bo: bo du lieu tung lech giua
    # data-demo.sql (H2) va V006 (Postgres), moi duong thieu mot tai khoan.
    while IFS='|' read -r em mk; do
      [ -z "$em" ] && continue
      if [ -n "$(token "$em" "$mk")" ]; then dat "Postgres CI: $em dang nhap duoc"
      else hong "Postgres CI: $em KHONG dang nhap duoc"; fi
    done < <(grep -v '^[[:space:]]*#' scripts/tai-khoan-demo.txt)
  else
    hong "Backend khong khoi dong duoc voi Postgres CI"; tail -15 "$TMP/fw.log"
  fi
  pkill -9 -f "spring-boot:run" 2>/dev/null; giai_phong_cong $CONG_BE
elif command -v /usr/lib/postgresql/16/bin/initdb >/dev/null 2>&1 && [ "$(id -u)" = "0" ]; then
  # mktemp -d tao thu muc che do 700 cua root, nen user postgres khong di
  # xuyen qua duoc va initdb chet ngay. Mo quyen di xuyen (khong mo quyen
  # doc) cho rieng thu muc cha.
  chmod 711 "$TMP"
  mkdir -p "$TMP/pg"; chown postgres:postgres "$TMP/pg"; chmod 700 "$TMP/pg"

  # Khong nuot dau ra cua initdb/pg_ctl: lan truoc no chet im lang va khoi
  # nay bao "Flyway hong" trong khi thuc ra Postgres chua bao gio chay.
  if ! su postgres -c "/usr/lib/postgresql/16/bin/initdb -D $TMP/pg -U postgres -A trust" \
        >"$TMP/initdb.log" 2>&1; then
    hong "initdb that bai — xem $TMP/initdb.log"; tail -5 "$TMP/initdb.log"
  fi
  # pg_ctl chay duoi user postgres nen tep nhat ky phai do chinh no ghi duoc:
  # $TMP la cua root che do 711, postgres di xuyen duoc nhung khong ghi duoc.
  touch "$TMP/pg.log"; chown postgres:postgres "$TMP/pg.log"
  su postgres -c "/usr/lib/postgresql/16/bin/pg_ctl -D $TMP/pg -o '-p $CONG_PG -k /tmp' -l $TMP/pg.log start" \
    >"$TMP/pgctl.log" 2>&1
  PG_DA_CHAY=1; sleep 5

  if ! psql -h /tmp -p $CONG_PG -U postgres -tAc 'SELECT 1' >/dev/null 2>&1; then
    hong "Postgres cuc bo khong len duoc — khoi 3 khong ket luan duoc"
    tail -5 "$TMP/pg.log" 2>/dev/null; tail -3 "$TMP/pgctl.log" 2>/dev/null
  fi
  psql -h /tmp -p $CONG_PG -U postgres -c "CREATE DATABASE shms;" >/dev/null 2>&1
  psql -h /tmp -p $CONG_PG -U postgres -d shms -c "CREATE EXTENSION IF NOT EXISTS pgcrypto;" >/dev/null 2>&1

  rm -rf backend/target/classes/db/migration
  (cd backend && DB_URL="jdbc:postgresql://localhost:$CONG_PG/shms" DB_USERNAME=postgres DB_PASSWORD=postgres \
     ./mvnw $MVN_OFFLINE_CO spring-boot:run -Dspring-boot.run.profiles=dev >"$TMP/fw.log" 2>&1) &
  PID+=($!)
  if cho_cong $CONG_BE 180 "$TMP/fw.log"; then
    SO_MG=$(psql -h /tmp -p $CONG_PG -U postgres -d shms -tAc \
       "SELECT count(*) FROM flyway_schema_history WHERE success" 2>/dev/null)
    SO_TEP=$(ls backend/src/main/resources/db/migration/V*.sql 2>/dev/null | wc -l)
    if [ "${SO_MG:-0}" = "$SO_TEP" ]; then
      dat "Flyway: $SO_MG/$SO_TEP migration ap dung sach tren Postgres that"
    else
      hong "Flyway: chi $SO_MG/$SO_TEP migration thanh cong"
    fi
    grep -qi "checksum\|Validate failed" "$TMP/fw.log" && hong "Flyway bao sai checksum"

    # Moi tai khoan trong README phai dang nhap duoc tren CA duong Postgres.
    # Bo du lieu tung lech giua data-demo.sql (H2) va V006 (Postgres): moi
    # duong thieu mot tai khoan khac nhau.
    while IFS='|' read -r em mk; do
      [ -z "$em" ] && continue
      if [ -n "$(token "$em" "$mk")" ]; then dat "Postgres: $em dang nhap duoc"
      else hong "Postgres: $em KHONG dang nhap duoc"; fi
    done < <(grep -v '^[[:space:]]*#' scripts/tai-khoan-demo.txt)
  else
    hong "Backend khong khoi dong duoc voi Postgres"; tail -5 "$TMP/fw.log"
  fi
  pkill -9 -f "spring-boot:run" 2>/dev/null; giai_phong_cong $CONG_BE
else
  bo_qua "Flyway: khong co Postgres cuc bo, bo qua (dat BO_QUA_POSTGRES=1 de im lang)"
fi

# ==========================================================================
khoi "KHOI 4/8 — Khoi dong that o profile demo (H2)"
# ==========================================================================
# Ba khoi 4, 5, 6 dung chung mot tien trinh backend dang chay.
pkill -9 -f "spring-boot:run" 2>/dev/null
if ! giai_phong_cong $CONG_BE; then
  hong "Khong giai phong duoc cong $CONG_BE — bo kiem se do nham vao ung dung khac"
fi
(cd backend && ./mvnw $MVN_OFFLINE_CO spring-boot:run -Dspring-boot.run.profiles=demo >"$TMP/be-run.log" 2>&1) &
PID+=($!)

if ! cho_cong $CONG_BE 180 "$TMP/be-run.log"; then
  hong "Backend KHONG khoi dong duoc o profile demo — bo qua khoi 5 va 6"
  tail -20 "$TMP/be-run.log"
  BE_SONG=0
else
  BE_SONG=1
  dat "Backend len o profile demo"

  # Dang nhap TUNG tai khoan README cong bo. Day chinh la phep kiem da lo ra
  # chuyen leader@demo.local khong ton tai trong data-demo.sql.
  while IFS='|' read -r em mk; do
    [ -z "$em" ] && continue
    tk="$(token "$em" "$mk")"
    if [ -n "$tk" ]; then
      dat "demo: $em dang nhap duoc"
      TOKEN_CUA["$em"]="$tk"
    else
      hong "demo: $em KHONG dang nhap duoc"
    fi
  done < <(grep -v '^[[:space:]]*#' scripts/tai-khoan-demo.txt)

  # /api/auth/me cua khach phai la 401 chu khong phai 200 than rong.
  MA_ME="$(ma GET /api/auth/me)"
  if [ "$MA_ME" = "401" ]; then dat "GET /api/auth/me khong dang nhap -> 401"
  else hong "GET /api/auth/me khong dang nhap -> $MA_ME (mong doi 401)"; fi
fi

# ==========================================================================
khoi "KHOI 5/8 — Quet 5xx TOAN BO endpoint"
# ==========================================================================
# Danh sach endpoint SINH TU MA NGUON chu khong go tay: them controller moi
# la tu dong duoc quet. Dot ra soat truoc quet tay duoc 32/88 endpoint, va
# /rbl/export.csv tra 500 vi NullPointerException nam ngoai 32 cai do.
# Truoc het: bo doc endpoint phai doc HET. Neu bieu thuc chinh quy cua no hong
# thi danh sach quet teo lai trong im lang va moi khoi sau deu bao xanh gia.
SO_ANNOT=$(grep -rhoE "@(Get|Post|Put|Delete|Patch)Mapping" \
             backend/src/main/java/com/seal/hackathon/controller/ | wc -l)
SO_DOC=$(python3 scripts/liet-ke-endpoint.py | wc -l)
if [ "$SO_ANNOT" = "$SO_DOC" ]; then
  dat "Bo doc endpoint lay du $SO_DOC/$SO_ANNOT annotation mapping"
else
  hong "Bo doc endpoint chi lay duoc $SO_DOC/$SO_ANNOT annotation — phep quet KHONG day du"
fi

if [ "${BE_SONG:-0}" != "1" ]; then
  bo_qua "Quet 5xx: backend khong chay"
else
  TK_BTC="${TOKEN_CUA[coordinator@demo.local]:-}"
  [ -z "$TK_BTC" ] && hong "Khong co token BTC — phep quet 5xx se khong day du"
  SO_QUET=0; SO_500=0
  while IFS=$'\t' read -r pt dd ctl quyen; do
    [ -z "$pt" ] && continue
    m="$(ma "$pt" "$(thay_id "$dd")" "$TK_BTC")"
    SO_QUET=$((SO_QUET+1))
    case "$m" in
      5*) hong "5xx: $pt $dd -> $m ($ctl)"; SO_500=$((SO_500+1)) ;;
      000) hong "KHONG PHAN HOI: $pt $dd ($ctl)"; SO_500=$((SO_500+1)) ;;
    esac
  done < <(python3 scripts/liet-ke-endpoint.py)
  [ "$SO_500" = "0" ] && dat "Quet $SO_QUET endpoint voi token BTC: khong endpoint nao tra 5xx"

  # Quet lai khong token: loi 5xx hay nup sau nhanh "principal == null".
  SO_500K=0
  while IFS=$'\t' read -r pt dd ctl quyen; do
    [ -z "$pt" ] && continue
    m="$(ma "$pt" "$(thay_id "$dd")")"
    case "$m" in
      5*) hong "5xx (khach): $pt $dd -> $m ($ctl)"; SO_500K=$((SO_500K+1)) ;;
    esac
  done < <(python3 scripts/liet-ke-endpoint.py)
  [ "$SO_500K" = "0" ] && dat "Quet lai $SO_QUET endpoint khong dang nhap: khong tra 5xx"

  # Dau vao rac phai ra 400, khong duoc ra 500.
  for thu in "GET /api/events/khong-phai-uuid 400" \
             "GET /api/rounds/khong-phai-uuid/criteria 400"; do
    set -- $thu
    m="$(ma "$1" "$2" "$TK_BTC")"
    if [ "$m" = "$3" ]; then dat "$1 $2 -> $m"
    else hong "$1 $2 -> $m (mong doi $3)"; fi
  done
  m="$(curl -s -o /dev/null -w '%{http_code}' --max-time 20 -X POST \
        "http://localhost:$CONG_BE/api/events" -H "Authorization: Bearer $TK_BTC" \
        -H 'Content-Type: application/json' -d '{khong-phai-json')"
  if [ "$m" = "400" ]; then dat "POST /api/events voi JSON hong -> 400"
  else hong "POST /api/events voi JSON hong -> $m (mong doi 400)"; fi
fi

# ==========================================================================
khoi "KHOI 6/8 — Ma tran phan quyen doi chieu scripts/ma-tran-quyen.txt"
# ==========================================================================
if [ "${BE_SONG:-0}" != "1" ]; then
  bo_qua "Ma tran quyen: backend khong chay"
else
  # Ghep cot trong tep ky vong voi token that.
  VAI=(BTC GK MENTOR TS KHACH)
  EMAIL_VAI=(coordinator@demo.local judge1@demo.local mentor1@demo.local leader@demo.local "")

  # Dung duong dan+phuong thuc lam khoa de doi chieu hai chieu.
  KY_VONG_FILE="$TMP/ky-vong.txt"
  grep -v '^[[:space:]]*#' scripts/ma-tran-quyen.txt | grep -v '^[[:space:]]*$' \
    | awk '{print $1"\t"$2"\t"$3"\t"$4"\t"$5"\t"$6"\t"$7}' > "$KY_VONG_FILE"

  # 6a. Moi endpoint trong ma nguon phai co mot dong ky vong.
  SO_THIEU=0
  while IFS=$'\t' read -r pt dd ctl quyen; do
    [ -z "$pt" ] && continue
    if ! grep -qP "^\Q$pt\E\t\Q$dd\E\t" "$KY_VONG_FILE"; then
      hong "THIEU DONG ky vong: $pt $dd ($ctl) — them vao scripts/ma-tran-quyen.txt"
      SO_THIEU=$((SO_THIEU+1))
    fi
  done < <(python3 scripts/liet-ke-endpoint.py)
  [ "$SO_THIEU" = "0" ] && dat "Moi endpoint deu co dong ky vong"

  # 6b. Nguoc lai: dong thua (endpoint da xoa) cung phai bao.
  SO_THUA=0
  DS_MA_NGUON="$TMP/ds-ma-nguon.txt"
  python3 scripts/liet-ke-endpoint.py | cut -f1,2 > "$DS_MA_NGUON"
  while IFS=$'\t' read -r pt dd _ _ _ _ _; do
    if ! grep -qP "^\Q$pt\E\t\Q$dd\E$" "$DS_MA_NGUON"; then
      hong "DONG THUA trong ma-tran-quyen.txt: $pt $dd — endpoint nay khong con"
      SO_THUA=$((SO_THUA+1))
    fi
  done < "$KY_VONG_FILE"
  [ "$SO_THUA" = "0" ] && dat "Khong co dong ky vong thua"

  # 6c. Goi that, doi chieu tung o.
  SO_LECH=0; SO_O=0; SO_KHONG_KET_LUAN=0
  while IFS=$'\t' read -r pt dd c1 c2 c3 c4 c5; do
    o=("$c1" "$c2" "$c3" "$c4" "$c5")
    for i in 0 1 2 3 4; do
      mong="${o[$i]}"
      [ "$mong" = "SAU" ] && continue
      em="${EMAIL_VAI[$i]}"
      tk=""
      if [ -n "$em" ]; then
        tk="${TOKEN_CUA[$em]:-}"
        [ -z "$tk" ] && continue   # tai khoan hong da bao o khoi 4
      fi
      m="$(ma "$pt" "$(thay_id "$dd")" "$tk")"
      SO_O=$((SO_O+1))
      case "$mong" in
        # Spring MVC giai va kiem tham so cua phuong thuc TRUOC khi chay chot
        # @PreAuthorize. Nen mot nguoi khong du quyen gui kem than rong hay
        # thieu tham so bat buoc se nhan 400 chu khong phai 403 — chot quyen
        # chua kip chay. Phep chan van con nguyen: gui dung dinh dang thi
        # dung 403 (da do tay: GET /api/admin/audit-logs thieu tham so -> 400,
        # du tham so -> 403; POST /api/events than {} -> 400, than hop le ->
        # 403). Va khach chua dang nhap van bi chan 401 o tang filter, truoc
        # ca MVC.
        #
        # Vi vay 400/415 la KHONG KET LUAN DUOC, khong phai loi. Con 2xx hay
        # 404 thi la loi that: ca hai deu co nghia than phuong thuc DA chay,
        # tuc chot quyen khong he ton tai — dung loai lo hong cua
        # /calibration-rounds/{id}/distribution ngay xua.
        CAM) case "$m" in
               401|403)  ;;
               400|415)  SO_KHONG_KET_LUAN=$((SO_KHONG_KET_LUAN+1)) ;;
               *) hong "LECH QUYEN: ${VAI[$i]} $pt $dd -> $m (ky vong CAM: phai bi chan)"
                  SO_LECH=$((SO_LECH+1)) ;;
             esac ;;
        CHO) if [ "$m" = "401" ] || [ "$m" = "403" ]; then
               hong "LECH QUYEN: ${VAI[$i]} $pt $dd -> $m (ky vong CHO: khong duoc chan)"
               SO_LECH=$((SO_LECH+1)); fi ;;
      esac
    done
  done < "$KY_VONG_FILE"
  if [ "$SO_LECH" = "0" ]; then
    dat "Doi chieu $SO_O o ma tran quyen: khop hoan toan"
  fi
  # Neu im lang ve so o khong ket luan duoc thi bo kiem trong chac chan hon
  # thuc te. Noi ro ra de nguoi doc biet phan nao chua duoc phu.
  if [ "${SO_KHONG_KET_LUAN:-0}" -gt 0 ]; then
    bo_qua "$SO_KHONG_KET_LUAN o tra 400/415 — chot quyen chua kip chay, khong ket luan duoc (da co unit test rieng)"
  fi
fi

# ==========================================================================
khoi "KHOI 7/8 — Trinh duyet that: moi trang x moi vai"
# ==========================================================================
# Loi "doi truong khong moi duoc thanh vien" va 28 chuoi tieng Anh con sot
# deu khong test nao o tang jsdom bat duoc. Chi mo trinh duyet that moi thay.
if [ "${BE_SONG:-0}" != "1" ]; then
  bo_qua "Trinh duyet: backend khong chay"
elif [ "${BO_QUA_TRINH_DUYET:-0}" = "1" ]; then
  bo_qua "Trinh duyet: bo qua theo BO_QUA_TRINH_DUYET=1"
elif ! (cd frontend && node -e "require.resolve('playwright')") >/dev/null 2>&1; then
  bo_qua "Trinh duyet: chua cai playwright o frontend/"
else
  (cd bff && node dist/main.js >"$TMP/bff-run.log" 2>&1) &
  PID+=($!)
  (cd frontend && npx vite preview --port $CONG_FE --strictPort >"$TMP/fe-run.log" 2>&1) &
  PID+=($!)

  if ! cho_cong $CONG_BFF 60 "$TMP/bff-run.log"; then
    hong "BFF khong khoi dong duoc"; tail -10 "$TMP/bff-run.log"
  elif ! cho_cong $CONG_FE 60 "$TMP/fe-run.log"; then
    hong "Frontend khong phuc vu duoc ban da build"; tail -10 "$TMP/fe-run.log"
  else
    dat "BFF va frontend deu len"
    if (cd frontend && node ../scripts/kiem-tra-giao-dien.mjs "http://localhost:$CONG_FE") \
         >"$TMP/ui.log" 2>&1; then
      grep '✓' "$TMP/ui.log" | sed 's/^/  /' | head -30
      dat "Trinh duyet: moi trang x moi vai deu sach"
    else
      # Phai dung process substitution: neu dung ong dan thi vong lap chay
      # trong shell con va moi lan tang SO_LOI deu mat khi thoat.
      while IFS= read -r d; do
        hong "$(printf '%s' "$d" | sed 's/^[[:space:]]*✗[[:space:]]*//')"
      done < <(grep '✗' "$TMP/ui.log")
      # Neu script chet truoc khi kip bao gi (vi du thieu trinh duyet).
      grep -q '✗' "$TMP/ui.log" || { hong "Quet giao dien that bai"; tail -10 "$TMP/ui.log"; }
    fi
  fi
  giai_phong_cong $CONG_FE; giai_phong_cong $CONG_BFF
fi

# ==========================================================================
khoi "KHOI 8/8 — So trong tai lieu phai khop so that"
# ==========================================================================
# Huy hieu README tung ghi 98 test backend trong khi thuc te la 424. Con so
# sai trong tai lieu la thu thay gio bao ve moi lo ra, nen kiem luon. Dem so
# test THAT o ca ba tang roi doi chieu voi moi con so README noi la so test.
# Phai boc ma mau ANSI truoc khi doc so: chay tay thi dau ra di qua ong dan
# nen vitest khong to mau va mau 'Tests +[0-9]+' khop binh thuong, con tren
# CI thi no to mau va chen ma thoat vao GIUA chu 'Tests' va con so. Lan chay
# dau tren CI vi vay in ra 'frontend=?' — phep kiem tu lang di mot tang ma
# khong bao gi.
dem_test() {  # dem_test <tep nhat ky> <bieu thuc>
  [ -f "$1" ] || return 0
  sed 's/\x1b\[[0-9;]*[mGKH]//g' "$1" \
    | grep -oE "$2" | grep -oE '[0-9]+' | tail -1
}
SO_TEST_FE=$(dem_test "$TMP/frontend-test.log"  'Tests[: ]+[0-9]+ passed')
SO_TEST_BFF=$(dem_test "$TMP/bff-test.log"      'Tests[: ]+[0-9]+ passed')

KQ_SO="$(BE="${SO_TEST_BE:-}" FE="${SO_TEST_FE:-}" BFF="${SO_TEST_BFF:-}" python3 - <<'PYEOF'
import os, re, sys

that = {"backend": os.environ.get("BE"), "frontend": os.environ.get("FE"),
        "bff": os.environ.get("BFF")}
doc = open("README.md", encoding="utf-8").read()
loi = []

# "146 unit tests Frontend", "424 test Backend", "19 tests BFF"
for so, _, tang in re.findall(
        r"(\d+)\s+((?:unit|integration|bai)\s+)?tests?\s+(Frontend|Backend|BFF)",
        doc, re.IGNORECASE):
    t = that.get(tang.lower())
    if t and so != t:
        loi.append(f"README ghi {so} test {tang}, thuc te {t}")

# Huy hieu kieu .../tests-424-brightgreen
for so in set(re.findall(r"tests?-(\d+)", doc)):
    if so not in {v for v in that.values() if v}:
        loi.append(f"Huy hieu README ghi {so} test, khong khop tang nao "
                   f"(backend={that['backend']}, frontend={that['frontend']}, bff={that['bff']})")

print("\n".join(loi))
PYEOF
)"
if [ -z "$KQ_SO" ]; then
  dat "So test trong README khop thuc te (backend=${SO_TEST_BE:-?}, frontend=${SO_TEST_FE:-?}, bff=${SO_TEST_BFF:-?})"
else
  while IFS= read -r d; do [ -n "$d" ] && hong "$d"; done <<< "$KQ_SO"
fi

# Hai tu dien ngon ngu phai cung bo khoa: thieu mot ben thi ham t() tra ve
# chinh khoa va man hinh hien "dashboard.title" thay vi chu tieng Viet.
LECH_KHOA="$(cd frontend && npx tsx -e "
import { translations } from './src/locales/translations.ts';
const vi = Object.keys(translations.vi), en = Object.keys(translations.en);
const a = vi.filter(k => !en.includes(k)), b = en.filter(k => !vi.includes(k));
if (a.length || b.length) console.log('thieu o en: '+a.join(',')+' | thieu o vi: '+b.join(','));
" 2>/dev/null)"
if [ -z "$LECH_KHOA" ]; then
  dat "Tu dien vi/en cung bo khoa"
else
  hong "Tu dien vi/en lech khoa — $LECH_KHOA"
fi

# ==========================================================================
khoi "TONG KET"
# ==========================================================================
printf '  Dat  : %d\n' "$SO_DAT"
printf '  Hong : %d\n' "$SO_LOI"
if [ "$SO_LOI" -gt 0 ]; then
  printf '\n\033[1mDanh sach van de\033[0m\n'
  for l in "${DANH_SACH_LOI[@]}"; do printf '  - %s\n' "$l"; done
  printf '\n\033[31mKHONG DAT\033[0m\n'
  exit 1
fi
printf '\n\033[32mDAT — he thong chay sach tu dau den cuoi\033[0m\n'
exit 0
