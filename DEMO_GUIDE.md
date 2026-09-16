# 🚀 Cẩm Nang Toàn Diện Hướng Dẫn Chạy Demo SEAL Hackathon (Chuẩn Điểm A+)

> **Hệ Thống**: SEAL Hackathon Management System (SHMS)  
> **Dành cho**: Toàn bộ nhóm phát triển (Presenter, Driver, Tech Support)  
> **Thời lượng demo chuẩn**: 12 – 15 phút  
> **Mục tiêu**: Hướng dẫn chi tiết từng giây, từng thao tác click chuột, bảng phân công nhiệm vụ và kịch bản lời thoại mẫu word-for-word nhằm thuyết phục Hội đồng phản biện cho điểm tối đa A+.

---

## ⏱️ 1. Chuẩn Bị Trước Giờ G (Pre-Flight Setup)

Để buổi báo cáo diễn ra trơn tru và không lãng phí dù chỉ 1 giây, nhóm phải hoàn thành các bước chuẩn bị này trước khi bước lên bục thuyết trình:

### 1.1. Khởi động hệ thống Docker 4 Container
Mở PowerShell (Run as Administrator nếu cần) và chạy:
```powershell
cd "C:\SEAL_HACKATHON-main (1)\SEAL_HACKATHON-main"
docker compose up -d
```
Kiểm tra trạng thái cả 4 container:
```powershell
docker compose ps
```
*Yêu cầu bắt buộc: Cả 4 service `seal-frontend`, `seal-bff`, `seal-backend`, `seal-postgres` đều phải hiển thị `Up (healthy)`.*

---

### 1.2. Chiến thuật "4 Cửa Sổ Trình Duyệt" (Bí Quyết Chuyển Vai Trong 2 Giây)
> ⚠️ **LƯU Ý CỰC KỲ QUAN TRỌNG**:  
> **TUYỆT ĐỐI KHÔNG đăng xuất rồi đăng nhập lại nhiều lần trên cùng 1 tab!** Việc này làm gián đoạn mạch nói, tốn thời gian và dễ gõ nhầm mật khẩu trước mặt Thầy Cô.  
> Thay vào đó, hãy mở sẵn **4 Cửa Sổ Trình Duyệt riêng biệt** (sử dụng 4 Profile Chrome khác nhau hoặc Profile thường + Tab ẩn danh):

| Cửa sổ | Chế độ mở | Đăng nhập tài khoản | Màn hình mở sẵn | Mục đích demo |
|:---:|---|---|---|---|
| **Cửa sổ 1** | Chrome thường | *(Không đăng nhập)* | `http://localhost:3000` | Demo Trang chủ, Dark Mode, Song ngữ, Trợ lý AI SEAL Bot, Bình chọn khán giả (`/vote`), Bảng xếp hạng (`/rankings`) |
| **Cửa sổ 2** | Profile 1 hoặc Ẩn danh 1 | `leader@demo.local` / `Demo@123456` | `http://localhost:3000/app/team` | Demo góc nhìn Đội trưởng: Xem thành viên, nộp link Git repo, slide, tài liệu demo |
| **Cửa sổ 3** | Profile 2 hoặc Ẩn danh 2 | `judge1@demo.local` / `Demo@123456` | `http://localhost:3000/judge` | Demo góc nhìn Giám khảo: Vòng hiệu chuẩn RBL, chấm điểm ma trận tiêu chí có trọng số, khóa điểm |
| **Cửa sổ 4** | Profile 3 hoặc Ẩn danh 3 | `coordinator@demo.local` / `Demo@123456` | `http://localhost:3000/app/coordinator` | Demo góc nhìn Ban Tổ Chức: Tính xếp hạng tự động, thăng hạng Top N, xuất CSV/Excel, soi Audit Log |

👉 *Khi thuyết trình, Driver chỉ cần dùng tổ hợp phím **`Alt + Tab`** để chuyển đổi giữa 4 cửa sổ trong tích tắc!*

---

### 1.3. Bảng Tài Khoản & Mật Khẩu Mẫu

