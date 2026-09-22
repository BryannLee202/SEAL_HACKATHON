# 🎬 SEAL Hackathon Scoring System — Demo Script

**Thời gian demo:** ~10 phút  
**Mục tiêu:** Trình bày luồng chấm điểm, hiệu chuẩn (calibration), và xếp hạng

---

## 📋 Chuẩn bị trước khi demo

### 1. Đảm bảo 3 service đang chạy

```powershell
# Terminal 1: Backend
cd <thu-muc-repo>/backend
$env:JAVA_HOME='C:\Program Files\Java\jdk-21'
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
$env:SPRING_PROFILES_ACTIVE='demo'
mvnw.cmd spring-boot:run
# Chờ đến: "Started HackathonBackendApplication in X seconds"
```

```powershell
# Terminal 2: BFF (đã chạy)
cd <thu-muc-repo>/bff
npm run start:dev
# Chờ đến: "SEAL Hackathon BFF listening on http://localhost:4000"
```

```powershell
# Terminal 3: Frontend (đã chạy)
cd <thu-muc-repo>/frontend
$env:VITE_BFF_URL='http://localhost:4000'
npx vite --host 0.0.0.0 --port 3001
# Chờ đến: "ready in X ms" và "Local: http://localhost:3001/"
```

### 2. Kiểm tra health endpoints

```powershell
# Kiểm tra backend
Invoke-WebRequest -Uri 'http://localhost:8080/actuator/health'
# Kỳ vọng: StatusCode 200

# Kiểm tra BFF
Invoke-WebRequest -Uri 'http://localhost:4000/health'
# Kỳ vọng: StatusCode 200, nội dung: {"status":"ok"}

# Kiểm tra frontend
Invoke-WebRequest -Uri 'http://localhost:3001/'
# Kỳ vọng: StatusCode 200, nội dung HTML
```

---

## 🎯 Kịch bản Demo: Chấm Điểm & Ranking

### Phần 1: Đăng Nhập (1-2 phút)

**Mục tiêu:** Chứng minh hệ thống xác thực hoạt động.

1. Mở browser → **`http://localhost:3001/login`**
2. Nhập thông tin:
   - **Email:** `judge1@demo.local`
   - **Password:** `Demo@123456`
3. Bấm **"Đăng nhập"**
4. Chờ chuyển hướng → Hiển thị trang `/app` (Dashboard)

**Giải thích:**
- Hệ thống xác thực sử dụng JWT token
- Token được lưu trong cookie `httpOnly` qua BFF
- CSRF protection: cookie `XSRF-TOKEN` + header `X-XSRF-TOKEN`
- Mỗi request từ frontend đi qua BFF trước khi tới backend

---

### Phần 2: Xem Vòng Thi & Phân Công (1 phút)

1. Từ dashboard `/app`, tìm phần **"Chấm điểm"** hoặc menu chính
2. Bấm vào **"Chấm điểm"** → Redirect sang `/judge`
3. Xem danh sách vòng thi:
   - **Vòng Chung Kết** (Vòng 1)
   - Judge `judge1@demo.local` được phân công vòng này

**Giải thích:**
- Hệ thống phân quyền 2 lớp:
  - **Lớp 1 (Static):** Role-based (JUDGE, COORDINATOR, MENTOR)
  - **Lớp 2 (Dynamic):** Scope-based (được chấm vòng nào, hạng mục nào)
- API `/api/auth/me` trả về user info + roles + scopes
- `/api/rounds/{roundId}` chỉ trả vòng thi nếu user có quyền

---

### Phần 3: Vòng Hiệu Chuẩn (Calibration) — 2 phút

**Mục tiêu:** Chứng minh RBL (Rubric-Based Learning) feature.

1. Tìm section **"Vòng hiệu chuẩn (Calibration)"** trên `/judge`
2. Xem bài mẫu:
   - **Team Rocket** (bài sample)
   - Repo: https://github.com/demo/team-rocket
   - Demo: https://demo.example.com/team-rocket
3. Chấm từng tiêu chí bằng **slider**:
   - **Kỹ thuật & Triển khai (30%):** Nhập `9.0` (điểm cao)
   - **Trải nghiệm người dùng (20%):** Nhập `7.5` (điểm trung bình)
   - **Tác động & Ý tưởng (25%):** Nhập `8.5` (điểm cao)
   - **Thuyết trình & Demo (25%):** Nhập `8.0` (điểm cao)
4. Bấm **"Gửi điểm hiệu chuẩn"**
5. Chờ thông báo: **"Đã gửi điểm hiệu chuẩn."**

