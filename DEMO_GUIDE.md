# 🚀 Cẩm Nang Hướng Dẫn Chạy Demo SEAL Hackathon (Dành Cho Team)

Tài liệu này là cẩm nang bỏ túi dành riêng cho tất cả các thành viên trong nhóm phát triển nhằm chuẩn bị và phối hợp chạy demo trơn tru, chuyên nghiệp và không bị bất kỳ sự cố kỹ thuật nào trong buổi báo cáo với Thầy Cô / Hội đồng phản biện.

---

## ⏱️ 1. Checklist 5 Phút Trước Giờ G (Pre-Demo Checklist)

Các thành viên phụ trách máy chiếu/máy demo phải hoàn thành checklist này trước khi Thầy Cô gọi tên:

- [ ] **Khởi động Docker**:
  ```powershell
  cd "C:\SEAL_HACKATHON-main (1)\SEAL_HACKATHON-main"
  docker compose up -d
  ```
- [ ] **Kiểm tra trạng thái 4 container**:
  ```powershell
  docker compose ps
  ```
  *Đảm bảo cả 4 service: `seal-frontend`, `seal-bff`, `seal-backend`, `seal-postgres` đều hiển thị `Up (healthy)`.*
- [ ] **Kiểm tra truy cập nhanh qua trình duyệt**:
  - Mở [http://localhost:3000](http://localhost:3000) (Trang chủ hiện đầy đủ linh vật 3D, không vỡ layout).
  - Mở [http://localhost:3000/vote](http://localhost:3000/vote) (Hiện 2 đội thi demo `Team Rocket`, `Byte Force`, không báo lỗi đỏ).
  - Mở [http://localhost:3000/rankings](http://localhost:3000/rankings) (Hiện giao diện Leaderboard Arena và tiêu chí RBL).
- [ ] **Xóa cache trình duyệt**: Nhấn tổ hợp phím **`Ctrl + F5`** trên mỗi trang để đảm bảo nạp toàn bộ CSS và ảnh mới nhất.
- [ ] **Mẹo chuẩn bị trình duyệt (Bí quyết chuyển vai trong 2 giây)**:
  > **TUYỆT ĐỐI KHÔNG ĐĂNG XUẤT RỒI ĐĂNG NHẬP LẠI NHIỀU LẦN TRÊN CÙNG 1 TAB!**  
  > Hãy mở sẵn **4 cửa sổ/Profile trình duyệt riêng biệt** trước giờ demo:
  > 1. **Cửa sổ 1 (Chế độ thường)**: Mở sẵn `/` (Trang chủ công khai & Cổng bình chọn `/vote`).
  > 2. **Cửa sổ 2 (Profile Chrome 1 hoặc Tab ẩn danh Incognito 1)**: Đăng nhập sẵn tài khoản Đội trưởng (`leader@demo.local`).
  > 3. **Cửa sổ 3 (Profile Chrome 2 hoặc Tab ẩn danh Incognito 2)**: Đăng nhập sẵn tài khoản Giám khảo (`judge1@demo.local`).
  > 4. **Cửa sổ 4 (Profile Chrome 3 hoặc Tab ẩn danh Incognito 3)**: Đăng nhập sẵn tài khoản Ban Tổ Chức (`coordinator@demo.local`).
  >
  > *Khi demo đến vai nào, chỉ cần `Alt + Tab` sang đúng cửa sổ đó. Thao tác cực kỳ mượt mà, chuyên nghiệp và tiết kiệm thời gian quý báu!*

---

## 🔑 2. Bảng Danh Bạ Tài Khoản Demo Có Sẵn

Tất cả tài khoản dưới đây đã được nạp sẵn mật khẩu chuẩn trong hệ cơ sở dữ liệu:

| Vai trò | Email đăng nhập | Mật khẩu | Mục đích sử dụng khi demo |
|---|---|---|---|
| **Ban Tổ Chức (Coordinator)** | `coordinator@demo.local` | `Demo@123456` | Quản lý vòng thi, duyệt thăng hạng, tính điểm, xuất bảng điểm CSV, soi Audit Log |
| **Giám Khảo 1 (Judge One)** | `judge1@demo.local` | `Demo@123456` | Thực hiện chấm điểm 4 tiêu chí trọng số & tham gia Vòng hiệu chuẩn (Calibration) |
| **Giám Khảo 2 (Judge Two)** | `judge2@demo.local` | `Demo@123456` | Giám khảo đối soát độc lập, chứng minh tính năng phương sai Variance |
| **Mentor Chuyên Môn** | `mentor1@demo.local` | `Demo@123456` | Xem bài nộp của đội thi và gửi nhận xét, phản hồi kỹ thuật |
| **Đội Trưởng (Team Leader)** | `leader@demo.local` | `Demo@123456` | Xem thông tin đội `Team Rocket`, nộp link GitHub repo, tài liệu docs và demo |
| **Khách vãng lai / Sinh viên** | *(Không cần đăng nhập)* | *(Trang public)* | Bình chọn khán giả yêu thích, xem bục vinh danh và tiêu chí đánh giá |

---

## 👥 3. Phân Công Nhiệm Vụ Trong Nhóm Khi Thuyết Trình

Để bài báo cáo đạt điểm cao nhất, nhóm cần phân chia 3 vai trò rõ ràng:

1. **Người thuyết trình chính (Presenter)**:
   - Đứng đối diện Thầy Cô / Hội đồng, trình bày rõ ràng, dõng dạc theo kịch bản.
   - Dùng từ khóa chuyên ngành ấn tượng: *Kiến trúc 3-Tier BFF, Inter-Rater Reliability (RBL), Audit Log bất biến, RBAC Scoped Authorization, Ma trận tiêu chí có trọng số*.
2. **Người điều khiển máy tính (Driver / Navigator)**:
   - Ngồi trước laptop nối máy chiếu.
   - Thao tác chuột dứt khoát, bấm đúng vị trí Người thuyết trình đang nói (không bấm trước, không lúng túng bấm nhầm).
   - Dùng phím tắt `Alt + Tab` chuyển nhanh giữa các cửa sổ trình duyệt đã mở sẵn.
3. **Người hỗ trợ kỹ thuật & canh thời gian (Tech Support & Timekeeper)**:
   - Theo dõi thời gian (thường mỗi nhóm có 10–15 phút). Báo hiệu cho Presenter khi còn 5 phút và 2 phút.
   - Sẵn sàng mở terminal gõ lệnh khắc phục nếu có sự cố mạng/cổng.

---

## 🎬 4. Kịch Bản Demo Từng Bước (12 Phút Đạt Điểm Tối Đa)

### Phase 1: Giới Thiệu Tổng Quan & Cổng Công Khai (2 Phút)
- **Màn hình**: `http://localhost:3000/` (Trang chủ)
- **Lời thoại của Presenter**:
  > *"Kính thưa Thầy Cô, SEAL Hackathon Management System là nền tảng quản trị và đánh giá giải thi lập trình chuyên nghiệp. Điểm nhấn đầu tiên là giao diện Cyber Editorial hiện đại với linh vật 3D robot hải cẩu tương tác mượt mà, phản chiếu tính công nghệ cao của sinh viên ngành Kỹ thuật Phần mềm."*
- **Hành động của Driver**:
  - Cuộn nhẹ trang chủ qua phần giải thưởng 20Tr+, các tính năng và đơn vị đồng hành.
  - Bấm vào menu **"Bình chọn"** (`/vote`).
  - Chọn bảng đấu **"Mobile Application"**, thấy 2 đội thi `Team Rocket` và `Byte Force`.
  - Bấm nút **"Bình chọn cho đội này"** trên thẻ `Team Rocket`. Thấy số phiếu tăng ngay lập tức và nút chuyển sang trạng thái đã bình chọn dạ quang xanh lá.
  - Bấm chuyển sang **"Bảng xếp hạng"** (`/rankings`), chỉ cho Thầy Cô thấy bục vinh danh và khung ma trận tiêu chí đánh giá.

---

### Phase 2: Đội Thi Nộp Bài Dự Thi (2 Phút)
- **Màn hình**: Chuyển sang Cửa sổ Đội trưởng (`leader@demo.local`)
- **Lời thoại của Presenter**:
  > *"Tiếp theo là trải nghiệm của thí sinh. Đội trưởng Team Rocket đăng nhập vào hệ thống để quản lý thành viên và nộp bài thi cho Vòng Chung Kết."*
- **Hành động của Driver**:
  - Vào mục **"Đội của tôi"** (`/app/team`).
  - Cho Thầy Cô thấy danh sách thành viên đội thi và trạng thái `ACTIVE`.
  - Vào phần **"Nộp bài thi"** (`/app/submissions`), hiển thị link Git repo `https://github.com/demo/team-rocket`, link slide và tài liệu demo.
  - Trình bày tính năng tự động ghi nhận thời gian nộp và gắn cờ trễ hạn (`isLate`) nếu quá hạn chót.

---

### Phase 3: Mentor Đồng Hành & Góp Ý Kỹ Thuật (1.5 Phút)
- **Màn hình**: Chuyển sang Cửa sổ Mentor (`mentor1@demo.local`)
- **Lời thoại của Presenter**:
  > *"Điểm độc đáo của hệ thống là phân hệ Mentor đồng hành. Mentor được phân công phụ trách bảng đấu AI / Mobile sẽ vào xem bài nộp của các đội và để lại góp ý chuyên môn trước giờ thuyết trình chính thức."*
- **Hành động của Driver**:
  - Vào màn hình **"Mentor"** (`/mentor`).
  - Chọn `Team Rocket`, xem bài nộp và nhập một nhận xét mẫu: *"Kiến trúc phần mềm rõ ràng, cần tối ưu thêm hiệu năng caching"* -> Bấm **Gửi góp ý**.

---

### Phase 4: Ban Giám Khảo Chấm Thi & Hiệu Chuẩn RBL (3.5 Phút - ĐIỂM SÁNG NHẤT!)
- **Màn hình**: Chuyển sang Cửa sổ Giám khảo (`judge1@demo.local`)
- **Lời thoại của Presenter**:
  > *"Đây là phân hệ cốt lõi tạo nên sự khác biệt học thuật của đề tài: Chấm điểm Rubric đa tiêu chí và Vòng hiệu chuẩn (Calibration Round) phục vụ phân tích độ tin cậy liên đánh giá viên (RBL)."*
- **Hành động của Driver**:
  - Vào mục **"Chấm điểm"** (`/judge`).
  - **Bước 4.1 - Vòng hiệu chuẩn**: Mở tab *Vòng hiệu chuẩn (Calibration)*. Giải thích cho Thầy Cô: Trước khi chấm thật, tất cả giám khảo sẽ chấm thử một bài mẫu (Sample Submission) để cân bằng thước đo đánh giá giữa các giám khảo khó tính và dễ tính.
  - **Bước 4.2 - Chấm điểm bài thi chính thức**: Chọn đội `Team Rocket` trong Vòng Chung Kết:
    - Kéo các thanh trượt điểm theo 4 tiêu chí: Kỹ thuật & Triển khai (Trọng số 30%), Trải nghiệm người dùng (20%), Tác động & Ý tưởng (25%), Thuyết trình & Demo (25%).
    - Nhập nhận xét chuyên môn.
    - Nhấn nút **"Khóa điểm (Finalize Score)"** -> Hệ thống xác nhận điểm số đã chốt và không thể sửa đổi trái phép.

---

### Phase 5: Ban Tổ Chức Tổng Hợp Điểm, Phân Tích & Kiểm Toán (3 Phút)
- **Màn hình**: Chuyển sang Cửa sổ Ban Tổ Chức (`coordinator@demo.local`)
- **Lời thoại của Presenter**:
  > *"Cuối cùng, Ban Tổ Chức là bên nắm giữ toàn quyền điều phối giải đấu, từ tự động tính toán điểm trung bình có trọng số, phân tích phương sai điểm số, phê duyệt thăng hạng Top N, xuất bảng điểm ra Excel/CSV đến tra cứu nhật ký kiểm toán bất biến."*
- **Hành động của Driver**:
  - Vào mục **"Điều phối"** (`/app/coordinator`).
  - Bấm nút **"Tính toán bảng xếp hạng (Calculate Rankings)"**: Hệ thống tự động áp dụng ma trận trọng số và xếp hạng đội thi.
  - Xem phân tích **RBL Variance**: Hiển thị bảng Mean, StdDev của từng tiêu chí để phát hiện giám khảo nào chấm quá lệch.
  - Nhấn nút **"Xuất Bảng Điểm (CSV)"**: Trình duyệt tải ngay file `Bang_Xep_Hang_Vong_Chung_Ket.csv`.
  - Mở mục **"Nhật ký kiểm toán (Audit Log)"** (`/app/audit`):
    - Chỉ cho Thầy Cô thấy từng dòng nhật ký được ghi nhận tự động: `SCORE_FINALIZE`, `RANKING_COMPUTE`, `VOTE_CAST` kèm thời gian, IP và User thực hiện.
    - Khẳng định: *"Dữ liệu này được ghi trực tiếp vào bảng audit_log và không có API nào cho phép sửa hay xóa, đảm bảo tính công bằng tuyệt đối cho giải đấu."*

---

## 🛠️ 5. Cẩm Nang Xử Lý Sự Cố Khẩn Cấp (Emergency Troubleshooting)

Nếu gặp sự cố bất ngờ trong lúc demo, hãy bình tĩnh áp dụng các giải pháp 10 giây dưới đây:

### Tình huống 1: Màn hình báo lỗi "Đã xảy ra lỗi, vui lòng thử lại sau"
* **Nguyên nhân**: Token đăng nhập hết hạn hoặc cookie bị lệch.
* **Cách sửa**: Bấm nút **Đăng xuất** ở góc phải trên cùng, sau đó đăng nhập lại bằng tài khoản demo (`Demo@123456`). Hoặc mở tab ẩn danh mới (`Ctrl + Shift + N`).

### Tình huống 2: Trình duyệt bị vỡ layout hoặc hiển thị ảnh cũ
* **Nguyên nhân**: Trình duyệt lưu cache cũ của file CSS hoặc PNG.
* **Cách sửa**: Nhấn tổ hợp phím **`Ctrl + F5`** (hoặc `Ctrl + Shift + R`).

### Tình huống 3: Một container Docker bất ngờ bị dừng
* **Cách kiểm tra & bật lại nhanh**:
  ```powershell
  # Kiểm tra container nào bị down
  docker compose ps
  # Khởi động lại container đó (ví dụ backend)
  docker compose up -d --no-deps backend
  ```

### Tình huống 4: Dữ liệu bị xáo trộn do thao tác nhầm lúc tập dượt
* **Cách khôi phục dữ liệu sạch ban đầu trong 15 giây**:
  ```powershell
  # Chạy lệnh restart lại database và nạp lại seed sạch
  docker compose down
  docker compose up -d
  ```

---

## 🏆 Lời Khuyên Vàng Giúp Cả Team Đạt Điểm A+
1. **Tự tin & Phối hợp nhịp nhàng**: Khi bạn này nói, bạn kia thao tác chuột ăn khớp 100%.
2. **Nhấn mạnh vào tính thực tiễn**: Nhấn mạnh hệ thống được thiết kế để phục vụ thực tế cho cuộc thi Hackathon của FPT Software và Khoa Kỹ thuật Phần mềm.
3. **Nêu bật các con số biết nói**: **101 tests tự động Frontend pass 100%**, 94 tests Backend, kiến trúc 3 tầng chuẩn bảo mật doanh nghiệp!