| Vai trò | Email đăng nhập | Mật khẩu chuẩn | Ghi chú quyền hạn |
|---|---|---|---|
| **Ban Tổ Chức (Coordinator)** | `coordinator@demo.local` | `Demo@123456` | Toàn quyền cấu hình sự kiện, thăng hạng Top N, xuất điểm, tra cứu Audit Log |
| **Giám Khảo 1 (Lead Judge)** | `judge1@demo.local` | `Demo@123456` | Chấm thi 4 tiêu chí trọng số & tham gia Vòng hiệu chuẩn (Calibration) |
| **Giám Khảo 2 (Guest Judge)** | `judge2@demo.local` | `Demo@123456` | Giám khảo đối soát độc lập chứng minh phương sai Variance |
| **Mentor Chuyên Môn** | `mentor1@demo.local` | `Demo@123456` | Đọc bài nộp của đội và gửi nhận xét góp ý kỹ thuật |
| **Đội Trưởng (Team Leader)** | `leader@demo.local` | `Demo@123456` | Quản lý đội Team Rocket, nộp repository GitHub |

---

## 👥 2. Phân Công Vai Trò Trong Nhóm Khi Lên Sàn

| Thành viên | Trách nhiệm chính | Lưu ý khi thực hiện |
|---|---|---|
| **1. Presenter (Thuyết trình chính)** | Đứng đối diện Hội đồng, nói dõng dạc, dẫn dắt theo kịch bản lời thoại. | Dùng các từ khóa công nghệ đắt giá: *Kiến trúc 3 tầng BFF, Nghiên cứu hiệu chuẩn RBL, Inter-Rater Reliability ICC, Ma trận trọng số Rubric, Kiểm toán bất biến Audit Log*. |
| **2. Driver (Điều khiển máy tính)** | Ngồi trước laptop, thao tác chuột dứt khoát theo lời nói của Presenter. | **Không bấm trước khi Presenter nói tới**. Dùng `Alt + Tab` mượt mà giữa các cửa sổ. Nhấn `Ctrl + F5` nếu cần tải lại. |
| **3. Tech Support & Timekeeper** | Canh thời gian (10-15 phút), báo hiệu khi còn 5 phút và 2 phút. | Mở sẵn Terminal nền phòng khi có lỗi cổng mạng cần gõ lệnh khẩn cấp. |

---

## 🎬 3. Kịch Bản Demo Từng Bước Chi Tiết (Timeline 12 Phút)

---

### 🌟 PHASE 1: CỔNG THÔNG TIN CÔNG KHAI & ĐẲNG CẤP GIAO DIỆN (3 Phút)
* **Cửa sổ thao tác**: Cửa sổ 1 (Chế độ thường - `http://localhost:3000`)
* **Mục tiêu**: Tạo ấn tượng thị giác choáng ngợp, chứng minh tính chuyên nghiệp, tính năng song ngữ, chống chói mắt và Trợ lý AI.

#### Bước 1.1: Mở màn & Giới thiệu tổng quan (45 giây)
* **Lời thoại Presenter**:
  > *"Kính thưa Thầy Cô và Hội đồng phản biện, nhóm chúng em xin phép trình bày dự án **SEAL Hackathon Management System (SHMS)** — Nền tảng số hóa toàn diện quy trình tổ chức và đánh giá cuộc thi lập trình công nghệ của Khoa Kỹ thuật Phần mềm và FPT Software.*  
  > *Điểm nhấn đầu tiên khi truy cập hệ thống là giao diện mang phong cách **Cyber IT Editorial** cao cấp, tích hợp linh vật 3D Robot Hải Cẩu tương tác khí động học, phản ánh tinh thần công nghệ của sinh viên IT."*
* **Thao tác Driver**:
  - Cuộn nhẹ trang từ trên xuống dưới: Lướt qua phần thống kê (500+ sinh viên, 50+ đội thi, giải thưởng 20Tr+), lộ trình 3 vòng thi, bảng tiêu chí và bục giải thưởng.