**Giải thích ngữ vựng:**
- **Calibration (Hiệu chuẩn):** Đảm bảo các giám khảo khác nhau hiểu bài và tiêu chí giống nhau
- **RBL (Rubric-Based Learning):** Sử dụng tiêu chí rõ ràng để chấm điểm, không chủ quan
- **API Backend:**
  - `PUT /api/calibration-rounds/{calibrationRoundId}/scores`
  - Request body: `[{criterionId, scoreValue}, ...]`
  - Backend lưu vào bảng `calibration_score`

---

### Phần 4: Chấm Điểm Chính Thức — 3-4 phút

**Mục tiêu:** Chứng minh luồng chấm điểm thực tế, tính toán trọng số, và xếp hạng.

#### 4a. Chấm đội thứ nhất: **Team Rocket**

1. Tìm section **"#1 Vòng Chung Kết"**
2. Tìm **"Team Rocket"** → Bấm để mở rộng
3. Xem thông tin:
   - **Repo:** https://github.com/demo/team-rocket
   - **Demo:** https://demo.example.com/team-rocket
   - **Slide:** https://docs.example.com/team-rocket-slides.pdf
4. Chấm từng tiêu chí:
   - **Kỹ thuật:** `8.5`
   - **UX:** `7.0`
   - **Tác động:** `9.0`
   - **Thuyết trình:** `8.5`
5. Viết comment (tuỳ chọn):
   - Ví dụ: "Kiến trúc code rõ ràng, UI hơi đơn giản"
6. Chọn **"Chốt điểm"** (finalized checkbox)
7. Bấm **"Lưu"**
8. Chờ thông báo: **"Đã lưu điểm cho đội 'Team Rocket'."**

**Công thức điểm trọng số tự động tính:**
```
Tổng = (8.5/10 × 30) + (7.0/10 × 20) + (9.0/10 × 25) + (8.5/10 × 25)
     = 25.5 + 14.0 + 22.5 + 21.25
     = 83.25 / 100
```

#### 4b. Chấm đội thứ hai: **Byte Force**

1. Tìm **"Byte Force"** → Bấm để mở rộng
2. Xem thông tin:
   - **Repo:** https://github.com/demo/byte-force
   - **Demo:** Không có (late submission)
   - **Slide:** https://docs.example.com/byte-force-presentation.pdf
   - **Lưu ý:** Nộp muộn (`is_late: true`)
3. Chấm (điểm thấp hơn để demo ranking):
   - **Kỹ thuật:** `7.0`
   - **UX:** `6.5`
   - **Tác động:** `7.5`
   - **Thuyết trình:** `7.0`
4. Comment: "Ý tưởng tốt nhưng triển khai còn hạn chế"
5. Chọn **"Chốt điểm"**
6. Bấm **"Lưu"**

**Công thức điểm trọng số:**
```
Tổng = (7.0/10 × 30) + (6.5/10 × 20) + (7.5/10 × 25) + (7.0/10 × 25)
     = 21.0 + 13.0 + 18.75 + 17.5
     = 70.25 / 100
```

---

### Phần 5: Xem Ranking (2 phút)

**Mục tiêu:** Chứng minh công thức xếp hạng dựa trên tổng điểm trọng số.

1. Từ dashboard hoặc menu, vào **"Xếp hạng"** (nếu có)
   - Hoặc API test: `GET /api/rounds/{roundId}/rankings`
2. Xem bảng ranking:
   | Hạng | Đội | Điểm Trọng Số | Tiêu Chí |
   |------|-----|--------------|----------|
   | 1 | Team Rocket | 83.25 | Chấm tốt |
   | 2 | Byte Force | 70.25 | Nộp muộn |

3. Giải thích thuật toán:
   - Rank được tính dựa trên `total_weighted_score` (không phải điểm tuyệt đối)
   - Nếu có vòng thi tiếp theo, rank sẽ quyết định top N được thăng tiến

---

## 🔧 API Endpoints được gọi trong demo

| Endpoint | Method | Mục đích |
|----------|--------|---------|
| `/api/auth/login` | POST | Đăng nhập |
| `/api/auth/me` | GET | Lấy thông tin user + roles |
| `/api/auth/refresh` | POST | Refresh JWT token |
| `/api/judges/{roundId}` | GET | Xem vòng thi được phân công |
| `/api/rounds/{roundId}` | GET | Chi tiết vòng thi |
| `/api/rounds/{roundId}/submissions` | GET | Danh sách bài nộp |
| `/api/rounds/{roundId}/criteria` | GET | Danh sách tiêu chí |
| `/api/events/{eventId}/calibration-rounds` | GET | Vòng hiệu chuẩn |
| `/api/calibration-rounds/{calibrationRoundId}/scores` | PUT | Gửi điểm hiệu chuẩn |
| `/api/submissions/{submissionId}/scores` | GET | Xem điểm hiện tại |
| `/api/submissions/{submissionId}/scores` | PUT | Lưu/chốt điểm |
| `/api/rounds/{roundId}/rankings` | GET | Xem xếp hạng (optional) |

