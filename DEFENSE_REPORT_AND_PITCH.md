# 🎯 Báo Cáo Toàn Diện Chức Năng & Chiến Lược Bảo Vệ Đồ Án Điểm Tối Đa (A+)

> **Hệ Thống**: SEAL Hackathon Management System (SHMS)  
> **Chuyên Ngành**: Kỹ thuật Phần mềm (Software Engineering)  
> **Mục Tiêu**: Tài liệu hướng dẫn thuyết trình, phân tích giá trị chuyên môn và bộ câu hỏi phản biện giúp nhóm đạt điểm tuyệt đối trước Hội đồng chấm thi.

---

## 💎 1. Giá Trị Cốt Lõi & Chiều Sâu Học Thuật (Vũ Khí Ghi Điểm 10)

Để đạt điểm A+, nhóm cần làm cho Thầy Cô thấy rõ: **Đây không phải là một ứng dụng CRUD thông thường**, mà là một hệ thống phần mềm hoàn chỉnh giải quyết bài toán thực tế với hàm lượng kỹ thuật và học thuật cao:

### 🌟 6 Điểm Sáng Kỹ Thuật Độc Nhất Cần Nhấn Mạnh Với Thầy Cô

1. **Nghiên Cứu Hiệu Chuẩn Đánh Giá RBL (Rubric-Based Learning / Inter-Rater Reliability)**:
   - Trong các kỳ thi học thuật, sự thiên vị hoặc độ lệch đánh giá giữa các giám khảo (người quá khắt khe, người quá dễ dãi) luôn là vấn đề nhức nhối.
   - Hệ thống giải quyết bằng thuật toán **phân tích phương sai (Variance Analysis)**: tính toán giá trị trung bình ($Mean$), độ lệch chuẩn ($StdDev$), giá trị cực đại/cực tiểu của từng tiêu chí chấm để đo lường độ tin cậy liên đánh giá viên (**ICC - Intraclass Correlation Coefficient**).

2. **Vòng Hiệu Chuẩn Tiền Chấm Thi (Calibration Round)**:
   - Trước khi bước vào chấm các bài thi thật, Hội đồng giám khảo sẽ cùng chấm một bài mẫu (Sample Submission).
   - Hệ thống hiển thị biểu đồ phân phối điểm số của các giám khảo, giúp Ban Tổ Chức và Giám khảo trưởng thống nhất và chuẩn hóa lại góc nhìn đánh giá.

3. **Thuật Toán Ma Trận Trọng Số Đa Tiêu Chí Chuẩn Hóa**:
   - Mỗi vòng thi có bộ tiêu chí riêng (Kỹ thuật, Sáng tạo, Trải nghiệm, Thuyết trình) với trọng số động (ví dụ: Kỹ thuật 30%, Sáng tạo 25%...).
   - Điểm số được chuẩn hóa công thức toán học tự động:
     $$\text{Total Weighted Score} = \sum_{i=1}^{n} \left( \frac{\text{Score}_i}{\text{MaxScore}_i} \times \text{Weight}_i \right)$$
   - Tự động hóa xếp hạng toàn bộ các đội thi theo từng bảng đấu và toàn giải trong 1 click chuột.

4. **Kiểm Toán Bảo Mật Bất Biến (Audit Log Trail)**:
   - Mọi thao tác trọng yếu (Phê duyệt tài khoản, Nộp bài thi, Chấm điểm, Khóa điểm, Tính xếp hạng, Loại đội thi) đều tự động ghi lại lịch sử bất biến trong bảng `audit_log` kèm Actor, Action, Entity, Timestamp và IP.
   - Không cung cấp bất kỳ API nào cho phép chỉnh sửa hay xóa bản ghi kiểm toán -> Đảm bảo tính minh bạch, khách quan và chống chối bỏ (Non-repudiation).

5. **Kiến Trúc Bảo Mật 3 Tầng BFF (Backend-For-Frontend)**:
   - Trình duyệt **hoàn toàn không được phép chạm vào Access Token**.
   - JWT được lưu trữ trong cookie `httpOnly` (`shms_at`, `shms_rt`), vô hiệu hóa 100% nguy cơ tấn công đánh cắp token qua XSS.
   - Chống tấn công giả mạo yêu cầu qua kỹ thuật **Double Submit CSRF Cookie** (`XSRF-TOKEN` cookie + `X-XSRF-TOKEN` header).