#### Bước 1.2: Khoe tính năng Dark Mode & Song Ngữ Quốc Tế (45 giây - GÂY ẤN TƯỢNG)
* **Lời thoại Presenter**:
  > *"Để mang lại trải nghiệm tối ưu cho thí sinh lập trình đêm (hackathon overnight) và sẵn sàng cho các bảng đấu sinh viên quốc tế, hệ thống hỗ trợ 2 tính năng nổi bật:*  
  > *Thứ nhất là chế độ **Dark Theme (Cyber Midnight Hull)** được tinh chỉnh độ tương phản cao, dịu mắt, loại bỏ hoàn toàn hiện tượng chói lóa.*  
  > *Thứ hai là hệ thống **Song ngữ i18n 1-Click** cho phép chuyển đổi toàn bộ giao diện sang tiếng Anh chuẩn quốc tế."*
* **Thao tác Driver**:
  1. Bấm vào nút biểu tượng **Trăng / Mặt trời** trên thanh điều hướng (`ThemeToggle`). Toàn bộ giao diện đổi sang màu đen Cyber huyền ảo, các nút bấm chuyển sang tông Frosted Glass không hề chói mắt. Bấm lại về Light Mode (hoặc giữ Dark Mode nếu Thầy Cô thích).
  2. Bấm vào nút **`🇻🇳 VI`** -> chuyển sang **`🇬🇧 EN`**. Toàn bộ tiêu đề *"Arena of Technology"*, các thẻ tính năng, tiêu chí và lộ trình đều chuyển sang tiếng Anh. Bấm lại về `🇻🇳 VI`.

#### Bước 1.3: Trình diễn Trợ Lý Ảo AI SEAL Bot Thông Minh (45 giây - GHI ĐIỂM BẤT NGỜ)
* **Lời thoại Presenter**:
  > *"Điểm đặc biệt phục vụ giải đáp 24/7 cho thí sinh mà không cần nhân sự trực bàn tổ chức là **Trợ lý Ảo AI SEAL Bot** được tích hợp ngay góc màn hình. Bot được nạp sẵn cơ sở tri thức về thể lệ cuộc thi, tiêu chuẩn nộp bài Git và thuật toán RBL."*
* **Thao tác Driver**:
  1. Bấm vào biểu tượng **Linh vật SEAL Bot** phát sáng ở góc dưới bên phải màn hình -> Ngăn kéo chat (`MascotChatDrawer`) trượt ra mượt mà.
  2. Bấm vào câu hỏi gợi ý: **"Thể lệ cuộc thi thế nào?"** hoặc **"Tiêu chí chấm điểm ra sao?"**.
  3. AI phản hồi tức thì với định dạng bullet rõ ràng về số lượng thành viên (3-5 bạn), các vòng thi và tiêu chí kỹ thuật.
  4. Bấm nút đóng chat (X).

#### Bước 1.4: Cổng Bình Chọn Khán Giả Thời Gian Thực (`/vote`) (45 giây)
* **Lời thoại Presenter**:
  > *"Để tăng tính gắn kết cộng đồng, hệ thống cung cấp Cổng bình chọn khán giả công khai với cơ chế mã hóa chống spam phiếu. Khán giả có thể bình chọn trực tiếp cho đội thi mình yêu thích tại Đêm Chung Kết."*
* **Thao tác Driver**:
  1. Bấm vào menu **"Bình chọn"** trên thanh điều hướng (chuyển đến `/vote`).
  2. Chọn bảng đấu **"Mobile Application"** -> Hiện 2 đội thi `Team Rocket` và `Byte Force`.
  3. Bấm nút **"Bình chọn cho đội này"** trên thẻ `Team Rocket`.
  4. Số phiếu tăng lên ngay lập tức kèm hiệu ứng chúc mừng, và nút chuyển sang trạng thái đã bình chọn dạ quang xanh lá.
  5. Bấm xem nhanh menu **"Bảng xếp hạng"** (`/rankings`), chỉ cho Thầy Cô thấy bục vinh danh Top 1-2-3 Leaderboard Arena.