---

## 🏗️ Kiến Trúc Backend Demo

### Entities (Database Model)

```
app_user
├── id, email, password_hash (BCrypt)
├── full_name, user_category
└── account_status, guest_judge

user_role_assignment
├── user_id → app_user
├── role_name (JUDGE, COORDINATOR, ...)
├── scope_type (GLOBAL, ROUND, EVENT)
└── scope_id (FK to round/event - nullable)

hackathon_event
├── id, name, status (ACTIVE, CLOSED, ...)
└── rbl_enabled (true = turn on calibration)

round
├── id, event_id → hackathon_event
├── name, order_index
├── submission_deadline
├── promotion_top_n (top 3, 5, etc.)
└── results_published

team
├── id, event_id, track_id, name, status

submission
├── id, team_id → team
├── round_id → round
├── repo_url, demo_url, doc_url
├── submitted_at, is_late

criterion
├── id, round_id → round
├── name, description
├── weight (muon so), max_score

score
├── id, submission_id, judge_id, criterion_id
├── score_value (0-10)
├── comment, finalized
├── scored_at

ranking
├── id, team_id, round_id
├── total_weighted_score (tính toán)
├── rank_in_track, rank_overall
└── promoted (based on promotion_top_n)

calibration_round
├── id, event_id, sample_submission_id
├── name, active

calibration_score
├── id, calibration_round_id, judge_id, criterion_id
└── score_value
```

### Services (Business Logic)

- **`AuthService`:** Đăng nhập, refresh token, gen temporary password
- **`ScoreService`:** Lưu/chốt điểm, validate quyền
- **`RankingService`:** Tính xếp hạng dựa trên `total_weighted_score`
- **`RoundService`:** Lấy thông tin vòng thi, danh sách bài nộp
- **`JudgeAssignmentService`:** Phân công giám khảo cho vòng thi
- **`AuditService`:** Ghi log tất cả action (duyệt tài khoản, chấm điểm, công bố kết quả)

### Controllers

- **`AuthController`:** `/api/auth/*` (login, logout, refresh, me)
- **`ScoreController`:** `/api/submissions/{id}/scores` (GET/PUT)
- **`RankingController`:** `/api/rounds/{id}/rankings` (GET)
- **`RoundController`:** `/api/rounds/{id}` (GET)

---

## 🎓 Kiến Thức Chuyên Ngành (Domain Knowledge)

### RBL (Rubric-Based Learning)

**Vấn đề:** Chấm điểm hack không khách quan → Mỗi giám khảo mục tiêu khác nhau

**Giải pháp RBL:**
1. **Xác định tiêu chí rõ ràng** (criteria) + trọng số (weight)
2. **Hiệu chuẩn giám khảo** (calibration round) → Tất cả chấm bài sample
3. **So sánh điểm calibration** giữa các giám khảo → Đảm bảo hiểu giống nhau
4. **Chấm chính thức** → Áp dụng tiêu chí + kinh nghiệm từ calibration

### Công Thức Xếp Hạng

```
total_weighted_score = Σ(score_i / max_score_i × weight_i)
                     = Σ(điểm_tiêu_chí_i / điểm_tối_đa_i × trọng_số_i)

ranking = sort by total_weighted_score DESC
```

**Ví dụ:**
- Tiêu chí 1: Kỹ thuật, trọng số 30%, điểm 8.5/10 → (8.5/10) × 30 = 25.5
- Tiêu chí 2: UX, trọng số 20%, điểm 7.0/10 → (7.0/10) × 20 = 14.0
- Tiêu chí 3: Tác động, trọng số 25%, điểm 9.0/10 → (9.0/10) × 25 = 22.5
- Tiêu chí 4: Thuyết trình, trọng số 25%, điểm 8.5/10 → (8.5/10) × 25 = 21.25
- **Tổng = 83.25 / 100**

---

## ⚠️ Lưu Ý An Ninh & Quyền Hạn

### Phân Quyền 2 Lớp

**Lớp 1: Vai trò tĩnh (Role-based)**
```java
@PreAuthorize("hasRole('JUDGE')")  // Kiểm tra ở controller level
public ResponseEntity<?> scoringPage() { ... }
```

**Lớp 2: Kiểm tra quyền sở hữu động (Ownership-based)**
```java
// Service level: Chỉ giám khảo được phân công vòng này mới được chấm
if (!user.getRoles().stream()
    .anyMatch(r -> r.getRoleName() == "JUDGE" && r.getScopeId() == roundId)) {
    throw new ForbiddenException("Bạn không được phân công vòng này");
}
```