6. **Thiết Kế Cyber IT Editorial & 3D Interactive Mascot**:
   - Giao diện được trau chuốt theo ngôn ngữ thiết kế sang trọng, hiện đại với linh vật 3D Robot Hải Cẩu có hiệu ứng khí động học chuyển động theo trạng thái chuyển tab.
   - Đạt chuẩn tương thích Responsive từ màn hình điện thoại di động đến màn hình máy chiếu độ phân giải cao.

---

## 📊 2. Báo Cáo Chi Tiết Toàn Bộ Phân Hệ Chức Năng

| Phân hệ | Danh sách chức năng chính | Giá trị mang lại |
|---|---|---|
| **1. Cổng Thông Tin Công Khai** | • Giới thiệu giải đấu, lộ trình đa vòng, bảng giải thưởng 20Tr+<br>• Cổng bình chọn khán giả trực tiếp (`/vote`) với thanh đo dạ quang và chống spam vote<br>• Bảng xếp hạng Leaderboard Arena (`/rankings`) vinh danh Top 1-2-3 | Tăng tính lan tỏa cộng đồng và minh bạch kết quả với toàn thể sinh viên và nhà tài trợ. |
| **2. Quản Lý Đội Thi & Bài Nộp** | • Tạo đội từ 3–5 thành viên, gửi email mời thành viên vào đội<br>• Quản lý trạng thái đội thi (`REGISTERED`, `ACTIVE`, `DISQUALIFIED`)<br>• Nộp link GitHub repository, slide thuyết trình, link sản phẩm chạy demo<br>• Hệ thống tự động ghi nhận mốc thời gian và gắn cờ nộp muộn (`isLate`) | Giúp thí sinh chủ động quản lý bài thi, không bị thất lạc mã nguồn hay tài liệu. |
| **3. Phân Hệ Mentor Đồng Hành** | • Phân bổ Mentor theo bảng đấu chuyên môn (AI, Mobile, Web)<br>• Mentor truy cập xem chi tiết bài nộp của các đội trong bảng phụ trách<br>• Gửi góp ý kỹ thuật, nhận xét điểm mạnh/điểm yếu trước giờ chấm thi | Nâng cao chất lượng dự án của sinh viên, thể hiện mô hình Hackathon có cố vấn đồng hành thực tế. |
| **4. Ban Giám Khảo (Judge)** | • Chấm điểm độc lập theo ma trận tiêu chí có trọng số<br>• Nhập nhận xét chuyên môn chi tiết cho từng bài thi<br>• Cơ chế khóa điểm chính thức (**Finalize Score**)<br>• Tham gia Vòng hiệu chuẩn (**Calibration Round**) với bài nộp mẫu | Giám khảo chấm điểm công bằng, chuyên nghiệp và có cơ sở khoa học đối soát. |
| **5. Ban Tổ Chức (Coordinator)** | • Khởi tạo và quản lý sự kiện Hackathon đa vòng (Vòng loại, Vòng chung kết)<br>• Thiết lập tiêu chí và gán trọng số cho từng vòng đấu<br>• Phân công giám khảo theo Scope (Global hoặc từng Round cụ thể)<br>• Chạy thuật toán tính điểm và xếp hạng tự động<br>• Áp dụng luật thăng hạng tự động Top N lên vòng tiếp theo<br>• Xuất bảng điểm chính thức ra file chuẩn CSV/Excel<br>• Tra cứu và lọc toàn bộ Nhật ký kiểm toán (**Audit Log**) | Tự động hóa toàn bộ công việc tính toán thủ công bằng Excel trước đây, giảm sai sót xuống 0%. |

---

## 🎤 3. Kịch Bản Thuyết Trình "Hạ Gục Hội Đồng" (The Winning Pitch Flow)

Thời lượng lý tưởng: **10 – 12 phút**. Hãy dẫn dắt theo cấu trúc tâm lý sau:

### Phút 1–2: Mở Đầu Gây Ấn Tượng Mạnh (The Hook)
> *"Kính thưa Hội đồng, các cuộc thi Hackathon sinh viên hiện nay thường gặp 3 bài toán lớn: (1) Quản lý đội thi và bài nộp thủ công qua Google Form dễ thất lạc; (2) Chấm điểm bằng Excel thiếu minh bạch và có độ lệch đánh giá lớn giữa các giám khảo; (3) Khán giả và nhà tài trợ khó theo dõi kết quả trực tiếp thời gian thực.*  
> *Đó là lý do nhóm chúng em phát triển **SEAL Hackathon Management System (SHMS)** — một nền tảng số hóa toàn diện áp dụng kiến trúc 3 tầng bảo mật cao cấp kết hợp nghiên cứu khoa học đánh giá độ tin cậy liên đánh giá viên (RBL)."*