---

### 🚀 PHASE 2: GÓC NHÌN ĐỘI THI & QUẢN LÝ BÀI NỘP (2 Phút)
* **Cửa sổ thao tác**: Nhấn `Alt + Tab` sang **Cửa sổ 2** (Đội trưởng `leader@demo.local`)
* **Mục tiêu**: Chứng minh quy trình đăng ký, quản lý thành viên và nộp bài chuẩn GitHub.

#### Bước 2.1: Quản lý đội thi (`/app/team`)
* **Lời thoại Presenter**:
  > *"Tiếp theo là góc nhìn của thí sinh tham gia giải đấu. Đội trưởng Team Rocket đăng nhập vào hệ thống để theo dõi đội thi và nộp sản phẩm cho Vòng Chung Kết."*
* **Thao tác Driver**:
  - Mở trang **"Đội của tôi"** (`/app/team`).
  - Rê chuột chỉ vào danh sách thành viên đội thi (3 thành viên), trạng thái phê duyệt `ACTIVE`.
  - Giới thiệu tính năng gửi lời mời thành viên mới qua email sinh viên FPT hoặc trường ngoài.

#### Bước 2.2: Nộp sản phẩm & Ghi nhận thời gian bất biến (`/app/submissions`)
* **Lời thoại Presenter**:
  > *"Hệ thống chuẩn hóa hoàn toàn việc nộp bài thi theo phong cách phần mềm chuyên nghiệp: Thí sinh nộp link Git repository chứa mã nguồn, link video demo YouTube và link tài liệu kiến trúc hệ thống.*  
  > *Mỗi lượt nộp bài đều được hệ thống tự động đóng dấu thời gian (Timestamp) chính xác đến từng giây. Nếu nộp sau hạn chót (Deadline), hệ thống sẽ tự động bật cờ cảnh báo trễ hạn (`isLate`) cho Hội đồng giám khảo biết."*
* **Thao tác Driver**:
  - Vào phần **"Nộp bài thi"** (`/app/submissions`).
  - Cho Thầy Cô thấy các trường dữ liệu: Link repo `https://github.com/demo/team-rocket`, video demo, mô tả giải pháp.

---

### 🧑‍🏫 PHASE 3: MENTOR ĐỒNG HÀNH & GÓP Ý KỸ THUẬT (1.5 Phút)
* **Cửa sổ thao tác**: Cửa sổ Mentor (hoặc đăng nhập nhanh `mentor1@demo.local`)
* **Mục tiêu**: Thể hiện tính năng cố vấn chuyên môn, giúp sinh viên cải thiện sản phẩm trước giờ G.

* **Lời thoại Presenter**:
  > *"Khác với các cuộc thi truyền thống nơi thí sinh nộp bài rồi chấm điểm ngay, SEAL Hackathon có phân hệ Mentor đồng hành. Các chuyên gia phần mềm được phân công theo bảng đấu sẽ vào xem bài nộp của các đội để góp ý cải tiến kiến trúc trước khi chấm thi chính thức."*
* **Thao tác Driver**:
  - Vào màn hình **"Mentor"** (`/mentor`).
  - Chọn đội `Team Rocket`.
  - Mở phần góp ý, gõ nhanh nhận xét mẫu: *"Kiến trúc 3 tầng tốt, cần bổ sung thêm caching Redis và unit test coverage cho module thanh toán"*.
  - Bấm **Gửi góp ý**.

---

### ⚖️ PHASE 4: HỘI ĐỒNG GIÁM KHẢO & VÒNG HIỆU CHUẨN RBL (3.5 Phút - ĐIỂM SÁNG HỌC THUẬT SỐ 1!)
* **Cửa sổ thao tác**: Nhấn `Alt + Tab` sang **Cửa sổ 3** (Giám khảo `judge1@demo.local`)
* **Mục tiêu**: Làm nổi bật hàm lượng học thuật cao nhất của đề tài — Vòng hiệu chuẩn và Ma trận tiêu chí có trọng số.

