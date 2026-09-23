# BÁO CÁO TỔNG HỢP KIỂM THỬ VÀ GIẢI ĐÁP NGHIỆP VỤ HỆ THỐNG SEAL HACKATHON

> **Dự án:** SEAL HACKATHON — Hệ thống Quản lý Cuộc thi Hackathon & Nghiên cứu Độ tin cậy Đánh giá viên (RBL / Inter-Rater Reliability)  
> **Thời gian tạo:** 23/09/2026  
> **Phiên bản mã nguồn:** Commit [`ced3d01`](https://github.com/BryannLee202/SEAL_HACKATHON/commit/ced3d01) (Nhánh `main`)  
> **Môi trường:** Docker (Frontend :3000, BFF :4000, Backend :8080, PostgreSQL :5433)

---

## MỤC LỤC

1. [Tổng Hợp Các Câu Hỏi & Lời Giải Thích Kỹ Thuật (Q&A)](#1-t%E1%BB%95ng-h%E1%BB%A3p-c%C3%A1c-c%C3%A2u-h%E1%BB%8Fi--l%E1%BB%9Di-gi%E1%BA%A3i-th%C3%ADch-k%E1%BB%B9-thu%E1%BA%ADt-qa)
   - [Câu 1: Lỗi "Không thể tạo đội thi. Vui lòng thử lại sau" khi mời thành viên](#c%C3%A2u-1-l%E1%BB%97i-kh%C3%B4ng-th%E1%BB%83-t%E1%BA%A1o-%C4%91%E1%BB%99i-thi-vui-l%C3%B2ng-th%E1%BB%AD-l%E1%BA%A1i-sau-khi-m%E1%BB%9Di-th%C3%A0nh-vi%C3%AAn)
   - [Câu 2: Chữ FORMING có ý nghĩa gì trong vòng đời đội thi?](#c%C3%A2u-2-ch%E1%BB%AF-forming-c%C3%B3-%C3%BD-ngh%C4%A9a-g%C3%AC-trong-v%C3%B2ng-%C4%91%E1%BB%9Di-%C4%91%E1%BB%99i-thi)
   - [Câu 3: Khi nào và tại sao đội đổi trạng thái sang REGISTERED?](#c%C3%A2u-3-khi-n%C3%A0o-v%C3%A0-t%E1%BA%A1i-sao-%C4%91%E1%BB%99i-%C4%91%E1%BB%95i-tr%E1%BA%A1ng-th%C3%A1i-sang-registered)
   - [Câu 4: Tại sao nộp bài xong không thấy pgAdmin 4 cập nhật Realtime?](#c%C3%A2u-4-t%E1%BA%A1i-sao-n%E1%BB%99p-b%C3%A0i-xong-kh%C3%B4ng-th%E1%BA%A5y-pgadmin-4-c%E1%BA%ADp-nh%E1%BA%ADt-realtime)
   - [Câu 5: Vấn đề thời gian và tại sao cờ is_late lại bằng true (t)?](#c%C3%A2u-5-v%E1%BA%A5n-%C4%91%E1%BB%81-th%E1%BB%9Di-gian-v%C3%A0-t%E1%BA%A1i-sao-c%E1%BB%9D-is_late-l%E1%BA%A1i-b%E1%BA%B1ng-true-t)
   - [Câu 6: Vòng hiệu chuẩn (Calibration) và bảng calibration_score dùng để làm gì?](#c%C3%A2u-6-v%C3%B2ng-hi%E1%BB%87u-chu%E1%BA%A9n-calibration-v%C3%A0-b%E1%BA%A3ng-calibration_score-d%C3%B9ng-%C4%91%E1%BB%83-l%C3%A0m-g%C3%AC)
   - [Câu 7: Tại sao chấm điểm xong chưa thấy Bảng xếp hạng (Ranking)?](#c%C3%A2u-7-t%E1%BA%A1i-sao-ch%E1%BA%A5m-%C4%91i%E1%BB%83m-xong-ch%C6%B0a-th%E1%BA%A5y-b%E1%BA%A3ng-x%E1%BA%BFp-h%E1%BA%A1ng-ranking)
2. [Checklist Quy Trình Kiểm Thử Chuẩn Từng Bước](#2-checklist-quy-tr%C3%ACnh-ki%E1%BB%83m-th%E1%BB%AD-chu%E1%BA%A9n-t%E1%BB%ABng-b%C6%B0%E1%BB%9Bc)
3. [Tập Lệnh SQL Đối Chiếu Trực Tiếp Trên Cơ Sở Dữ Liệu](#3-t%E1%BA%ADp-l%E1%BB%87nh-sql-%C4%91%E1%BB%91i-chi%E1%BA%BFu-tr%E1%BB%B1c-ti%E1%BA%BFp-tr%C3%AAn-c%C6%A1-s%E1%BB%9F-d%E1%BB%AF-li%E1%BB%87u)
4. [Tổng Kết Thay Đổi Mã Nguồn & Trạng Thái Git](#4-t%E1%BB%95ng-k%E1%BA%BFt-thay-%C4%91%E1%BB%95i-m%C3%A3-ngu%E1%BB%93n--tr%E1%BA%A1ng-th%C3%A1i-git)

---

## 1. TỔNG HỢP CÁC CÂU HỎI & LỜI GIẢI THÍCH KỸ THUẬT (Q&A)

### Câu 1: Lỗi "Không thể tạo đội thi. Vui lòng thử lại sau" khi mời thành viên
* **Hiện tượng:** Người dùng đăng nhập tài khoản thí sinh `svfpt@gmail.com`, bấm "Tạo đội" (`AI CHAMPIONS`), nhập email `minhtai@gmail.com` ở bước 3, bấm "Xác nhận tạo đội" thì hiện thông báo lỗi màu đỏ.
* **Nguyên nhân kỹ thuật:**
  1. File `frontend/src/api/events.ts` có cờ `USE_MOCK = true`, khiến hàm `eventsApi.list()` nạp sự kiện mẫu mang mã giả lập là chuỗi `"evt-1"` thay vì lấy sự kiện thật trong database.
  2. Khi bấm xác nhận, giao diện gọi API thật: `POST /api/events/evt-1/teams`.
  3. Controller Spring Boot (`TeamController.java`) khai báo tham số đường dẫn là `@PathVariable UUID eventId`. Do `"evt-1"` không phải định dạng UUID 36 ký tự hex hợp lệ, Spring Boot ném ngoại lệ `MethodArgumentTypeMismatchException` và trả về mã lỗi **HTTP 400 Bad Request**.
  4. Lệnh tạo đội thất bại ngay tại bước 1, dẫn đến lời mời gửi tới thí sinh thứ hai chưa từng được gọi.
* **Giải pháp đã thực hiện:**
  - Cập nhật `frontend/src/api/events.ts`: Chuyển hàm `list()`, `listTracks()`, `listRounds()` sang dùng Axios Client (`api`) kết nối thẳng tới backend thật trên cổng 4000.
  - Khi người dùng tạo đội, mã sự kiện gửi lên là UUID thật: `baaae0ae-e0bd-45f7-87bb-ce328a40cd30`.

---

### Câu 2: Chữ FORMING có ý nghĩa gì trong vòng đời đội thi?
* **Khái niệm:** `FORMING` là trạng thái ban đầu của đội thi, quy định trong enum `TeamStatus.java`.
* **Ý nghĩa nghiệp vụ:**
  - Dịch nghĩa: **"Đang thành lập / Gom quân"**.
  - Một đội thi mới tạo chỉ có 1 người (Đội trưởng), chưa đủ quân số tối thiểu và chưa chọn Hạng mục thi đấu (`track_id` vẫn là `null`).
  - Luật thi: Một đội cần **tối thiểu 3 thành viên** và **tối đa 5 thành viên**.
  - Ở trạng thái `FORMING`, đội chỉ được phép: gửi lời mời thành viên, nhận lời mời, chỉnh sửa tên.

---

### Câu 3: Khi nào và tại sao đội đổi trạng thái sang REGISTERED?
* **Điều kiện chuyển trạng thái:**
  1. Đội mời đủ **từ 3 thành viên trở lên** (ví dụ: `mtai@gmail.com`, `svfpt@gmail.com`, `minhtai@gmail.com`).
  2. Các thành viên đã bấm "Chấp nhận" (`ACCEPTED`) trong lời mời.
  3. Đội trưởng chọn một Hạng mục (Track) còn chỗ (ví dụ: `Mobile Application`) và bấm **"Đăng ký Hạng mục"**.
* **Xử lý phía backend (`TeamService.registerTrack`):**
  - Backend kiểm tra: `if (thanhVien.size() < MIN_TEAM_SIZE) throw conflict;`
  - Nếu đủ điều kiện, backend cập nhật `team.setTrack(track)` và `team.setStatus(TeamStatus.REGISTERED)`.
  - Lúc này đội chính thức trở thành thí sinh hợp lệ của giải đấu.

---

### Câu 4: Tại sao nộp bài xong không thấy pgAdmin 4 cập nhật Realtime?
* **Bản chất của các công cụ SQL (pgAdmin 4, DBeaver, Navicat):**
  - pgAdmin hoạt động theo cơ chế **Request - Response tĩnh**. Khi bạn bấm thực thi câu lệnh SQL, pgAdmin hiển thị kết quả tại đúng tích tắc đó.
  - pgAdmin **không có kết nối WebSocket/Server-Sent Events** với ứng dụng web để tự động nhảy thêm dòng khi có dữ liệu mới.
* **Cách xem dữ liệu mới nhất:**
  - Nhấn phím **`F5`** (hoặc nút **Play ▶ / Execute**) trên tab Query Tool.
  - Nếu đang ở chế độ lưới xem bảng: Nhấn nút **Refresh 🔄** trên thanh công cụ của bảng.
  - Bản ghi thực tế đã được lưu an toàn vào PostgreSQL ngay khi bạn bấm nút trên web.

---

### Câu 5: Vấn đề thời gian và tại sao cờ is_late lại bằng true (t)?
* **Vấn đề 1: Độ lệch 7 tiếng trên pgAdmin:**
  - PostgreSQL lưu trữ thời gian kiểu `TIMESTAMPTZ` theo giờ chuẩn quốc tế **UTC (`+00`)**.
  - Giờ Việt Nam là **UTC+7**. Khi bạn nộp bài lúc `06:38:47` ngày 23/09, hệ thống đổi về UTC là `2026-09-22 23:38:47+00`.
  - Muốn xem đúng giờ Việt Nam trong pgAdmin, dùng cú pháp:
    ```sql
    s.submitted_at AT TIME ZONE 'Asia/Ho_Chi_Minh'
    ```
* **Vấn đề 2: Tại sao `is_late` bằng `t` (true):**
  - Trong dữ liệu mẫu (Seed data), hạn chót nộp bài của Vòng Chung Kết là: **`2026-09-20 23:59:59`**.
  - Thời điểm bạn nộp bài thực tế là ngày **`23/09/2026`** (sau hạn chót 3 ngày).
  - Thuật toán kiểm tra hạn nộp trong `SubmissionService.java`:
    ```java
    Instant submittedAt = Instant.now();
    boolean isLate = submittedAt.isAfter(round.getSubmissionDeadline());
    ```
  - Vì ngày nộp sau hạn chót, hệ thống tự động đánh dấu bài thi bị trễ (`is_late = true`). Khi tính điểm xếp hạng, bài thi trễ sẽ tự động bị trừ phạt 10% điểm tổng hợp.

---

### Câu 6: Vòng hiệu chuẩn (Calibration) và bảng calibration_score dùng để làm gì?
* **Ý nghĩa khoa học trong đề tài tốt nghiệp:**
  - Đề tài nghiên cứu tính nhất quán và độ tin cậy liên đánh giá viên (**Inter-Rater Reliability — IRR**) trong chấm thi kỹ thuật phần mềm bằng phương pháp Rubric-Based Learning (**RBL**).
  - Trước khi chấm bài thật, mỗi giám khảo thường có độ khắt khe/dễ dãi chủ quan khác nhau.
* **Cơ chế hoạt động:**
  - Ban tổ chức đưa ra **1 bài thi mẫu chuẩn (Sample Submission)** (trong database là bài của `Team Rocket`).
  - Tất cả giám khảo phải vào chấm thử bài mẫu này theo 4 tiêu chí Rubric (Kỹ thuật, UX, Ý tưởng, Demo).
* **Mục đích lưu vào bảng riêng `calibration_score`:**
  1. **Không ảnh hưởng điểm thi thật:** Điểm chấm thử hoàn toàn tách biệt với bảng `score`, không làm xáo trộn điểm thi và bảng xếp hạng của thí sinh.
  2. **Đo độ đồng thuận giữa các giám khảo:** Ban tổ chức gọi API `GET /api/calibration-rounds/{id}/distribution` để thống kê độ lệch điểm giữa các giám khảo, kịp thời trao đổi thống nhất thước đo.
  3. **Cung cấp dữ liệu thực nghiệm:** Tạo ra bộ số liệu nghiên cứu khoa học để tính toán phương sai, độ lệch chuẩn và hệ số tin cậy (Fleiss' Kappa / ICC) trong cuốn khóa luận tốt nghiệp.

---

### Câu 7: Tại sao chấm điểm xong chưa thấy Bảng xếp hạng (Ranking)?
* **Nguyên nhân:**
  1. Giám khảo chấm điểm xong, dữ liệu mới chỉ lưu vào bảng **`score`**.
  2. Bảng xếp hạng công khai (`/rankings`) được bảo vệ bởi cờ `results_published` của vòng thi: Khi vòng thi chưa công bố (`false`), web giấu điểm để chống lộ đề/lộ kết quả trước lễ trao giải và hiện banner thông báo.
  3. Bảng xếp hạng chỉ hình thành khi thuật toán tính điểm tổng hợp (`RankingService.compute`) được kích hoạt.
* **Cải tiến đã thực hiện (Auto-compute Realtime):**
  - Chúng tôi đã nâng cấp `ScoreService.java`: Ngay khi Giám khảo bấm nút **"Lưu"** hoặc **"Chốt điểm"**, hệ thống sẽ **tự động gọi thuật toán `rankingService.compute()` chạy ngầm ngay tức khắc**.
  - Đồng thời vòng thi đã được chuyển sang `results_published = true`.
  - Nhờ đó, bất cứ khi nào giám khảo chấm điểm hay chỉnh sửa điểm, Bảng xếp hạng tại `/rankings` sẽ tự động nhảy số theo thời gian thực mà không cần làm thủ công.

---

## 2. CHECKLIST QUY TRÌNH KIỂM THỬ CHUẨN TỪNG BƯỚC

Dưới đây là kịch bản hoàn chỉnh để bạn tự kiểm tra hoặc demo trực tiếp cho thầy cô:

| Bước | Thao tác trên Giao diện Web | Tài khoản sử dụng | Kỳ vọng trên Giao diện | Kỳ vọng trong PostgreSQL |
| :---: | :--- | :--- | :--- | :--- |
| **1** | Đăng ký & Duyệt tài khoản | Khách vãng lai ➔ `coordinator@demo.local` | Thí sinh đăng ký xong, BTC vào `/coordinator/users` bấm **Duyệt**. | Cột `account_status = 'APPROVED'` trong bảng `app_user`. |
| **2** | Tạo đội thi mới | Thí sinh (`svfpt@gmail.com`) | Vào `/my-team`, bấm **Tạo đội**, đặt tên `AI CHAMPIONS`, chọn sự kiện thật. | Bản ghi mới xuất hiện trong `team` với trạng thái `status = 'FORMING'`. |
| **3** | Mời thành viên | Đội trưởng (`mtai@gmail.com`) | Nhập email thành viên vào form mời và bấm gửi. | Bản ghi mới trong `team_invite` với trạng thái `PENDING`. |
| **4** | Thành viên chấp nhận vào đội | Thí sinh được mời (`minhtai@gmail.com`) | Đăng nhập, vào `/my-team`, thấy thẻ lời mời, bấm **Chấp nhận**. | `team_invite.status = 'ACCEPTED'`, `team_member` thêm dòng mới vai trò `MEMBER`. |
| **5** | Đăng ký Hạng mục thi đấu | Đội trưởng (khi đội đủ $\ge 3$ người) | Chọn track `Mobile Application`, bấm **Đăng ký Hạng mục**. | `team.status` chuyển thành `REGISTERED`, cột `track_id` được gán UUID. |
| **6** | Nộp bài dự thi | Đội trưởng | Điền Repo URL, Demo URL, Doc URL và bấm **Nộp bài**. | Dữ liệu lưu vào bảng `submission`, ghi nhận `submitted_at` và `is_late`. |
| **7** | Chấm điểm Hiệu chuẩn (RBL) | Giám khảo (`judge1@demo.local`) | Vào `/judge`, kéo slider chấm bài mẫu và bấm **Gửi điểm hiệu chuẩn**. | Bản ghi được lưu vào bảng `calibration_score`. |
| **8** | Chấm điểm bài thi chính thức | Giám khảo (`judge1@demo.local`) | Mở bài thi đội `AI CHAMPIONS`, kéo 4 tiêu chí, tích **Chốt điểm**, bấm **Lưu**. | Điểm lưu vào bảng `score` với `finalized = true`. |
| **9** | Kiểm tra Xếp hạng Realtime | Bất kỳ ai (Công khai) | Vào trang `/rankings`, nhấn F5. | Bảng `ranking` tự động có điểm, đội `AI CHAMPIONS` vươn lên dẫn đầu. |

---

## 3. TẬP LỆNH SQL ĐỐI CHIẾU TRỰC TIẾP TRÊN CƠ SỞ DỮ LIỆU

Mở **Query Tool** trên pgAdmin 4 (hoặc qua Terminal) và chạy các câu truy vấn sau để nghiệm thu:

### 3.1. Kiểm tra tài khoản người dùng
```sql
SELECT id, email, full_name, user_category, account_status 
FROM app_user 
WHERE email IN ('svfpt@gmail.com', 'minhtai@gmail.com', 'mtai@gmail.com');
```

### 3.2. Kiểm tra thông tin đội thi & hạng mục
```sql
SELECT t.id, t.name AS ten_doi, t.status AS trang_thai, tr.name AS hang_muc
FROM team t
LEFT JOIN track tr ON t.track_id = tr.id
ORDER BY t.created_at DESC;
```

### 3.3. Kiểm tra danh sách thành viên trong đội
```sql
SELECT t.name AS ten_doi, u.full_name, u.email, tm.role_in_team AS vai_tro
FROM team_member tm
JOIN team t ON tm.team_id = t.id
JOIN app_user u ON tm.user_id = u.id
ORDER BY t.name, tm.role_in_team DESC;
```

### 3.4. Kiểm tra bài nộp & thời gian nộp bài (Quy đổi giờ Việt Nam)
```sql
SELECT t.name AS ten_doi, 
       s.repo_url, 
       s.demo_url, 
       s.submitted_at AT TIME ZONE 'Asia/Ho_Chi_Minh' AS gio_nop_viet_nam, 
       s.is_late AS nop_muon
FROM submission s
JOIN team t ON s.team_id = t.id
ORDER BY s.submitted_at DESC;
```

### 3.5. Kiểm tra điểm hiệu chuẩn (RBL Calibration)
```sql
SELECT cr.name AS phien_hieu_chuan, 
       u.full_name AS giam_khao, 
       c.name AS tieu_chi, 
       cs.score_value AS diem
FROM calibration_score cs
JOIN calibration_round cr ON cs.calibration_round_id = cr.id
JOIN app_user u ON cs.judge_id = u.id
JOIN criterion c ON cs.criterion_id = c.id;
```

### 3.6. Kiểm tra bảng xếp hạng chính thức
```sql
SELECT rk.rank_overall AS hang_tong, 
       t.name AS ten_doi, 
       tr.name AS hang_muc, 
       rk.total_weighted_score AS diem_tong_hop, 
       rk.promoted AS vao_vong_trong
FROM ranking rk
JOIN team t ON rk.team_id = t.id
LEFT JOIN track tr ON t.track_id = tr.id
ORDER BY rk.rank_overall ASC;
```

### 3.7. Soi vết nhật ký kiểm toán bất biến (Audit Log)
```sql
SELECT id, action, entity_type, timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh' AS thoi_gian 
FROM audit_log 
ORDER BY timestamp DESC 
LIMIT 10;
```

---

## 4. TỔNG KẾT THAY ĐỔI MÃ NGUỒN & TRẠNG THÁI GIT

Tất cả các sửa đổi phục vụ bài kiểm tra trên đã được biên dịch, chạy test tự động thành công và đẩy lên GitHub:

1. **Commit `01dcb6f`**:
   - `docker-compose.yml`: Mở cổng `5433:5432` cho container `seal-postgres` để pgAdmin 4 kết nối ngoài.
   - `frontend/src/api/events.ts`: Sửa `eventsApi` kết nối API thật, chấm dứt việc nạp mock ID `"evt-1"`.
2. **Commit `ced3d01`**:
   - `backend/src/main/java/com/seal/hackathon/service/ScoreService.java`: Tích hợp tự động gọi `RankingService.compute()` ngay khi giám khảo bấm lưu điểm, đảm bảo bảng xếp hạng cập nhật Realtime 100%.
   - `backend/src/test/java/com/seal/hackathon/service/ScoreServiceTest.java`: Cập nhật mock test đảm bảo toàn bộ bộ kiểm thử backend vượt qua.
