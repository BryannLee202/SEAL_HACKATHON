@echo off
setlocal enabledelayedexpansion
cd /d "%~dp0"

echo ===============================================================================
echo   SHMS - SEAL HACKATHON MANAGEMENT SYSTEM
echo   CHUONG TRINH KHOI DONG HE THONG VA DEMO (ONE-CLICK LAUNCHER)
echo ===============================================================================
echo.

:: 1. Kiem tra va khoi tao tep .env chuan
if not exist ".env" (
    echo [THONG BAO] Chua co tep .env, dang tu dong khoi tao tep .env chuan...
    (
        echo # Configuration for SHMS Hackathon
        echo JWT_SECRET=c2VhbF9zdXBlcl9zZWNyZXRfand0X2tleV9mb3JfaGFja2F0aG9uX2RlbW9fMjAyNg==
        echo AI_ENABLED=false
        echo AI_API_KEY=
        echo AI_MODEL=gemini-1.5-flash
    ) > .env
    echo [THANH CONG] Da tao tep .env hop le cho buoi demo!
) else (
    echo [OK] Tep cau hinh moi truong .env da san sang.
)
echo.

:: 2. Menu lua chon che do khoi dong
echo Vui long chon che do khoi dong phu hop:
echo.
echo   [1] KHOI DONG TRON GOI VOI DOCKER COMPOSE (Khuyen dung - 1 Click chay 4 Container ngam)
echo   [2] KHOI DONG CUC BO (Local Dev - 3 cua so Terminal tu dong, khong can Docker)
echo   [3] CHAY BO KIEM THU TU DONG (Automated Tests - 146 Vitest + 424 JUnit + 19 Jest + RTM)
echo   [4] DUNG TOAN BO CAC CONTAINER DOCKER (Stop Docker)
echo   [5] Thoat
echo.
set /p CHOICE="Nhap lua chon cua ban [1-5] (Mac dinh: 1): "
if "%CHOICE%"=="" set CHOICE=1

if "%CHOICE%"=="1" goto START_DOCKER
if "%CHOICE%"=="2" goto START_LOCAL_DEMO
if "%CHOICE%"=="3" goto RUN_TESTS
if "%CHOICE%"=="4" goto STOP_DOCKER
if "%CHOICE%"=="5" goto EXIT_SCRIPT

:START_DOCKER
echo.
echo [DOCKER] Dang kiem tra trang thai Docker Engine...
docker info >nul 2>&1
if %ERRORLEVEL% neq 0 (
    echo [CANH BAO] Docker Desktop chua bat hoac chua san sang!
    echo Tu dong chuyen sang Che do [2] Khoi dong Cuc bo (Local Mode)...
    timeout /t 3 /nobreak >nul
    goto START_LOCAL_DEMO
)

echo [DOCKER] Dang dung 4 Container: Database, Backend, BFF Gateway, Frontend...
echo          docker-compose.yml bat container sau cho khoe (healthy) container truoc
echo          (Postgres -^> Backend -^> BFF -^> Frontend), nen LAN DAU chay co the mat
echo          vai phut de tai/dung image + cho Backend khoi dong xong Flyway. Trong
echo          luc do man hinh se KHONG in them dong nao - do la BINH THUONG, dung tat
echo          cua so nay.
echo.
docker compose up -d
if %ERRORLEVEL% neq 0 (
    echo.
    echo [LOI] Docker Compose khong dua duoc dich vu len!
    echo Nguyen nhan thuong gap nhat: mot container khong "healthy" dung han - vi du
    echo Backend cham Flyway lau hon du kien, hoac cong 3000/4000/8080/5432 dang bi
    echo chuong trinh khac chiem. Xem chi tiet tung dich vu bang lenh:
    echo     docker compose logs
    echo Hoac chon Che do [2] de chay cuc bo, khong can Docker.
    pause
    goto :eof
)

echo.
echo [DOCKER] Ca 4 container da bao khoe manh. Dang doi Frontend tra loi tren cong
echo          3000 truoc khi mo trinh duyet (toi da 60 giay)...
powershell -NoProfile -Command "$ok=$false; for($i=0;$i -lt 30;$i++){ try { $r = Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:3000/' -TimeoutSec 2; if ($r.StatusCode -eq 200) { $ok=$true; break } } catch {}; Start-Sleep -Seconds 2 }; if ($ok) { Write-Host '[OK] Frontend da tra loi.' } else { Write-Host '[CANH BAO] Frontend chua tra loi sau 60 giay - van mo trinh duyet, neu trang trang thi doi them roi bam F5, hoac xem: docker compose logs frontend' }"