#### Bước 4.1: Giới thiệu Vòng Hiệu Chuẩn (Calibration Round) (1.5 Phút - NÓI RÕ PHẦN NÀY ĐỂ ĐẠT ĐIỂM A+)
* **Lời thoại Presenter**:
  > *"Kính thưa Thầy Cô, đây chính là trái tim học thuật tạo nên sự khác biệt hoàn toàn của đề tài so với các phần mềm thông thường: **Nghiên cứu Hiệu chuẩn Đánh giá (RBL - Rubric-Based Learning)**.*  
  > *Trong các hội đồng chấm thi, luôn có hiện tượng: Giám khảo A chấm rất khắt khe (điểm thấp), Giám khảo B lại quá dễ tính (điểm cao). Điều này tạo ra sự bất công lớn cho thí sinh.*  
  > *Để giải quyết triệt để, hệ thống thiết kế tính năng **Vòng hiệu chuẩn (Calibration Round)**: Trước khi bước vào chấm các bài thi thật, toàn bộ Giám khảo sẽ cùng chấm độc lập một bài thi mẫu (Sample Submission).*  
  > *Hệ thống tự động tính toán Phương sai (Variance), Độ lệch chuẩn (StdDev) và Điểm trung bình (Mean) giữa các giám khảo để đo lường Hệ số tương quan nội lớp (**ICC - Intraclass Correlation Coefficient**). Nhờ đó, Giám khảo trưởng có thể phát hiện độ lệch và hiệu chuẩn lại thước đo đánh giá trước khi giải đấu diễn ra."*
* **Thao tác Driver**:
  - Vào mục **"Chấm điểm"** (`/judge`).
  - Bấm chọn tab **"Vòng hiệu chuẩn (Calibration)"**.
  - Chỉ vào bài nộp mẫu và bảng phân phối điểm số của các giám khảo.

#### Bước 4.2: Chấm điểm bài thi chính thức & Khóa điểm (Finalize Score) (2 Phút)
* **Lời thoại Presenter**:
  > *"Sau khi đã hiệu chuẩn, Giám khảo tiến hành chấm bài thi chính thức của Vòng Chung Kết theo Ma trận tiêu chí chuẩn hóa có trọng số."*
* **Thao tác Driver**:
  - Chọn đội thi `Team Rocket`.
  - Màn hình hiển thị 4 tiêu chí trọng số:
    1. **Kỹ thuật & Kiến trúc phần mềm (Trọng số 35%)**: Kéo thanh trượt lên **9.5 điểm**.
    2. **Tính sáng tạo & Đổi mới (Trọng số 25%)**: Kéo thanh trượt lên **9.0 điểm**.
    3. **Trải nghiệm người dùng UX/UI (Trọng số 20%)**: Kéo thanh trượt lên **8.5 điểm**.
    4. **Tính khả thi & Tiềm năng thực tế (Trọng số 20%)**: Kéo thanh trượt lên **9.0 điểm**.
  - Nhập nhận xét chuyên môn: *"Chất lượng mã nguồn xuất sắc, tài liệu kiến trúc đầy đủ, sản phẩm chạy demo mượt mà"*.
  - Bấm nút **"Khóa điểm (Finalize Score)"**.
  - Hệ thống hiển thị hộp thoại xác nhận và chuyển trạng thái bài chấm sang màu xanh đã chốt.
* **Lời thoại Presenter**:
  > *"Khi đã bấm Khóa điểm, hệ thống đóng băng toàn bộ điểm số của giám khảo này. Không ai có thể tự ý sửa đổi nếu không có sự can thiệp và phê duyệt của Ban Tổ Chức, chống hoàn toàn nguy cơ gian lận sửa điểm sau giờ thi."*

---

### 🎛️ PHASE 5: BAN TỔ CHỨC ĐIỀU PHỐI, TÍNH ĐIỂM & KIỂM TOÁN BẤT BIẾN (3 Phút)
* **Cửa sổ thao tác**: Nhấn `Alt + Tab` sang **Cửa sổ 4** (Ban Tổ Chức `coordinator@demo.local`)
* **Mục tiêu**: Thể hiện năng lực quản trị toàn diện, tự động hóa tính điểm và bảo mật cấp doanh nghiệp.