### Phút 3–4: Demo Trải Nghiệm Khán Giả & Đội Thi
- Trình chiếu Trang chủ và Linh vật 3D sống động.
- Vào trang `/vote`, bấm bình chọn trực tiếp một đội thi để thấy lượt vote cập nhật ngay tức thì.
- Chuyển sang Cửa sổ Đội trưởng: Xem đội thi `Team Rocket` và bài nộp GitHub repo kèm cờ nộp đúng hạn.

### Phút 5–7: Cao Trào Kỹ Thuật — Giám Khảo Chấm Thi & Vòng Hiệu Chuẩn RBL
- Đăng nhập tài khoản Giám khảo (`judge1@demo.local`).
- **Nói sâu vào tính năng Vòng hiệu chuẩn (Calibration)**:
  > *"Thưa Thầy Cô, trước khi chấm thi thật, hệ thống cung cấp Vòng hiệu chuẩn. Các giám khảo cùng chấm một bài mẫu để hệ thống phân tích phương sai (Variance) và độ lệch chuẩn. Từ đó, Giám khảo trưởng có thể phát hiện ngay nếu có giám khảo chấm quá gắt hoặc quá lỏng tay, đưa thang đo về mức đồng thuận."*
- Tiến hành chấm điểm theo ma trận trọng số và bấm **Khóa điểm (Finalize Score)**.

### Phút 8–10: Tổng Hợp Điểm, Xuất Bảng Điểm & Soi Nhật Ký Kiểm Toán
- Đăng nhập tài khoản Ban Tổ Chức (`coordinator@demo.local`).
- Bấm nút **Tính toán xếp hạng** -> Hệ thống tự động xếp thứ hạng toàn giải.
- Bấm nút **Xuất Bảng Điểm (CSV)** để chứng minh khả năng trích xuất dữ liệu báo cáo cho ban giám hiệu.
- Mở màn hình **Audit Log**:
  > *"Điểm đặc biệt nhất về mặt an ninh thông tin: Mọi thao tác chấm điểm vừa rồi đã được ghi nhận tự động vào Audit Log với đầy đủ IP, Thời gian và Hành động. Dữ liệu này là bất biến, bảo vệ tính liêm chính của giải thi."*

### Phút 11–12: Kết Luận & Thước Đo Chất Lượng Dự Án
- Khẳng định tính ổn định: **101 unit tests Frontend đạt 100% pass**, 94 tests Backend, triển khai 1-click qua Docker Compose.
- Cảm ơn Hội đồng và sẵn sàng bước vào phần Hỏi & Đáp (Q&A).

---

## 🧠 4. Bộ 12 Câu Hỏi Phản Biện Thường Gặp & Câu Trả Lời Ăn Điểm Tuyệt Đối

Dưới đây là 12 câu hỏi "tủ" mà các thầy cô chuyên môn phản biện phần mềm hay hỏi nhất, cùng câu trả lời chuẩn xác:

### ❓ Câu 1: Tại sao nhóm lại sử dụng thêm một tầng BFF (NestJS) mà không để React gọi thẳng xuống Spring Boot?
* **Đáp ăn điểm**:
  > *"Dạ thưa Thầy Cô, việc sử dụng kiến trúc BFF mang lại 3 lợi ích bảo mật và kiến trúc vượt trội:*  
  > *1. **Bảo mật Token**: Nếu để React gọi thẳng Spring Boot, JWT bắt buộc phải lưu trong localStorage của trình duyệt — rất dễ bị tin tặc đánh cắp qua lỗ hổng XSS. BFF cho phép lưu JWT trong Cookie `httpOnly`, JavaScript phía client không thể đọc được.*  
  > *2. **Chống CSRF hai lớp**: BFF đóng vai trò cổng kiểm soát CSRF Token trước khi ủy quyền xuống Core Backend.*  
  > *3. **Che giấu cấu trúc mạng nội bộ**: Backend Spring Boot không cần mở cổng public ra ngoài Internet mà chỉ giao tiếp trong mạng nội bộ Docker với BFF."*

---

