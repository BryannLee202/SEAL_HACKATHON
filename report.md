# BÁO CÁO TỔNG HỢP KIỂM THỬ VÀ GIẢI ĐÁP NGHIỆP VỤ HỆ THỐNG SEAL HACKATHON

> **Dự án:** SEAL HACKATHON — Hệ thống Quản lý Cuộc thi Hackathon & Nghiên cứu Độ tin cậy Đánh giá viên (RBL / Inter-Rater Reliability)  
> **Thời gian tạo:** 23/09/2026  
> **Phiên bản mã nguồn:** Commit [`ced3d01`](https://github.com/BryannLee202/SEAL_HACKATHON/commit/ced3d01) (Nhánh `main`)  
> **Môi trường:** Docker (Frontend :3000, BFF :4000, Backend :8080, PostgreSQL :5433)

---

## 📖 BẢNG TRA CỨU THUẬT NGỮ CHUYÊN MÔN (GLOSSARY)
*(Dùng để tự tin giải thích mở ngoặc khi Hội đồng phản biện hỏi về các từ viết tắt)*

* **CSRF** *(Cross-Site Request Forgery — Tấn công giả mạo yêu cầu từ trang web khác)*: Kẻ tấn công lừa trình duyệt của người dùng gửi lệnh trái phép đến hệ thống mà người dùng đã đăng nhập trước đó.
* **XSS** *(Cross-Site Scripting — Tấn công tiêm mã kịch bản độc hại)*: Kẻ xấu chèn mã JavaScript độc hại vào trang web để đánh cắp dữ liệu lưu ở trình duyệt (như `localStorage`).
* **BFF** *(Backend-For-Frontend — Tầng máy chủ trung gian phục vụ riêng cho giao diện)*: Tầng trung chuyển viết bằng NestJS nằm giữa React (Frontend) và Spring Boot (Backend), chuyên quản lý phiên đăng nhập an toàn, cấp phát CSRF Token và định dạng dữ liệu cho giao diện.
* **JWT** *(JSON Web Token — Chuỗi mã hóa xác thực phiên làm việc)*: Chuỗi ký số an toàn chứa định danh và quyền hạn của người dùng, được hệ thống lưu trong Cookie `httpOnly` để chống lộ token.
* **RBL** *(Rubric-Based Learning — Đánh giá năng lực dựa trên bảng tiêu chí chuẩn hóa Rubric)*: Phương pháp phân rã bài thi thành nhiều tiêu chí rõ ràng (Kỹ thuật, UX, Sáng tạo, Thuyết trình) kèm trọng số cụ thể để chấm điểm công bằng.
* **IRR** *(Inter-Rater Reliability — Độ tin cậy và tính nhất quán giữa các giám khảo)*: Chỉ số đo lường mức độ đồng thuận giữa các giám khảo khi chấm cùng một bài thi, giúp phát hiện giám khảo chấm quá chặt hoặc quá lỏng.
* **UUID** *(Universally Unique Identifier — Chuỗi định danh duy nhất toàn cầu 128-bit)*: Chuỗi mã hóa 36 ký tự (ví dụ: `baaae0ae-e0bd-45f7-87bb-ce328a40cd30`) thay thế cho ID tự tăng (1, 2, 3) để chống tấn công quét ID tuần tự.
* **CORS** *(Cross-Origin Resource Sharing — Cơ chế kiểm soát chia sẻ tài nguyên chéo nguồn)*: Quy tắc bảo mật của trình duyệt quy định cổng hoặc tên miền nào được phép gọi API vào hệ thống.
* **API** *(Application Programming Interface — Giao diện lập trình ứng dụng / Cổng trao đổi dữ liệu)*: Giao thức cho phép Frontend và Backend gửi nhận thông tin dạng JSON thông qua HTTP methods (`GET`, `POST`, `PUT`, `DELETE`).
* **SQL** *(Structured Query Language — Ngôn ngữ truy vấn dữ liệu có cấu trúc)*: Ngôn ngữ chuẩn dùng để đọc, ghi, cập nhật dữ liệu trong hệ quản trị cơ sở dữ liệu PostgreSQL.
* **Flyway Migration** *(Cơ chế quản lý phiên bản cơ sở dữ liệu tự động / Database Version Control)*: Công cụ tự động chạy các script SQL theo thứ tự phiên bản (`V001` -> `V009`), đảm bảo cấu trúc database của mọi thành viên và máy chủ production luôn đồng bộ 100%.

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
   - [Câu 8: CSRF là gì? Cơ chế phòng thủ CSRF (Double-Submit Cookie) trong hệ thống hoạt động như thế nào?](#c%C3%A2u-8-csrf-l%C3%A0-g%C3%AC-c%C6%A1-ch%E1%BA%BF-ph%C3%B2ng-th%E1%BB%A7-csrf-double-submit-cookie-trong-h%E1%BB%87-th%E1%BB%91ng-ho%E1%BA%A1t-%C4%91%E1%BB%99ng-nh%C6%B0-th%E1%BA%BF-n%C3%A0o)
   - [Câu 9: Flyway Migration là gì? Cách vận hành, cấu trúc file và cách show code cho Thầy Cô](#c%C3%A2u-9-flyway-migration-l%C3%A0-g%C3%AC-c%C3%A1ch-v%E1%BA%ADn-h%C3%A0nh-c%E1%BA%A5u-tr%C3%BAc-file-v%C3%A0-c%C3%A1ch-show-code-cho-th%E1%BA%A7y-c%C3%B4)
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
  3. Controller Spring Boot (`TeamController.java`) khai báo tham số đường dẫn là `@PathVariable UUID eventId`. Do `"evt-1"` không phải định dạng UUID *(Universally Unique Identifier — Chuỗi định danh duy nhất 36 ký tự)* hợp lệ, Spring Boot ném ngoại lệ `MethodArgumentTypeMismatchException` và trả về mã lỗi **HTTP 400 Bad Request**.
  4. Lệnh tạo đội thất bại ngay tại bước 1, dẫn đến lời mời gửi tới thí sinh thứ hai chưa từng được gọi.
* **Giải pháp đã thực hiện:**
  - Cập nhật `frontend/src/api/events.ts`: Chuyển hàm `list()`, `listTracks()`, `listRounds()` sang dùng Axios Client (`api`) kết nối thẳng tới backend thật trên cổng 4000 (tầng BFF).
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
  - Đề tài nghiên cứu tính nhất quán và độ tin cậy liên đánh giá viên (**IRR** — *Inter-Rater Reliability*) trong chấm thi kỹ thuật phần mềm bằng phương pháp Rubric-Based Learning (**RBL** — *Đánh giá học tập và năng lực dựa trên bảng tiêu chí Rubric chuẩn hóa*).
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

### Câu 8: CSRF là gì? Cơ chế phòng thủ CSRF (Double-Submit Cookie) trong hệ thống hoạt động như thế nào?
* **CSRF là gì?**
  - **CSRF** viết tắt của **Cross-Site Request Forgery** *(dịch nghĩa: Tấn công giả mạo yêu cầu từ trang web khác)*.
  - Đây là kỹ thuật tấn công mà kẻ xấu lợi dụng cơ chế của trình duyệt: **Trình duyệt luôn tự động gửi kèm cookie phiên của trang web mục tiêu trong mọi request**, kể cả khi request đó xuất phát từ một trang web độc hại khác mà nạn nhân vô tình truy cập.
* **Ví dụ kịch bản tấn công thực tế (nếu không có phòng thủ):**
  1. Giám khảo đang đăng nhập vào hệ thống SEAL Hackathon tại `http://localhost:3000`. Trình duyệt đang lưu cookie đăng nhập `shms_at`.
  2. Giám khảo mở một tab khác và vô tình bấm vào liên kết trúng thưởng giả mạo `http://web-doc-hai.vn/nhan-qua.html`.
  3. Trang web độc hại ngầm chạy một đoạn mã:
     `fetch('http://localhost:4000/api/scores/chot-diem', { method: 'POST', body: '...' })`
  4. Trình duyệt tự động đính kèm cookie `shms_at` của Giám khảo gửi kèm theo request! Nếu máy chủ chỉ kiểm tra cookie, hệ thống sẽ tin đây là yêu cầu do chính Giám khảo gửi và cho phép thay đổi điểm số bài thi của thí sinh.
* **Tại sao SEAL Hackathon lại cần phòng thủ CSRF?**
  - Để triệt tiêu hoàn toàn nguy cơ tấn công **XSS** *(Cross-Site Scripting — Tấn công tiêm mã JavaScript độc hại vào trình duyệt để đọc `localStorage`)*, hệ thống SEAL quyết định **không lưu Access Token trong `localStorage`**, mà lưu trong Cookie bảo mật `httpOnly` (`shms_at`, `shms_rt`).
  - Tuy nhiên, khi dùng Cookie thì trình duyệt lại có nguy cơ bị **CSRF**. Do đó, hệ thống bắt buộc phải triển khai cơ chế phòng thủ CSRF hai lớp.
* **Cơ chế phòng thủ của hệ thống: Double-Submit CSRF Cookie tại tầng BFF:**
  1. **Bước 1 (Cấp phát token):** Khi người dùng đăng nhập thành công hoặc truy vấn phiên (`/api/auth/me`), tầng **BFF** *(Backend-For-Frontend)* tạo ra một chuỗi token ngẫu nhiên an toàn và gửi về trình duyệt qua cookie mang tên `XSRF-TOKEN` (cho phép JavaScript đọc được, không dùng `httpOnly`).
  2. **Bước 2 (Gửi kèm Header):** Khi Frontend (`frontend/src/api/http.ts`) thực hiện các thao tác làm thay đổi dữ liệu (`POST`, `PUT`, `PATCH`, `DELETE`), mã nguồn TypeScript sẽ tự động đọc giá trị trong cookie `XSRF-TOKEN` và đính kèm vào một HTTP Header riêng biệt có tên là `X-XSRF-TOKEN`.
  3. **Bước 3 (Kiểm tra tại BFF Guard):** Bộ lọc kiểm soát `CsrfGuard.ts` của BFF sẽ chặn request và đối soát:
     $$\text{Cookie } \texttt{XSRF-TOKEN} == \text{Header } \texttt{X-XSRF-TOKEN} \text{ ?}$$
     - **Nếu trùng khớp:** BFF xác thực yêu cầu hợp lệ và chuyển tiếp xuống Core Backend (Spring Boot).
     - **Nếu không khớp hoặc thiếu Header:** BFF lập tức từ chối với mã lỗi **HTTP 403 Forbidden** (*"Thiếu hoặc sai CSRF token"*).
* **Tại sao kẻ tấn công không thể vượt qua?**
  - Dựa trên chính sách **SOP** *(Same-Origin Policy — Chính sách cùng nguồn gốc của trình duyệt web)*: Trang web độc hại ở domain khác **tuyệt đối không thể đọc được nội dung Cookie của trang SEAL Hackathon**, vì vậy kẻ tấn công không thể biết chuỗi token bí mật là gì để gắn vào Header `X-XSRF-TOKEN`. Kẻ tấn công bị chặn đứng 100%.

---

### Câu 9: Flyway Migration là gì? Cách vận hành, cấu trúc file và cách show code cho Thầy Cô
* **Flyway Migration là gì?**
  - **Flyway** là một công cụ **Database Version Control** *(Quản lý phiên bản mã nguồn cho cơ sở dữ liệu)* mã nguồn mở.
  - Tương tự như **Git** quản lý lịch sử commit của code Java/TypeScript, **Flyway** quản lý lịch sử tiến hóa của schema cơ sở dữ liệu (tạo bảng, thêm cột, tạo khóa ngoại, nạp dữ liệu mẫu seed data).
* **Flyway có chức năng gì trong dự án SEAL Hackathon?**
  1. **Tự động hóa 100%:** Khi container Spring Boot khởi động, Flyway tự động quét các file script SQL và thực thi lần lượt vào PostgreSQL mà lập trình viên không cần chạy SQL thủ công.
  2. **Đồng bộ hóa môi trường:** Đảm bảo toàn bộ 6 thành viên trong nhóm và máy chủ production đều có đúng 1 cấu trúc database y hệt nhau.
  3. **Kiểm toán toàn vẹn dữ liệu (Checksum Validation):** Ngăn chặn việc ai đó sửa lén các file migration cũ, bảo vệ an toàn cho cơ sở dữ liệu.
* **Cấu trúc đặt tên file bắt buộc của Flyway:**
  - Định dạng chuẩn: `V<Version>__<Mo_ta_ngan_gon>.sql` (Ví dụ: `V001__init_schema.sql`, `V002__seed_data.sql`).
  - **Lưu ý quan trọng:** Giữa số phiên bản và tên mô tả bắt buộc phải có **2 dấu gạch dưới liên tiếp (`__`)**. Nếu chỉ có 1 dấu gạch, Flyway sẽ bỏ qua và không nhận diện được file!
* **Bảng thần thánh `flyway_schema_history` dưới PostgreSQL:**
  - Flyway tự động tạo bảng này để ghi nhận: `installed_rank`, `version`, `description`, `script`, `checksum` (mã băm nội dung file), `installed_on` (thời gian chạy), `success` (`t/f`).
* **Quy trình vận hành 4 bước khi khởi động:**
  1. **Scan:** Quét thư mục `src/main/resources/db/migration/`.
  2. **Check:** Đọc bảng `flyway_schema_history` dưới database.
  3. **Validate:** Tính toán lại mã băm Checksum của các file cũ. Nếu mã băm khác với giá trị đã lưu trong bảng `flyway_schema_history` (do ai đó sửa file cũ), Flyway lập tức dừng khởi động để bảo vệ dữ liệu.
  4. **Migrate:** Thực thi các file mới hơn (chưa có trong bảng) theo thứ tự tăng dần.
* **Cách Show Code và Chỉ Cho Thầy Cô Xem:**
  - **Thư mục script SQL:** `backend/src/main/resources/db/migration/` (Hiển thị 9 file từ `V001` đến `V009`).
  - **Cấu hình Spring Boot:** `backend/src/main/resources/application.yml` (chỉ dòng `flyway.enabled: true`, `locations: classpath:db/migration` và `jpa.hibernate.ddl-auto: validate`).
  - **Bảng dữ liệu thực tế trên pgAdmin 4:** Chạy truy vấn bảng `flyway_schema_history`.

---

## 2. CHECKLIST QUY TRÌNH KIỂM THỬ CHUẨN TỪNG BƯỚC

Dưới đây là kịch bản hoàn chỉnh để bạn tự kiểm tra hoặc demo trực tiếp cho thầy cô:

| Bước | Thao tác trên Giao diện Web | Tài khoản sử dụng | Kỳ vọng trên Giao diện | Kỳ vọng trong PostgreSQL |
| :---: | :--- | :--- | :--- | :--- |
| **1** | Đăng ký & Duyệt tài khoản | Khách vãng lai ➔ `coordinator@demo.local` | Thí sinh đăng ký xong, BTC vào `/coordinator/users` bấm **Duyệt**. | Cột `account_status = 'APPROVED'` trong bảng `app_user`. |
| **2** | Tạo đội thi mới | Thí sinh (`svfpt@gmail.com`) | Vào `/team`, bấm **Tạo đội**, đặt tên `AI CHAMPIONS`, chọn sự kiện thật. | Bản ghi mới xuất hiện trong `team` với trạng thái `status = 'FORMING'` *(Đang thành lập)*. |
| **3** | Mời thành viên | Đội trưởng (`mtai@gmail.com`) | Nhập email thành viên vào form mời và bấm gửi. | Bản ghi mới trong `team_invite` với trạng thái `PENDING` *(Chờ chấp nhận)*. |
| **4** | Thành viên chấp nhận vào đội | Thí sinh được mời (`minhtai@gmail.com`) | Đăng nhập, vào `/team`, thấy thẻ lời mời, bấm **Chấp nhận**. | `team_invite.status = 'ACCEPTED'`, `team_member` thêm dòng mới vai trò `MEMBER`. |
| **5** | Đăng ký Hạng mục thi đấu | Đội trưởng (khi đội đủ $\ge 3$ người) | Chọn track `Mobile Application`, bấm **Đăng ký Hạng mục**. | `team.status` chuyển thành `REGISTERED` *(Đã đăng ký hợp lệ)*, cột `track_id` được gán UUID. |
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

### 3.8. Kiểm tra lịch sử nạp phiên bản Flyway (flyway_schema_history)
```sql
SELECT installed_rank, version, description, script, checksum, 
       installed_on AT TIME ZONE 'Asia/Ho_Chi_Minh' AS thoi_gian_chay, 
       success AS thanh_cong
FROM flyway_schema_history 
ORDER BY installed_rank ASC;
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
3. **Commit cập nhật tài liệu kiểm thử**:
   - `report.md`: Bổ sung bảng chú giải thuật ngữ (Glossary) với mở ngoặc chú thích rõ ràng, chi tiết cơ chế bảo mật CSRF và hướng dẫn kiểm thử toàn diện.