#### Bước 5.1: Thuật toán tính điểm ma trận & Xếp hạng tự động (`/app/coordinator`)
* **Lời thoại Presenter**:
  > *"Giờ đây, toàn quyền điều phối thuộc về Ban Tổ Chức. Thay vì phải sao chép điểm thủ công vào bảng tính Excel mất hàng giờ và dễ nhầm lẫn công thức, Ban Tổ Chức chỉ cần bấm 1 nút duy nhất."*
* **Thao tác Driver**:
  - Vào màn hình **"Điều phối"** (`/app/coordinator`).
  - Chọn Vòng thi **"Vòng Chung Kết"**.
  - Bấm nút **"Tính toán bảng xếp hạng (Calculate Rankings)"**.
  - Hệ thống tự động tổng hợp điểm theo công thức:
    $$\text{Điểm Tổng Hợp} = \sum (\text{Điểm Tiêu Chí} \times \text{Trọng Số})$$
  - Bảng xếp hạng cập nhật ngay lập tức: `Team Rocket` vươn lên vị trí **Hạng 1 (Quán quân)** với điểm số chi tiết.

#### Bước 5.2: Thăng hạng tự động Top N & Xuất báo cáo CSV/Excel
* **Lời thoại Presenter**:
  > *"Hệ thống hỗ trợ áp dụng luật thăng hạng Top N tự động. Đội ngũ tổ chức cũng có thể xuất file báo cáo kết quả xếp hạng chính thức gửi cho Ban Giám hiệu nhà trường chỉ trong 1 giây."*
* **Thao tác Driver**:
  - Bấm nút **"Xuất Bảng Điểm (CSV / Excel)"**.
  - File bảng điểm chính thức được tải về máy tính ngay lập tức. Driver mở nhanh file hoặc chỉ vào thông báo tải thành công.

#### Bước 5.3: Minh chứng Nhật Ký Kiểm Toán Bất Biến (`/app/audit` - BẢO MẬT ĐỈNH CAO!)
* **Lời thoại Presenter**:
  > *"Và đây là minh chứng bảo mật mạnh mẽ nhất cho toàn bộ hệ thống: **Nhật ký kiểm toán (Audit Log Trail)**.*  
  > *Mọi thao tác chúng em vừa thực hiện từ đầu buổi demo — từ bình chọn khán giả, nộp bài thi, giám khảo chấm điểm, khóa điểm, đến tính toán xếp hạng — đều được hệ thống tự động ghi nhận vào Audit Log với thời gian thực, IP máy tính, Actor ID và loại hành động.*  
  > *Hệ thống thiết kế theo nguyên tắc Append-Only, tuyệt đối không cung cấp bất kỳ API nào cho phép chỉnh sửa hay xóa bản ghi kiểm toán này."*
* **Thao tác Driver**:
  - Vào màn hình **"Nhật ký kiểm toán"** (`/app/audit`).
  - Cuộn cho Thầy Cô thấy các dòng nhật ký vừa sinh ra: `SCORE_FINALIZE`, `RANKING_COMPUTE`, `VOTE_CAST`.

---

### 🏁 PHASE 6: KẾT LUẬN & SẴN SÀNG HỎI ĐÁP (1 Phút)
* **Lời thoại Presenter**:
  > *"Kính thưa Quý Thầy Cô trong Hội đồng, tóm lại hệ thống SEAL Hackathon Management System của nhóm chúng em tự hào đạt được 3 giá trị cốt lõi:*  
  > *1. **Về mặt kỹ thuật**: Áp dụng kiến trúc 3 tầng bảo mật BFF che giấu token, tích hợp Trợ lý AI và hỗ trợ Song ngữ toàn diện.*  
  > *2. **Về mặt học thuật**: Ứng dụng thành công nghiên cứu hiệu chuẩn RBL và phân tích phương sai liên đánh giá viên ICC.*  
  > *3. **Về mặt chất lượng phần mềm**: Đạt tỷ lệ kiểm thử tự động **101/101 tests Frontend pass 100%**, 94 tests Backend, triển khai 1-click Docker Compose sẵn sàng đưa vào vận hành thực tế.*  
  > *Nhóm chúng em xin chân thành cảm ơn Thầy Cô đã lắng nghe và rất mong nhận được những câu hỏi góp ý từ Hội đồng!"*