### ❓ Câu 2: Nếu có 2 giám khảo chấm điểm rất lệch nhau cho cùng một bài thi thì hệ thống giải quyết như thế nào?
* **Đáp ăn điểm**:
  > *"Dạ, hệ thống của nhóm giải quyết bài toán này theo cả 2 giai đoạn:*  
  > *1. **Giai đoạn Tiền chấm thi**: Cung cấp **Vòng hiệu chuẩn (Calibration Round)** để các giám khảo cùng chấm 1 bài mẫu, từ đó thống nhất tiêu chí đánh giá.*  
  > *2. **Giai đoạn Tổng hợp**: Phân hệ **RBL Analysis** của hệ thống tự động tính toán $Mean$ (Điểm trung bình) và $StdDev$ (Độ lệch chuẩn) của từng tiêu chí. Ban tổ chức sẽ nhìn thấy ngay tiêu chí nào có độ lệch chuẩn cao bất thường để mời 2 giám khảo đó cùng hội ý hoặc mời Giám khảo trưởng chấm phúc khảo."*

---

### ❓ Câu 3: Làm sao hệ thống ngăn chặn việc Ban Tổ Chức hoặc Thí sinh tự ý sửa điểm sau khi cuộc thi kết thúc?
* **Đáp ăn điểm**:
  > *"Dạ, hệ thống áp dụng cơ chế 2 lớp phòng thủ:*  
  > *1. **Trạng thái Finalize**: Khi giám khảo bấm 'Khóa điểm', trường `finalized` chuyển thành `true`. Backend sẽ chặn toàn bộ các request cập nhật tiếp theo nếu không có sự phê duyệt mở khóa đặc biệt.*  
  > *2. **Kiểm toán bất biến (Audit Log)**: Mọi thao tác đều được hệ thống ghi log tự động ở tầng Service. Cơ sở dữ liệu không cấp quyền sửa/xóa bảng này qua API. Nếu có ai can thiệp trực tiếp vào DB, nhật ký kiểm toán sẽ không khớp, chứng minh có sự bất thường."*

---

### ❓ Câu 4: Phân quyền trong hệ thống được thiết kế như thế nào? Một người có thể vừa là Giám khảo vòng 1, vừa là Mentor vòng 2 không?
* **Đáp ăn điểm**:
  > *"Dạ, nhóm thiết kế mô hình phân quyền động theo **Role & Scope (Phân quyền 2 chiều)**:*  
  > *- **Role**: `COORDINATOR`, `JUDGE`, `MENTOR`, `LEADER`, `STUDENT`.*  
  > *- **Scope Type**: `GLOBAL`, `TRACK`, hoặc `ROUND`.*  
  > *Nhờ vậy, một giảng viên có thể có quyền `JUDGE` với Scope là `ROUND_1`, nhưng ở `ROUND_2` lại có Scope `MENTOR` cho bảng AI. Spring Security kết hợp với JwtFilter sẽ kiểm tra chính xác User ID, Role và Scope ID của từng request."*

---

### ❓ Câu 5: Thuật toán tính điểm có xét đến trọng số tiêu chí (Criteria Weight) như thế nào?
* **Đáp ăn điểm**:
  > *"Dạ, hệ thống hỗ trợ trọng số linh hoạt (tổng trọng số các tiêu chí trong 1 vòng luôn được chuẩn hóa về 100%).*  
  > *Mỗi tiêu chí có thang điểm tối đa (ví dụ 10 điểm). Khi giám khảo chấm điểm $S_i$, điểm thành phần có trọng số là:*  
  > $$W_i = \frac{S_i}{\text{MaxScore}_i} \times \text{Weight}_i$$  
  > *Điểm của bài thi là trung bình cộng điểm thành phần của tất cả các giám khảo được phân công trong vòng đó."*

---

### ❓ Câu 6: Làm thế nào để cổng bình chọn khán giả trực tiếp `/vote` không bị tấn công spam vote?
* **Đáp ăn điểm**:
  > *"Dạ, nhóm áp dụng cơ chế chống gian lận đa tầng:*  
  > *1. **Client-side Storage Lock**: Lưu vết mã bầu chọn theo từng Track trên localStorage, khóa nút bình chọn ngay khi người dùng đã bỏ phiếu.*  
  > *2. **Backend Rate-Limiting & IP/Device Fingerprinting**: Giới hạn tần suất gọi API bình chọn.*  
  > *3. **Optimistic Locking trên Database**: Khi hàng trăm khán giả cùng vote trong 1 giây, cơ sở dữ liệu xử lý an toàn không bị Race Condition làm sai lệch tổng số phiếu."*

---