echo.
echo ===============================================================================
echo   HE THONG DOCKER DA SAN SANG!
echo   - Frontend Web App:     http://localhost:3000
echo   - BFF Gateway (NestJS): http://localhost:4000
echo   - Backend Spring Boot:  http://localhost:8080
echo   - Swagger API Docs:     http://localhost:8080/swagger-ui.html
echo.
echo   Tai khoan Demo san sang (Mat khau chung: Demo@123456):
echo   - Ban to chuc:  coordinator@demo.local
echo   - Giam khao 1:  judge1@demo.local
echo   - Giam khao 2:  judge2@demo.local
echo   - Mentor:       mentor1@demo.local
echo   - Doi thi:      leader@demo.local
echo [THONG BAO] Che do Docker chay ngam 4 Container ben trong Docker Desktop.
echo             He thong KHONG tao them cac cua so CMD rieng de tranh lam roi man hinh.
echo             Trinh duyet Web vua duoc mo tu dong (de len tren cua so CMD nay).
echo.
echo             Neu ban muon nhin thay 3 cua so CMD chay chu tung dich vu, hay chon Che do [2]!
echo ===============================================================================
echo.
echo Dang tu dong mo trinh duyet truy cap Web App...
start http://localhost:3000
pause
goto :eof

:START_LOCAL_DEMO
echo.
echo ===============================================================================
echo   DANG KHOI DONG HE THONG O CHE DO CUC BO (LOCAL MODE)...
echo   (Su dung H2 in-memory Database va nap san du lieu mau tu data-demo.sql)
echo ===============================================================================
echo.

:: Kiem tra node_modules
if not exist "bff\node_modules" (
    echo [BFF] Dang cai dat thu vien cho BFF Gateway...
    pushd bff
    call npm install
    popd
    echo.
)

if not exist "frontend\node_modules" (
    echo [Frontend] Dang cai dat thu vien cho Frontend...
    pushd frontend
    call npm install
    popd
    echo.
)

echo [1/3] Dang mo Terminal cho Backend Spring Boot (cong 8080, Profile Demo)...
echo       (Lan dau chay se lau hon - Maven tai thu vien ve neu chua co san)
start "SHMS [1] - Backend Spring Boot" cmd /k "cd /d "%~dp0backend" && mvnw.cmd spring-boot:run -Dspring-boot.run.profiles=demo"

echo [2/3] Dang mo Terminal cho BFF Gateway NestJS (cong 4000)...
start "SHMS [2] - BFF Gateway NestJS" cmd /k "cd /d "%~dp0bff" && npm run start:dev"

echo [3/3] Dang mo Terminal cho Frontend React 19 (cong 3000)...
start "SHMS [3] - Frontend React 19" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Dang doi Backend va BFF san sang truoc khi mo trinh duyet (toi da 90 giay)...
echo Ba cua so CMD rieng se tiep tuc chay ben duoi de anh xem nhat ky tung dich vu.
powershell -NoProfile -Command "$be=$false; $bff=$false; for($i=0;$i -lt 45;$i++){ if(-not $be){ try { $r=Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:8080/actuator/health' -TimeoutSec 2; if($r.StatusCode -eq 200){$be=$true; Write-Host '[OK] Backend da san sang (cong 8080)'} } catch {} }; if(-not $bff){ try { $r=Invoke-WebRequest -UseBasicParsing -Uri 'http://localhost:4000/health' -TimeoutSec 2; if($r.StatusCode -eq 200){$bff=$true; Write-Host '[OK] BFF da san sang (cong 4000)'} } catch {} }; if($be -and $bff){break}; Start-Sleep -Seconds 2 }; if(-not ($be -and $bff)){ Write-Host '[CANH BAO] Chua thay du Backend va BFF san sang sau 90 giay - xem lai 3 cua so CMD, co the Maven/npm van dang tai thu vien lan dau.' }"

echo.
echo ===============================================================================
echo   CA 3 DICH VU DA DUOC KHOI DONG TRONG CAC CUA SO RIENG BIET!
echo   - Frontend Web App:     http://localhost:3000
echo   - BFF Gateway (NestJS): http://localhost:4000
echo   - Backend Spring Boot:  http://localhost:8080
echo.
echo   Tai khoan Demo san sang (Mat khau chung: Demo@123456):
echo   - Ban to chuc:  coordinator@demo.local
echo   - Giam khao 1:  judge1@demo.local
echo   - Giam khao 2:  judge2@demo.local
echo   - Mentor:       mentor1@demo.local
echo   - Doi thi:      leader@demo.local
echo ===============================================================================
echo.
echo Dang tu dong mo trinh duyet truy cap Web App...
start http://localhost:3000
pause
goto :eof

:RUN_TESTS
echo.
echo Dang chuyen tiep toi chuong trinh kiem thu tu dong hoa toan dien...
call run-automated-tests.bat
goto :eof

:STOP_DOCKER
echo.
echo Dang dung toan bo cac container Docker cua SHMS...
docker compose down
echo [OK] Da dung thanh cong!
pause
goto :eof

:EXIT_SCRIPT
echo Tam biet!