* **Thao tác Driver**:
  - Chuyển màn hình về Trang chủ lung linh với linh vật robot, sẵn sàng thao tác bất kỳ màn hình nào Thầy Cô yêu cầu kiểm tra.

---

## 🛡️ 4. Xử Lý Các Tình Huống "Bẫy" Của Thầy Cô Khi Hỏi Đáp (Q&A)

### ❓ Tình huống 1: Thầy bảo "Em thử nhập điểm số ngoài thang 0-10 hoặc để trống tiêu chí xem hệ thống xử lý thế nào?"
* **Cách ứng phó**: Driver mở màn hình chấm điểm, nhập thử số `-5` hoặc `15`.
* **Presenter trả lời**: *"Dạ thưa Thầy, hệ thống áp dụng cơ chế xác thực dữ liệu 2 lớp (Double Validation): Tại Frontend có thanh trượt giới hạn cứng `min=0, max=10`, và tại Backend Spring Boot có Bean Validation `@Min(0) @Max(10)` ném ra lỗi `400 Bad Request` nếu phát hiện dữ liệu gian lận."*

### ❓ Tình huống 2: Thầy bảo "Nếu 2 giám khảo cùng chấm điểm cho 1 đội cùng 1 lúc thì dữ liệu có bị ghi đè lên nhau không?"
* **Presenter trả lời**: *"Dạ thưa Thầy, hệ thống quản lý bài chấm theo cặp khóa `(submission_id, judge_id)`. Mỗi giám khảo sở hữu một bản ghi đánh giá độc lập hoàn toàn trong cơ sở dữ liệu. Chỉ khi Ban Tổ Chức bấm 'Tính xếp hạng', hệ thống mới gom các bản ghi độc lập này để tính trung bình cộng có trọng số theo Isolation Level an toàn, nên hoàn toàn không xảy ra xung đột ghi đè."*

### ❓ Tình huống 3: Thầy bảo "Em thử F5 lại trang xem Trợ lý AI và Ngôn ngữ tiếng Anh có bị mất không?"
* **Cách ứng phó**: Driver bấm chuyển sang tiếng Anh (`GB EN`), sau đó bấm **F5**. Trang tải lại vẫn giữ nguyên tiếng Anh.
* **Presenter trả lời**: *"Dạ thưa Thầy, trạng thái ngôn ngữ và chế độ giao diện được lưu trữ bền vững trong `localStorage` qua custom hook `useLanguage` và `useTheme`, nên người dùng dù tải lại trang hay mở tab mới đều được duy trì đúng ngữ cảnh."*

---

## 📋 5. Tóm Tắt Phím Tắt Khẩn Cấp Dành Cho Driver

| Phím tắt | Tác dụng | Dùng khi nào |
|---|---|---|
| **`Alt + Tab`** | Chuyển nhanh giữa 4 cửa sổ vai trò | Dùng xuyên suốt bài demo để đổi vai trong 1 giây |
| **`Ctrl + F5`** | Xóa cache và tải lại trang triệt để | Dùng nếu ảnh hoặc style bị cũ |
| **`F11`** | Bật / Tắt chế độ toàn màn hình Fullscreen | Bật lên để giao diện đẹp như ứng dụng Desktop chuyên nghiệp |
| **`Ctrl + Shift + N`** | Mở cửa sổ ẩn danh mới | Dùng nếu cần thử đăng nhập một vai trò mới đột xuất |

Chúc cả nhóm có một buổi bảo vệ tự tin, phối hợp nhịp nhàng và đạt điểm số tuyệt đối A+! 🎓🚀