### ❓ Câu 7: Khi có bài thi nộp muộn sau Deadline thì hệ thống xử lý ra sao?
* **Đáp ăn điểm**:
  > *"Dạ, hệ thống không chặn hoàn toàn việc nộp bài để tạo điều kiện linh hoạt cho thí sinh, nhưng sẽ tự động so sánh thời điểm nộp với `submission_deadline` của vòng thi. Nếu trễ, trường `is_late` sẽ tự động chuyển thành `TRUE` và hiển thị nhãn cảnh báo màu đỏ trên giao diện chấm của Giám khảo để Hội đồng cân nhắc trừ điểm chuyên cần."*

---

### ❓ Câu 8: Mật khẩu người dùng được lưu trữ như thế nào trong cơ sở dữ liệu?
* **Đáp ăn điểm**:
  > *"Dạ, toàn bộ mật khẩu người dùng đều được mã hóa bằng thuật toán băm một chiều **BCrypt với Salt ngẫu nhiên** (`gen_salt('bf')`). Ngay cả quản trị viên hệ thống có quyền truy cập trực tiếp vào PostgreSQL cũng không thể giải mã được mật khẩu gốc của người dùng."*

---

### ❓ Câu 9: Nhóm đã thực hiện kiểm thử phần mềm như thế nào để đảm bảo chất lượng?
* **Đáp ăn điểm**:
  > *"Dạ, nhóm đã thiết lập hệ thống kiểm thử tự động toàn diện:*  
  > *- **Frontend**: 101 unit tests viết bằng Vitest và React Testing Library bao phủ từ xác thực, bình chọn, bảng xếp hạng đến các tương tác UI (đạt tỷ lệ pass 100%).*  
  > *- **Backend**: 94 tests tích hợp và unit tests bằng JUnit 5 & Mockito kiểm thử các luật nghiệp vụ tính điểm, phân quyền, và toàn vẹn dữ liệu.*  
  > *- **DevOps**: Tích hợp Docker Healthcheck tự động giám sát tình trạng sống/chết của các container."*

---

### ❓ Câu 10: Nếu muốn triển khai hệ thống này cho một trường đại học khác thì cần cấu hình những gì?
* **Đáp ăn điểm**:
  > *"Dạ, hệ thống được thiết kế hoàn toàn theo tư duy **Multi-tenant Ready / Reusable Template**:*  
  > *1. Bộ tiêu chí chấm điểm được đóng gói thành các **Criteria Template** dùng lại được.*  
  > *2. Tất cả cấu hình kết nối DB, JWT Secret, CORS URL đều được tham số hóa qua biến môi trường `.env`.*  
  > *3. Chỉ cần chạy `docker compose up -d` là hệ thống tự động khởi tạo cơ sở dữ liệu và sẵn sàng hoạt động trong 1 phút."*

---

### ❓ Câu 11: Vai trò của Giám khảo khách mời (Guest Judge) khác gì so với Giám khảo nội bộ?
* **Đáp ăn điểm**:
  > *"Dạ, Giám khảo khách mời là các chuyên gia doanh nghiệp (ví dụ từ FPT Software hay các công ty công nghệ). Họ có thể được tạo tài khoản nhanh chóng để tham gia chấm một vòng thi nhất định mà không cần qua quy trình duyệt tài khoản cán bộ trường học, và điểm số của họ được gắn cờ phục vụ phân tích đối sánh độ lệch giữa góc nhìn học thuật và thực tiễn doanh nghiệp."*

---

### ❓ Câu 12: Khó khăn kỹ thuật lớn nhất mà nhóm đã gặp phải và cách giải quyết là gì?
* **Đáp ăn điểm**:
  > *"Dạ, khó khăn lớn nhất là việc xử lý tính nhất quán của dữ liệu chấm thi khi nhiều giám khảo cùng chấm điểm đồng thời và cơ chế đồng bộ phiên làm việc qua Cookie HttpOnly giữa 3 tầng độc lập (React -> NestJS BFF -> Spring Boot). Nhóm đã nghiên cứu và giải quyết bằng cách áp dụng mô hình Proxy ủy quyền xác thực tại BFF, kết hợp Transaction Isolation và Flyway Migration để đảm bảo cơ sở dữ liệu luôn đồng nhất tuyệt đối."*

---

## 🏁 Lời Chúc Thành Công

Hãy tự tin, đứng thẳng lưng, mắt nhìn thẳng vào Thầy Cô và trình bày với niềm đam mê của những kỹ sư phần mềm thực thụ. Chúc nhóm bảo vệ thành công rực rỡ và đạt điểm số cao nhất! 🚀