### IDOR (Insecure Direct Object Reference) Prevention

❌ **Nguy hiểm:**
```
GET /api/submissions/OTHER_TEAM_SUBMISSION_ID/scores
```
Nếu dùng ID trực tiếp mà không check quyền → Có thể xem điểm team khác

✅ **Phòng ngừa:**
```java
Submission sub = submissionRepo.findById(id);
if (!isJudgeAssignedToRound(sub.getRoundId())) {
    throw new ForbiddenException();
}
```

---

## 📱 Frontend Tech Stack

- **React 19** + **TypeScript** + **React Router** (SPA)
- **Vite** (dev server, build tool)
- **Axios** (HTTP client)
- **Tailwind CSS** (styling)

### Flow React

```
App.tsx
├── LoginPage (unauthenticated)
│   └── form → api.post('/auth/login') → setUser in AuthContext
├── DashboardPage (protected, authenticated)
│   └── Show user info + links
└── JudgePage (protected + requireRole="JUDGE")
    ├── CalibrationJudgeSection (vòng hiệu chuẩn)
    ├── RoundScoringSection (vòng chấm chính)
    └── SubmissionScoreCard (form chấm từng bài)
```

### Cookie-based Auth Flow (via BFF)

```
Frontend          BFF                    Backend
   |              |                        |
   +--login-----> |--- login forward ----> |
   |              | (with credentials)     |
   |              |                    [BCrypt verify]
   |              |                   [JWT sign]
   | <--200 + Set-Cookie[httpOnly]---<|
   | (shms_at, shms_rt, XSRF-TOKEN)
   |
   | (mọi request sau này)
   +--GET /api/me + Cookie---------------> BFF
   | (cookie tự động gửi)                 |
   |                                      +--GET /auth/me + JWT (from cookie)---> Backend
   |                                      |
   |                                  [verify JWT]
   | <--200 + user data-----------------<|
```

---

## 🚀 Cách Chạy Demo Lại

### Nếu muốn reset data:

```powershell
# Stop tất cả services (Ctrl+C ở 3 terminals)

# Xóa cache Maven + H2 in-memory DB (database sẽ tạo lại khi backend start)
rm -r D:\JavaTeam_project\JavaTeam\backend\target\classes\db

# Restart backend
cd D:\JavaTeam_project\JavaTeam\backend
$env:JAVA_HOME='C:\Program Files\Java\jdk-21'
$env:Path = "$env:JAVA_HOME\bin;$env:Path"
$env:SPRING_PROFILES_ACTIVE='demo'
mvnw.cmd spring-boot:run

# Restart BFF (nếu cần)
cd D:\JavaTeam_project\JavaTeam\bff
npm run start:dev

# Restart frontend (nếu cần)
cd D:\JavaTeam_project\JavaTeam\frontend
npx vite --host 0.0.0.0 --port 3001
```

### Nếu chỉ muốn refresh UI (không reset data):

```powershell
# Frontend: Bấm refresh (F5) ở browser
# Hoặc restart frontend terminal thôi
```

---

## 💡 Câu Hỏi Thường Gặp Khi Demo

**Q: Tại sao phải hiệu chuẩn?**  
A: Để đảm bảo tất cả giám khảo chấm cùng một chuẩn. Nếu chấm ngủ, calibration sẽ phát hiện ra.

**Q: Điểm trọng số có phải 1-10?**  
A: Không, chỉ là ước tính theo công thức. Max là tổng của toàn bộ weight (30+20+25+25=100).

**Q: Có thể chôt xong rồi sửa không?**  
A: Sau khi finalized, cấu trúc thiết kế là không cho sửa (để có audit log),  nhưng có thể implement feature "Unlock for re-scoring" nếu coordinator yêu cầu.

**Q: Late submission bị phạt điểm không?**  
A: Không, chỉ đánh dấu `is_late: true` để coordinator có thể statistic. Quyết định phạt hay không tuỳ chủ tịch.

**Q: Bao nhiêu giám khảo cần chấm 1 bài?**  
A: Design hiện tại cho phép N giám khảo chấm cùng 1 bài (mỗi người lưu điểm riêng). Backend có thể tính average/variance sau.

---

## 📚 Tài Liệu Tham Khảo

- **Frontend:** [frontend/README.md](../frontend/README.md)
- **Backend:** [backend/README.md](../backend/README.md)
- **BFF:** [bff/README.md](../bff/README.md)
- **Database Schema:** [backend/src/main/resources/db/migration/](../backend/src/main/resources/db/migration/)
- **Live Swagger:** http://localhost:8080/swagger-ui.html (khi backend chạy)
