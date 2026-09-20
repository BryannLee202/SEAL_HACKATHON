# Nhat ky Thay doi (Changelog)

Tat ca cac thay doi dang ke cua he thong **SHMS (SEAL Hackathon Management System)** se duoc ghi nhan tai tai lieu nay.  
Dinh dang nhat ky tuan thu chat che theo chuan [Keep a Changelog](https://keepachangelog.com/en/1.0.0/) va ap dung nguyen tac [Semantic Versioning](https://semver.org/).

---

## [1.7.0] - 2026-09-20

### Fixed (Sua loi)
- **Chan xoa cheo tieu chi giua cac vong thi (PR #89)**:
  - `RoundCriterionService.remove()` truoc day chi tim tieu chi theo id roi xoa, khong doi chieu `roundId` tren URL - trong khi `update()` da doi chieu tu dau. Lo hong nay vo hieu luon khoa "vong thi da co diem": goi `DELETE /api/rounds/{vongChuaChamDiem}/criteria/{tieuChiCuaVongDangCham}` se xoa tieu chi cua vong dang cham do, keo theo toan bo diem giam khao da nhap.
- **Gom truy van bang xep hang trong `PrizeService.autoAssign` (PR #91)**:
  - Su kien 4 hang muc x 3 giai + 3 giai toan cuoc truoc day ton 15 truy van; nay con 1.
- **Ap tran trong so 100 ngay tai mau tieu chi (PR #94)**:
  - `RoundService.create()` sao nguyen xi tieu chi cua mau vao vong thi bang `saveAll()`, khong di qua `RoundCriterionService.add()`, nen luat trong so bi di vong hoan toan. Mot mau tong 150 se de ra vong thi tong 150 va diem quy doi cua moi doi deu sai ma khong co thong bao loi nao.
- **Nop lai diem hieu chuan thi cap nhat thay vi chen them (PR #96)**:
  - Bang `calibration_score` co `UNIQUE (calibration_round_id, judge_id, criterion_id)`, nhung `submitScores()` moi lan nop deu dung ban ghi moi. Giam khao cham nham mot tieu chi roi nop lai la dam vao rang buoc do va nhan thong bao chung chung, khong co cach nao sua diem.
- **Dong bo tai khoan demo giua hai duong nap du lieu (PR #97)**:
  - `data-demo.sql` (H2) thieu `leader@demo.local`, `V006` (Postgres) thieu `mentor1@demo.local`, trong khi README liet ke ca hai. Dang nhap vai thi sinh o ban demo truoc day that bai voi 401.

### Added (Them moi)
- **Luat chuyen trang thai su kien (PR #89)**:
  - Khai bao bang chuyen hop le bang `EnumMap`; buoc khong hop le tra ve `409` kem danh sach buoc con di duoc. Truoc day mot su kien da `CLOSED` van quay nguoc ve `DRAFT` duoc.
- **Dong va mo lai phien hieu chuan (PR #95)**:
  - Them `PATCH /api/calibration-rounds/{id}/status` (chi `COORDINATOR`). Co `active` truoc day la co chet: dat `true` luc tao roi khong endpoint nao dat duoc ve `false`, du giao dien da loc theo no o hai cho. `submitScores()` nay tu choi `409` khi phien da dong.
- **Bo sung kiem thu Backend, 123 -> 194 test**:
  - `RoundCriterionServiceTest` 9 test (PR #89), `CalibrationServiceTest` 8 -> 18 test (PR #90, #95, #96), `VarianceDashboardServiceTest` 6 test (PR #90), `ReportExportServiceTest` 4 test va `AuditLogQueryServiceTest` 6 test (PR #92), `TeamFeedbackServiceTest` 11 test (PR #93), `CriteriaTemplateServiceTest` 10 test (PR #94).
  - Moi mo-dun deu duoc kiem nguoc: co tinh lam hong lai ma nguon de xac nhan test that su bat duoc loi chu khong chi chay qua.
- **Migration `V007__demo_seed_mentor.sql` (PR #97)**:
  - Viet thanh migration moi thay vi sua `V006` da duoc ap dung, tranh loi sai checksum Flyway.

### Changed (Thay doi)
- **Cap nhat so lieu kiem thu trong tai lieu (PR #97)**:
  - `README.md` va `run-automated-tests.bat` con ghi 94 backend test (thuc te 194) va `Spring Boot 3.x` (thuc te 4.1.0). Bo sung dong kiem thu BFF (19 test).

---

## [1.6.0] - 2026-09-16

### Added (Them moi)
- **Chuong trinh Chay kiem thu Tu dong 1-click (PR #78)**:
  - `run-automated-tests.bat`: Chay tu dong xac thuc RTM, 94 backend JUnit tests, 101 frontend Vitest tests va tsc typecheck voi giao dien dong lenh truc quan.
- **Chuong trinh Khoi dong He thong 1-click (PR #79)**:
  - `start-system.bat`: Tu dong khoi tao tep `.env` mac dinh an toan va menu khoi chay Docker Compose / PostgreSQL nhanh chong cho buoi bao ve do an.
- **Ban do Ma nguon He thong Toan dien (PR #80)**:
  - `docs/08-report-prep/BAN_DO_SOURCE.md`: Ban do cau truc chi tiet toan bo ma nguon Backend, Frontend, BFF, CSDL va anh xa day du 27 Use Cases, 6 Business Rules (BR-01 den BR-06).
- **Cam nang On tap & Van dap Phan bien Nhanh (PR #81)**:
  - `docs/08-report-prep/ON_TAP_NHANH.md`: Bo 30+ cau hoi - dap chuyen sau phan chia theo 6 linh vuc chuyen mon cua 6 thanh vien trong nhom (Spring Boot, BFF, JWT HttpOnly, CSRF, AI Hybrid, Heuristic Fallback, Z-Score Calibration, RTM).
- **Danh muc Kiem tra Truoc gio G & Kich ban Demo 5 phut (PR #82)**:
  - `docs/08-report-prep/VIVA_DEFENSE_CHECKLIST.md`: Danh muc kiem tra thiet bi, danh sach tai khoan demo san sang, kich ban demo 5 phut mau va ke hoach du phong su co B.
- **Phat hanh Phien ban v1.6.0 Production Ready & Cap nhat README (PR #83)**:
  - Cap nhat `README.md` huong dan cac script 1-click va lien ket toi toan bo ho so bao ve do an.

---

## [1.5.0] - 2026-09-16

### Added (Them moi)
- **Tang AI Core Service & REST API phong thu (PR #72)**:
  - Xay dung `AiConfigurationProperties.java` ho tro doc `AI_API_KEY`, `app.ai.model`, `app.ai.endpoint` an toan qua bien moi truong.
  - Xay dung `AiAssistantService.java` goi client HTTP Java 21 nguyen ban toi LLM chat completions voi nhiet do thap `0.1` kem co che Heuristic Fallback tu dong khi offline.
  - Cung cap REST API `/api/ai/status` va `/api/ai/submissions/{submissionId}/analyze`.
  - Bao ve boi bo test `AiAssistantServiceTest.java` (3 unit tests).
- **AI Goi y Nhan xet Cham thi theo Rubric (PR #73)**:
  - Cung cap DTOs `AiFeedbackSuggestionRequestDto` va `AiFeedbackSuggestionResponseDto`.
  - Trien khai logic sinh nhan xet phan cap theo muc diem (>= 85, >= 70, < 70) voi diem noi bat va de xuat cai tien tai endpoint `/api/ai/rubric-feedback/suggest`.
  - Bao ve boi cac unit test danh gia diem cao/trung binh (tong 5 unit tests backend AI).
- **Dong co AI Offline Fallback & Tien trinh Phan tich da giai doan (PR #74)**:
  - `mockAiEngine.ts`: Dong co sinh phan tich, goi y nhan xet va hoi dap the le cuoc thi offline 100%.
  - `useAiProgress.ts`: Hook quan ly 4 giai doan phan tich truc quan (`READING` -> `EVALUATING` -> `FORMULATING` -> `COMPLETED`).
  - `aiApi.ts`: Client API hybrid an toan tuyet doi.
  - Bo test Vitest `mockAiEngine.test.ts` pass 100%.
- **Tich hop Tro ly Giam khao AI tren JudgePage (PR #75)**:
  - Trang bi nut `✨ Trợ lý AI` va `✨ AI Gợi ý nhận xét` ngay tren tung the cham thi `SubmissionScoreCard`.
  - Hop thoai Modal phan tich giai phap, diem manh, rui ro va danh sach cau hoi phan bien chuyen sau giup giam khao van dap thi sinh.
  - Tinh nang dien tu dong ban nhap nhan xet AI vao o danh gia cua giam khao.
- **Hop thoai SEAL Mascot Chatbot Tu van The le (PR #76)**:
  - Nâng cap mascot thanh `MascotChatDrawer.tsx` gan xuyen suot thanh dieu huong `Layout.tsx`.
  - Ho tro cac nut hoi dap nhanh the le: BR-01 (quy mo doi), BR-02 (nop muon), BR-03 (xung dot loi ich), BR-04 (rubric), BR-06 (xuat CSV).
- **Tai lieu Kien truc ADR-004 & Dac ta API AI (PR #77)**:
  - Bo sung `ADR-004: Kien truc Tich hop Tri tue Nhan tao Hybrid va Co che Phong thu Da lop`.
  - Bo sung dac ta ky thuat `docs/05-api/ai-api.md`.

---

## [1.4.0] - 2026-09-16

### Added (Them moi)
- **Kiem tra gioi han toi thieu thanh vien doi thi (BR-01, PR #66)**:
  - Bo sung phuong thuc `countByTeamId(UUID teamId)` trong `TeamMemberRepository.java`.
  - Chan nop bai neu doi thi co duoi 3 thanh vien trong `SubmissionService.java`, nem loi `ApiException.badRequest("Đội thi phải có tối thiểu 3 thành viên mới đủ điều kiện nộp bài")`.
  - Kiem thu bao phu day du trong `SubmissionServiceTest.java`.
- **Tu dong phat nop muon trong bang xep hang (BR-02, PR #67)**:
  - Bo sung co che tinh diem phat nop muon trong `RankingService.java`: chiet khau tu dong 10% tong diem co trong so neu bai nop co trang thai `isLate() == true`.
  - Kiem thu bao phu tinh toan diem tru va lam tron trong `RankingServiceTest.java`.
- **Ngan chan xung dot loi ich hai chieu giua Mentor va Giam khao (BR-03, PR #68)**:
  - Bo sung truy van kiem tra phan quyen theo pham vi `existsByUserIdAndRoleNameAndScopeTypeAndScopeIdIn` trong `UserRoleAssignmentRepository.java`.
  - Bo sung kiem tra cheo 2 chieu tai `JudgeAssignmentService.java`: khong cho phep Mentor lam Giam khao va nguoc lai trong cung mot su kien hackathon.
  - Xay dung bo test moi `JudgeAssignmentServiceTest.java` voi 5 test cases kiem thu toan dien.
- **Xuat bang xep hang ra dinh dang CSV (BR-06, PR #69 & PR #70)**:
  - Xay dung API backend xuat bang diem CSV `exportCsv()` va `exportCsvByRound()` tai `RankingService.java`, cung cap cac endpoint `GET /api/rounds/{roundId}/rankings/export` va `GET /api/public/rankings/rounds/{roundId}/export`.
  - Tich hop nut UI tai file CSV trong `RankingPage.tsx` voi trang thai `isLoading` va ho tro ca tieng Viet/tieng Anh.
  - Kiem thu backend `RankingServiceTest.java` va frontend `RankingPage.test.tsx` (92/92 tests pass).
- **Cap nhat Bao cao Phan tich Khoang trong Quy tac Nghiep vu (PR #71)**:
  - Nang cap toan dien `docs/02-analysis/business-rules-gap-analysis.md` ghi nhan 100% quy tac nghiep vu (BR-01 den BR-06) da duoc trien khai va dong goi kiem thu tu dong.

---

## [1.3.0] - 2026-09-16

### Added (Them moi)
- **He thong Design System & UI Components nguyen tu (PR #60)**:
  - Cac component tai su dung cao: `Button` (variants primary, secondary, danger, ghost; sizes sm, md, lg; trang thai loading/disabled), `Badge` (variants success, warning, danger, primary, info, neutral), `Card` (CardHeader, CardTitle, CardContent, CardFooter).
  - Barrel export chuan tai `frontend/src/components/ui/index.ts`.
- **Hop nhat phan hoi trang thai & Motion Tokens (PR #61)**:
  - Component `StateFeedback` hop nhat ba trang thai: dang tai (loading spinner), trong (empty data icon/description), va loi (error message voi nut thu lai onRetry).
  - Bo Motion Tokens chuan hoa animation va transition trong `index.css`: `--motion-duration-*`, `--motion-ease-*`.
- **Hop thoai Modal Dialog chuan muc (PR #62)**:
  - Component `Modal` ho tro backdrop blur, khoa cuon trang tu dong (`overflow: hidden`), dong bang phim `Escape` va click overlay, day du tieu chuan a11y ARIA (`role="dialog"`, `aria-modal="true"`).
- **Che do Giao dien Dark Mode & Tuong phan truc quan (PR #63)**:
  - `ThemeContext` ho tro 3 che do: `light`, `dark`, `system` (tu dong theo `prefers-color-scheme`), luu tru qua `localStorage`.
  - Bien CSS Dark Theme toan dien trong `index.css` voi bang mau toi chuyen nghiep va do tuong phan cao.
  - Component `ThemeToggle` chuyen doi nhanh giao dien kem hieu ung icon muot ma.
- **He thong Da ngon ngu Song ngu VI/EN (i18n) (PR #64)**:
  - Tu dien song ngu toan dien tai `frontend/src/locales/translations.ts` ho tro Tieng Viet va Tieng Anh cho toan bo dieu huong, hanh dong, trang thai va bang dieu khien.
  - `LanguageContext` voi hook `useLanguage` va ham `t()` an toan ve mat kieu, ho tro noi suy tham so (interpolation) va fallback an toan.
  - Component `LanguageSwitcher` truc quan voi bieu tuong quoc ky va ma ngon ngu.
- **Tich hop giao dien toan dien vao Layout & Dashboard (PR #65)**:
  - Dong bo thanh dieu huong `Layout` voi `ThemeToggle`, `LanguageSwitcher` va cac nhan menu song ngu.
  - Cap nhat `DashboardPage` su dung `Button`, `Card` va he thong da ngon ngu.
  - Bo sung test bao phu toan dien cho `Layout`, `Modal`, `StateFeedback`, `ThemeContext`, `LanguageContext`, nang tong so unit test frontend tu 58 tests len **90 tests** (pass 100%).

---

## [1.2.0] - 2026-09-15

### Added (Them moi)
- **Docker CI Pipeline**: Workflow `.github/workflows/docker-ci.yml` tu dong xac thuc cu phap Docker Compose va build thu cac Dockerfile khi co thay doi ve ha tang container.
- **BFF CI Pipeline**: Workflow `.github/workflows/bff-ci.yml` tu dong cai dat, bien dich TypeScript va chay 19 test Jest cho tang BFF NestJS.
- **Bo kiem thu Unit Test Backend moi (28 tests)**:
  - `DisqualificationServiceTest`: 6 tests kiem thu xu ly vi pham doi thi, bai nop va nhat ky kiem toan.
  - `PrizeServiceTest`: 7 tests kiem thu co cau giai thuong, tu dong trao giai theo ket qua xep hang va thu hoi giai.
  - `MentorServiceTest`: 2 tests kiem thu phan quyen huong dan theo track.
  - `AuditServiceTest`: 3 tests kiem thu ghi log kiem toan he thong va nguoi dung.
  - `PublicVotingServiceTest`: 10 tests kiem thu loc su kien, bo phieu cong khai, chong gian lan va gioi han tran IP.
  - Nang tong so test backend tu 53 tests len 81 tests (tang 52.8% do phu).
- **Giam sat Nginx & Endpoint `/health`**:
  - Bo sung route `/health` tra ve HTTP 200 trong `frontend/nginx.conf`.
  - Them chi thi `HEALTHCHECK` trong `frontend/Dockerfile` va service `frontend` trong `docker-compose.yml`.

### Security (Bao mat)
- **Container chay User Non-root**: Chuyen doi tien trinh chay tang BFF NestJS sang user `node` (UID 1000) giup giam thieu rui ro dac quyen container.

---

## [1.1.0] - 2026-09-15

### Added (Them moi)
- **Cau truc tai lieu 8 phan khu**: Khoi tao thu muc `docs/` theo mo hinh tieu chuan cong nghiep gom cac phan khu requirements, analysis, architecture, database, api, testing, deployment va adr.
- **Dac ta SRS Markdown**: Chuyen doi toan bo 208 doan va 49 bang bieu tu dac ta Microsoft Word sang `docs/01-requirements/srs.md` (giu nguyen tinh toan ven va dinh dang bang hop le).
- **Traceability Matrix tu dong hoa**:
  - Tep nguon su that `docs/01-requirements/use-cases.yaml` chuan hoa 27 Use Cases va 108 thanh phan ma nguon/test.
  - Script `scripts/traceability.py` tu dong kiem tra su ton tai cua ma nguon tren o dia va sinh bang Markdown `docs/01-requirements/traceability-matrix.md` dat ty le 100%.
  - Bo sung co `--verify` san sang tich hop CI pipeline de chan dut tinh trang tai lieu lech pha voi code.
  - Bo test tu dong `scripts/test_traceability.py` kiem thu cong cu truy xuat.
- **Bo 3 quyet dinh kien truc (ADR)**:
  - `ADR-001`: Kien truc 3 tang voi Backend-for-Frontend (BFF) NestJS lam API Gateway va quan ly phien.
  - `ADR-002`: Co che xac thuc Token qua Cookie HttpOnly va phong chong CSRF Double-Submit.
  - `ADR-003`: Mo hinh cham diem Rubric da tieu chi co trong so va hieu chuan do lech giam khao (Calibration).
- **Bao cao doi chieu quy tac nghiep vu**: `docs/02-analysis/business-rules-gap-analysis.md` phan tich chuyen sau 5 quy tac nghiep vu cot loi va chi ro 3 diem can cai thien.

---

## [1.0.0] - 2026-09-15

### Added (Them moi)
- **Trang chu theo vai tro (Dashboard Priority IA)**: Thiet ke lai giao dien `/app` theo mo hinh 3 khoi uu tien (Can chu y, Tong quan, Hoat dong gan day) rieng biet cho Ban to chuc (Coordinator) va Giam khao (Judge).
- **Phan cong giam khao theo vong**: Bo sung 4 ban ghi phan cong pham vi `ROUND` vao `data-demo.sql` giup giam khao nhin thay dung cac bai thi duoc giao cham tai `/judge`.
- **Chan quyen man duyet nguoi dung**: Bao ve tuyen duong `/coordinator/users` bang `ProtectedRoute`.

### Changed (Thay doi)
- **Gioi han Request BFF**: Nang nguong `ThrottlerModule` tu 30 len 200 requests/phut de tranh loi chan nham khi tai giao dien nhieu thanh phan.
- **Dong bo CSS & Font tu host**: Loai bo xung dot giua 3 file CSS (`index.css`, `global.css`, `team-mentor.css`), dong thoi nhung font `@fontsource-variable` noi bo giup he thong hoat dong offline khong phu thuoc Google Fonts.

### Fixed (Sua loi)
- **CORS cong 3001**: Bo sung origin `http://localhost:3001` vao danh sach cho phep cua BFF, khac phuc loi `Network Error` khi chay dev theo dung README.
- **Cookie & CSRF tren fetch**: Cap nhat `frontend/src/api/http.ts` gui kem cookie phien (`credentials: 'include'`) va token CSRF cho cac phuong thuc thay doi du lieu.
- **Hien thi EmptyState**: Khac phuc loi chu den tren nen den tai cac trang cong khai `/vote` va `/rankings`.

---

## [0.9.0] - 2026-09-03

### Added (Them moi)
- **Phan he Mentor**: Giao dien `/mentor` cho phep giang vien huong dan theo doi tien do cac doi thi trong track va trao doi phan hoi.
- **Nhat ky He thong (Audit Log)**: Giao dien `/coordinator/audit-logs` ho tro Ban to chuc tra cuu lich su thao tac cham diem, loai doi va phe duyet.
- **Hieu chuan diem so (Calibration)**: Tich hop bang dieu khien phuong sai va thuat toan tinh toan he so hieu chuan giam khao.
- **Du lieu mau Demo chuan**: `backend/src/main/resources/data-demo.sql` gom 1 su kien, 3 hang muc, 2 vong thi, 6 doi thi va 42 luot cham diem day du.

---

## [0.8.0] - 2026-08-20

### Added (Them moi)
- **Cau truc cuoc thi**: Cac API va giao dien quan ly Event, Track, Round va bo tieu chi RoundCriterion.
- **Quan ly doi thi**: Chuc nang tao doi, moi thanh vien qua email, chap nhan loi moi va kiem soat so luong thanh vien.
- **Nop bai du thi**: Ho tro nop link ma nguon, tu dong kiem tra deadline va phan loai trang thai ON_TIME / LATE.
- **Bang xep hang & Binh chon**: Trang cong khai `/rankings` va `/vote` cho phep khach tham quan binh chon truc tuyen.
- **Chinh sach trong so tieu chi**: `CriterionWeightPolicy` dam bao tong trong so luon dat 100%.

### Removed (Go bo)
- Go bo hoan toan quy trinh va hook rang buoc Jira cu de toi gian hoa quy trinh phat trien.

---

## [0.1.0] - 2026-07-28

### Added (Them moi)
- Khoi tao kien truc goc: Spring Boot 4.1 (Java 21), NestJS BFF, React 19 (TypeScript, Vite).
- He thong xac thuc JWT, phan quyen RBAC, Flyway migration V1 den V6.

---

## Danh muc Chi tiet 52 Pull Requests da Merge vao main

| STT | Pull Request | Nhanh nguon | Noi dung thay doi chinh | Phien ban |
|---|---|---|---|---|
| 1 | [**#59**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/59) | task-fix-traceability-ci | Khac phuc cache pip setup-python va bo sung requirements.txt | v1.2.0 |
| 2 | [**#58**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/58) | task-docker-security-healthcheck | Bao mat non-root bff va healthcheck frontend | v1.2.0 |
| 3 | [**#57**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/57) | task-test-backend-services-long | Kiem thu Audit, PublicVoting va Traceability | v1.2.0 |
| 4 | [**#56**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/56) | task-test-backend-services-vy | Kiem thu Disqualification, Prize, Mentor | v1.2.0 |
| 5 | [**#55**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/55) | task-bff-ci-workflow | CI kiem tra build va test Jest tang BFF | v1.2.0 |
| 6 | [**#54**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/54) | task-ci-docker-validate | CI xac thuc Docker Compose va Dockerfile | v1.2.0 |
| 7 | [**#53**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/53) | chuan-hoa-tai-lieu-va-ci-gac | Chuan hoa tai lieu docs va CI gac truy xuat | v1.1.0 |
| 8 | [**#46**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/46) | dashboard-team-mentor | Giao dien trang chu theo vai tro Team va Mentor | v1.0.0 |
| 9 | [**#52**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/52) | gioi-han-tai-nguyen-docker | gioi han tai nguyen docker | v1.1.0 |
| 10 | [**#51**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/51) | chuan-hoa-flyway-migration | chuan hoa flyway migration | v1.1.0 |
| 11 | [**#49**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/49) | lich-su-thay-doi-changelog | lich su thay doi changelog | v1.1.0 |
| 12 | [**#48**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/48) | thiet-ke-kien-truc-adr | thiet ke kien truc adr | v1.1.0 |
| 13 | [**#47**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/47) | traceability-tu-dong | traceability tu dong | v1.1.0 |
| 14 | [**#45**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/45) | khung-docs-va-srs | khung docs va srs | v1.1.0 |
| 15 | [**#44**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/44) | trang-chu-btc-giam-khao | trang chu btc giam khao | v1.0.0 |
| 16 | [**#43**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/43) | font-tu-host | font tu host | v1.0.0 |
| 17 | [**#42**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/42) | bo-du-lieu-gia | bo du lieu gia | v1.0.0 |
| 18 | [**#41**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/41) | dieu-huong-va-quyen | dieu huong va quyen | v1.0.0 |
| 19 | [**#40**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/40) | them-tai-khoan-mentor | them tai khoan mentor | v0.9.0 |
| 20 | [**#39**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/39) | khoi-phuc-test-binh-chon | khoi phuc test binh chon | v0.9.0 |
| 21 | [**#38**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/38) | man-hinh-nhat-ky | man hinh nhat ky | v0.9.0 |
| 22 | [**#37**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/37) | khoi-phuc-docker | khoi phuc docker | v0.9.0 |
| 23 | [**#36**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/36) | viet-lai-readme | viet lai readme | v0.9.0 |
| 24 | [**#35**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/35) | man-hinh-mentor | man hinh mentor | v0.9.0 |
| 25 | [**#34**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/34) | sua-du-lieu-mau-trung-khoa | sua du lieu mau trung khoa | v0.9.0 |
| 26 | [**#33**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/33) | fix-health-env | fix health env | v0.9.0 |
| 27 | [**#32**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/32) | sync-mockdata | sync mockdata | v0.9.0 |
| 28 | [**#31**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/31) | JAV-21-seed-va-public-api | JAV 21 seed va public api | v0.9.0 |
| 29 | [**#29**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/29) | remove-jira | remove jira | v0.8.0 |
| 30 | [**#28**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/28) | JAV-23-coordinator-teams | JAV 23 coordinator teams | v0.8.0 |
| 31 | [**#27**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/27) | ci-backend-test | ci backend test | v0.8.0 |
| 32 | [**#25**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/25) | JAV-24-contestant-team | JAV 24 contestant team | v0.8.0 |
| 33 | [**#24**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/24) | JAV-19-team-submission | JAV 19 team submission | v0.8.0 |
| 34 | [**#23**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/23) | JAV-21-trang-cong-khai | JAV 21 trang cong khai | v0.8.0 |
| 35 | [**#22**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/22) | JAV-14-team-api | JAV 14 team api | v0.8.0 |
| 36 | [**#21**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/21) | JAV-11-cong-khai | JAV 11 cong khai | v0.8.0 |
| 37 | [**#21**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/21) | JAV-11-cong-khai | JAV 11 cong khai | v0.8.0 |
| 38 | [**#20**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/20) | JAV-12-event-track-round | JAV 12 event track round | v0.8.0 |
| 39 | [**#19**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/19) | JAV-14-team-mentor-ui | JAV 14 team mentor ui | v0.8.0 |
| 40 | [**#19**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/19) | JAV-14-team-mentor-ui | JAV 14 team mentor ui | v0.8.0 |
| 41 | [**#16**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/16) | BE-cham-diem: | dua bo backend day du vao main | v0.8.0 |
| 42 | [**#12**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/12) | claude/restore-status | claude/restore status | v0.1.0 |
| 43 | [**#11**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/11) | claude/fix-remove-link-415 | claude/fix remove link 415 | v0.1.0 |
| 44 | [**#10**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/10) | claude/fix-link-scope | claude/fix link scope | v0.1.0 |
| 45 | [**#9**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/9) | claude/fix-jira-dev-links | claude/fix jira dev links | v0.1.0 |
| 46 | [**#8**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/8) | claude/jira-close-done | claude/jira close done | v0.1.0 |
| 47 | [**#7**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/7) | claude/jira-fe-demo | claude/jira fe demo | v0.1.0 |
| 48 | [**#6**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/6) | claude/jira-backend-split | claude/jira backend split | v0.1.0 |
| 49 | [**#5**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/5) | claude/jira-fe-task | claude/jira fe task | v0.1.0 |
| 50 | [**#4**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/4) | claude/jira-list-issues | claude/jira list issues | v0.1.0 |
| 51 | [**#3**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/3) | claude/review-branches-merge-main-v7nrtz | claude/review branches merge main v7nrtz | v0.1.0 |
| 52 | [**#2**](https://github.com/BryannLee202/SEAL_HACKATHON/pull/2) | claude/review-branches-merge-main-v7nrtz | claude/review branches merge main v7nrtz | v0.1.0 |
