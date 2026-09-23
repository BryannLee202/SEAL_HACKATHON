import base64
import subprocess
import os

html_path = r"C:\SEAL_HACKATHON\BAO_CAO_KHOA_LUAN_SEAL_HACKATHON.html"
pdf_path = r"C:\SEAL_HACKATHON\BAO_CAO_KHOA_LUAN_SEAL_HACKATHON.pdf"
img_path = r"C:\SEAL_HACKATHON\flyway_diagram.jpg"

with open(img_path, "rb") as f:
    img_base64 = base64.b64encode(f.read()).decode("utf-8")

html_content = f"""<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Báo Cáo Tổng Hợp Bảo Vệ Khóa Luận Tốt Nghiệp - SEAL Hackathon</title>
<style>
  @page {{
    size: A4;
    margin: 16mm 14mm 16mm 14mm;
    @bottom-right {{
      content: counter(page);
    }}
  }}
  * {{
    box-sizing: border-box;
  }}
  body {{
    font-family: 'Segoe UI', Arial, sans-serif;
    line-height: 1.55;
    color: #1e293b;
    background: #ffffff;
    font-size: 13px;
    margin: 0;
    padding: 0;
  }}
  
  /* Cover Page */
  .cover-page {{
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 98vh;
    border: 3px double #0284c7;
    padding: 40px 30px;
    text-align: center;
    background: linear-gradient(180deg, #f8fafc 0%, #f0f9ff 100%);
  }}
  .school-header {{
    font-size: 15px;
    font-weight: 700;
    text-transform: uppercase;
    color: #0369a1;
    letter-spacing: 1px;
    margin-bottom: 5px;
  }}
  .school-sub {{
    font-size: 13px;
    color: #64748b;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 15px;
    display: inline-block;
  }}
  .badge-thesis {{
    display: inline-block;
    background: #0284c7;
    color: #ffffff;
    font-weight: 700;
    font-size: 13px;
    padding: 6px 18px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-top: 30px;
  }}
  .project-title {{
    font-size: 26px;
    font-weight: 800;
    color: #0f172a;
    margin: 25px 0 10px 0;
    text-transform: uppercase;
    line-height: 1.3;
  }}
  .project-sub {{
    font-size: 15px;
    color: #0369a1;
    font-weight: 600;
    margin-bottom: 30px;
  }}
  .info-box {{
    margin: 40px auto;
    width: 80%;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 20px 30px;
    text-align: left;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }}
  .info-row {{
    display: flex;
    justify-content: space-between;
    padding: 6px 0;
    border-bottom: 1px dashed #e2e8f0;
  }}
  .info-row:last-child {{
    border-bottom: none;
  }}
  .info-label {{
    font-weight: 600;
    color: #475569;
  }}
  .info-val {{
    font-weight: 700;
    color: #0f172a;
  }}
  .cover-footer {{
    font-size: 12px;
    color: #64748b;
  }}
  
  /* Headings */
  h1 {{
    font-size: 18px;
    color: #0369a1;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 6px;
    margin-top: 25px;
    margin-bottom: 12px;
    text-transform: uppercase;
    page-break-after: avoid;
  }}
  h2 {{
    font-size: 14.5px;
    color: #0f172a;
    margin-top: 18px;
    margin-bottom: 8px;
    border-left: 4px solid #0284c7;
    padding-left: 8px;
    page-break-after: avoid;
  }}
  h3 {{
    font-size: 13.5px;
    color: #334155;
    margin-top: 12px;
    margin-bottom: 6px;
    page-break-after: avoid;
  }}
  
  /* Tables */
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 12px 0;
    font-size: 11.5px;
    page-break-inside: avoid;
  }}
  th, td {{
    border: 1px solid #cbd5e1;
    padding: 6px 8px;
    text-align: left;
    vertical-align: top;
  }}
  th {{
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
  }}
  tr:nth-child(even) {{
    background-color: #f8fafc;
  }}
  
  /* Code blocks */
  pre, code {{
    font-family: 'Consolas', 'Courier New', monospace;
  }}
  pre {{
    background-color: #0f172a;
    color: #e2e8f0;
    padding: 10px 12px;
    border-radius: 6px;
    font-size: 11px;
    overflow-x: auto;
    margin: 8px 0;
    page-break-inside: avoid;
  }}
  code {{
    background-color: #f1f5f9;
    color: #0369a1;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 11.5px;
  }}
  pre code {{
    background-color: transparent;
    color: inherit;
    padding: 0;
  }}
  
  /* Callouts & Badges */
  .callout {{
    padding: 10px 14px;
    margin: 10px 0;
    border-radius: 6px;
    font-size: 12px;
    page-break-inside: avoid;
  }}
  .callout-info {{
    background-color: #f0f9ff;
    border-left: 4px solid #0284c7;
    color: #0c4a6e;
  }}
  .callout-success {{
    background-color: #f0fdf4;
    border-left: 4px solid #16a34a;
    color: #14532d;
  }}
  .callout-warning {{
    background-color: #fffbeb;
    border-left: 4px solid #f59e0b;
    color: #78350f;
  }}
  .badge {{
    display: inline-block;
    padding: 2px 7px;
    border-radius: 10px;
    font-size: 10.5px;
    font-weight: 700;
  }}
  .badge-success {{ background: #dcfce7; color: #166534; }}
  .badge-primary {{ background: #e0f2fe; color: #0369a1; }}
  .badge-warning {{ background: #fef3c7; color: #92400e; }}
  
  .page-break {{
    page-break-after: always;
  }}
  .diagram-img {{
    width: 100%;
    max-width: 750px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    margin: 10px auto;
    display: block;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }}
</style>
</head>
<body>

<!-- BÌA BÁO CÁO -->
<div class="cover-page">
  <div>
    <div class="school-header">BỘ GIÁO DỤC VÀ ĐÀO TẠO — TRƯỜNG ĐẠI HỌC CÔNG NGHỆ</div>
    <div class="school-sub">KHOA CÔNG NGHỆ THÔNG TIN &amp; KỸ THUẬT PHẦN MỀM</div>
    <br>
    <div class="badge-thesis">BÁO CÁO TỔNG HỢP BẢO VỆ KHÓA LUẬN TỐT NGHIỆP</div>
    
    <div class="project-title">HỆ THỐNG QUẢN LÝ CUỘC THI HACKATHON &amp; NGHIÊN CỨU ĐỘ TIN CẬY ĐÁNH GIÁ VIÊN</div>
    <div class="project-sub">SEAL HACKATHON MANAGEMENT SYSTEM (SHMS)</div>
  </div>

  <div class="info-box">
    <div class="info-row"><span class="info-label">Đề tài:</span> <span class="info-val">Hệ thống Quản lý Hackathon &amp; Nghiên cứu RBL / IRR</span></div>
    <div class="info-row"><span class="info-label">Chuyên ngành:</span> <span class="info-val">Kỹ thuật Phần mềm (Software Engineering)</span></div>
    <div class="info-row"><span class="info-label">Sinh viên thực hiện:</span> <span class="info-val">Nhóm Đề Tài Tốt Nghiệp SEAL</span></div>
    <div class="info-row"><span class="info-label">Giảng viên hướng dẫn:</span> <span class="info-val">Hội Đồng Khoa Học Chấm Khóa Luận</span></div>
    <div class="info-row"><span class="info-label">Công nghệ cốt lõi:</span> <span class="info-val">React, NestJS (BFF), Spring Boot 3, PostgreSQL 16, Docker</span></div>
    <div class="info-row"><span class="info-label">Trạng thái mã nguồn:</span> <span class="info-val">100% Hoàn thành — Đồng bộ GitHub (Branch main)</span></div>
  </div>

  <div class="cover-footer">
    <strong>THÀNH PHỐ HỒ CHÍ MINH — NĂM 2026</strong>
  </div>
</div>

<!-- MỤC LỤC & BẢNG THUẬT NGỮ -->
<h1>📖 BẢNG TRA CỨU THUẬT NGỮ CHUYÊN MÔN (GLOSSARY)</h1>
<p><em>(Dùng để tự tin giải thích mở ngoặc khi Hội đồng phản biện hỏi về các từ viết tắt trong đồ án)</em></p>

<table>
  <thead>
    <tr>
      <th style="width: 15%;">Thuật ngữ</th>
      <th style="width: 30%;">Tên tiếng Anh đầy đủ</th>
      <th style="width: 55%;">Mở ngoặc chú thích ý nghĩa tiếng Việt</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>CSRF</strong></td>
      <td>Cross-Site Request Forgery</td>
      <td><em>(Tấn công giả mạo yêu cầu từ trang web khác)</em>: Kẻ tấn công lừa trình duyệt gửi request chứa cookie xác thực tới hệ thống khi người dùng đang đăng nhập.</td>
    </tr>
    <tr>
      <td><strong>XSS</strong></td>
      <td>Cross-Site Scripting</td>
      <td><em>(Tấn công tiêm mã kịch bản độc hại)</em>: Kẻ xấu chèn mã JavaScript độc hại vào trang web nhằm đánh cắp dữ liệu lưu ở trình duyệt như <code>localStorage</code>.</td>
    </tr>
    <tr>
      <td><strong>BFF</strong></td>
      <td>Backend-For-Frontend</td>
      <td><em>(Tầng máy chủ trung gian phục vụ riêng cho giao diện)</em>: Tầng trung chuyển viết bằng NestJS nằm giữa React và Spring Boot, quản lý phiên cookie, CSRF và định dạng API cho giao diện.</td>
    </tr>
    <tr>
      <td><strong>RBL</strong></td>
      <td>Rubric-Based Learning</td>
      <td><em>(Đánh giá năng lực dựa trên bảng tiêu chí chuẩn hóa Rubric)</em>: Phân rã bài thi thành nhiều tiêu chí rõ ràng kèm trọng số cụ thể để chấm điểm công bằng.</td>
    </tr>
    <tr>
      <td><strong>IRR</strong></td>
      <td>Inter-Rater Reliability</td>
      <td><em>(Độ tin cậy và tính nhất quán giữa các giám khảo)</em>: Chỉ số đo lường mức độ đồng thuận giữa các giám khảo, giúp phát hiện giám khảo chấm quá chặt hoặc quá lỏng.</td>
    </tr>
    <tr>
      <td><strong>Flyway</strong></td>
      <td>Database Migration Tool</td>
      <td><em>(Cơ chế quản lý phiên bản cơ sở dữ liệu tự động)</em>: Công cụ tự động chạy các script SQL theo thứ tự phiên bản (<code>V001</code> &rarr; <code>V009</code>), bảo vệ toàn vẹn qua Checksum.</td>
    </tr>
    <tr>
      <td><strong>JWT</strong></td>
      <td>JSON Web Token</td>
      <td><em>(Chuỗi mã hóa xác thực phiên làm việc)</em>: Chuỗi ký số an toàn lưu trong Cookie <code>httpOnly</code> để chống lộ token.</td>
    </tr>
    <tr>
      <td><strong>UUID</strong></td>
      <td>Universally Unique Identifier</td>
      <td><em>(Chuỗi định danh duy nhất toàn cầu 128-bit)</em>: Chuỗi 36 ký tự (ví dụ: <code>baaae0ae-...</code>) thay thế cho ID tự tăng để chống quét dữ liệu tuần tự.</td>
    </tr>
    <tr>
      <td><strong>API</strong></td>
      <td>Application Programming Interface</td>
      <td><em>(Giao diện lập trình ứng dụng / Cổng trao đổi dữ liệu)</em>: Cầu nối truyền nhận dữ liệu JSON giữa Frontend và Backend thông qua HTTP methods.</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- CHỦ ĐỀ 1: GIỚI THIỆU TỔNG QUAN ĐỀ TÀI -->
<h1>PHẦN 1: GIỚI THIỆU TỔNG QUAN ĐỀ TÀI &amp; TIẾN ĐỘ THỰC HIỆN</h1>

<h2>1. Đề tài làm về vấn đề gì?</h2>
<p>
  Đề tài xây dựng <strong>Hệ thống Quản lý Cuộc thi Hackathon và Nghiên cứu Độ tin cậy Đánh giá viên (SEAL Hackathon Management System - SHMS)</strong>. Hệ thống giải quyết hai bài toán lớn trong thực tế:
</p>
<ul>
  <li><strong>Về mặt kỹ thuật phần mềm:</strong> Chuyển đổi số toàn diện công tác tổ chức Hackathon đa vòng đấu (tạo cuộc thi, chia bảng đấu, lập đội thi, nộp bài dự thi có đối soát hạn nộp, bình chọn cộng đồng trực tiếp và bảng xếp hạng Realtime).</li>
  <li><strong>Về mặt nghiên cứu khoa học:</strong> Ứng dụng phương pháp <strong>Rubric-Based Learning (RBL)</strong> và đo lường <strong>Inter-Rater Reliability (IRR)</strong> thông qua Vòng hiệu chuẩn (Calibration Round) nhằm chuẩn hóa thước đo, loại bỏ sự thiên vị hoặc độ lệch chủ quan giữa các giám khảo.</li>
</ul>

<h2>2. Đã làm được bao nhiêu %?</h2>
<div class="callout callout-success">
  <strong>Kết quả nghiệm thu: Đạt 100% yêu cầu kỹ thuật đồ án tốt nghiệp.</strong><br>
  Toàn bộ 4 phân hệ (Frontend React, BFF NestJS, Core Backend Spring Boot 3, Database PostgreSQL 16) đều đã đóng gói container Docker hoàn chỉnh, tự động khởi chạy và đã tích hợp kiểm thử tự động toàn diện.
</div>

<h2>3. Những gì đã làm được và những gì chưa làm được?</h2>
<table>
  <thead>
    <tr>
      <th style="width: 50%;">Hạng mục ĐÃ LÀM ĐƯỢC (100% Hoàn Thành)</th>
      <th style="width: 50%;">Hạng mục Định Hướng Phát Triển Tương Lai</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        &bull; Xác thực bảo mật đa tầng: Cookie <code>httpOnly</code> + Chống CSRF Double-Submit.<br>
        &bull; Quản trị sự kiện đa vòng: Khởi tạo, chia Tracks, tạo Rounds, gán Giám khảo.<br>
        &bull; Vòng đời đội thi hoàn chỉnh: <code>FORMING</code> &rarr; Mời thành viên &rarr; <code>REGISTERED</code>.<br>
        &bull; Quản lý bài nộp đa dạng (Git, Demo, Slide) + cờ trễ hạn tự động <code>is_late</code>.<br>
        &bull; Vòng chấm điểm Hiệu chuẩn (Calibration Round) lưu bảng riêng <code>calibration_score</code>.<br>
        &bull; Chấm điểm chính thức theo 4 tiêu chí Rubric có trọng số động.<br>
        &bull; Tự động kích hoạt thuật toán tính xếp hạng thời gian thực (Realtime Ranking).<br>
        &bull; Lịch sử kiểm toán bất biến (Audit Log Trail) lưu vết mọi thao tác quan trọng.<br>
        &bull; Quản lý Database qua Flyway Migration tự động từ <code>V001</code> đến <code>V009</code>.<br>
        &bull; Giao diện chuẩn Cyber Editorial, Dark/Light Mode, Trợ lý ảo AI SEAL Bot.
      </td>
      <td>
        &bull; Tích hợp Video Call trực tuyến WebRTC giữa Giám khảo và Thí sinh trong phòng phỏng vấn trực tiếp.<br>
        &bull; Mở rộng ứng dụng di động Native (Flutter / React Native) để quét mã QR điểm danh tại hội trường trực tiếp.<br>
        &bull; Kết nối cổng thanh toán ngân hàng (VNPay/MoMo) trong trường hợp cuộc thi có thu lệ phí bảo chứng.
      </td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- CHỦ ĐỀ 2: CƠ SỞ DỮ LIỆU & CÁCH SHOW CHO THẦY XEM -->
<h1>PHẦN 2: CƠ SỞ DỮ LIỆU &amp; HƯỚNG DẪN SHOW CHO THẦY CÔ XEM</h1>

<h2>1. Database của mình là gì? Nơi lưu trữ vật lý ở đâu?</h2>
<ul>
  <li><strong>Hệ quản trị CSDL:</strong> PostgreSQL phiên bản <strong>16.14</strong> (nền tảng tối ưu Alpine Linux 64-bit).</li>
  <li><strong>Container vận hành:</strong> Chạy độc lập trong Docker Container có tên là <code>seal-postgres</code>.</li>
  <li><strong>Lưu trữ vật lý bền vững (Persistent Storage):</strong> Sử dụng Docker Volume có tên là <code>seal_hackathon_postgres_data</code>. Đường dẫn lưu trữ bên trong container: <code>/var/lib/postgresql/data</code>. Đảm bảo dữ liệu <strong>không bao giờ bị mất</strong> khi tắt máy hoặc restart Docker.</li>
  <li><strong>Cổng kết nối (Port):</strong>
    <ul>
      <li>Cổng nội bộ container: <code>5432</code>.</li>
      <li>Cổng ánh xạ ra ngoài máy chủ vật lý: <strong><code>5433</code></strong> (cho phép kết nối ngoài qua pgAdmin 4).</li>
    </ul>
  </li>
  <li><strong>Dung lượng cơ sở dữ liệu:</strong> <code>8.8 MB</code> (đã nạp đầy đủ cấu trúc bảng, seed data và audit log).</li>
  <li><strong>Tài khoản &amp; Mật khẩu:</strong> Username: <code>seal_admin</code> | Password: <code>seal_password</code> (dùng cho Spring Boot JDBC Connection Pool và đăng nhập pgAdmin 4).</li>
</ul>

<h2>2. 📊 Bảng Tổng Hợp 3 Cấp Độ Đường Dẫn Chi Tiết Để Trả Lời Thầy Cô</h2>
<table>
  <thead>
    <tr>
      <th style="width: 22%;">Cấp độ môi trường</th>
      <th style="width: 25%;">Vị trí lưu trữ thực tế</th>
      <th style="width: 53%;">Đường dẫn đầy đủ (Full Path)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Trong Container</strong></td>
      <td>Linux Container (seal-postgres)</td>
      <td><code>/var/lib/postgresql/data</code></td>
    </tr>
    <tr>
      <td><strong>2. Windows Explorer</strong></td>
      <td>WSL2 Network Share (Mở trực tiếp)</td>
      <td><code>\\\\wsl.localhost\\docker-desktop\\tmp\\docker-desktop-root\\var\\lib\\docker\\volumes\\seal_hackathon_postgres_data\\_data</code></td>
    </tr>
    <tr>
      <td><strong>3. Ổ đĩa cứng vật lý</strong></td>
      <td>Ổ cứng Windows C: (Tệp đĩa ảo VHDX)</td>
      <td><code>C:\\Users\\tai\\AppData\\Local\\Docker\\wsl\\disk\\docker_data.vhdx</code> (Dung lượng: ~37.5 GB)</td>
    </tr>
  </tbody>
</table>

<div class="callout callout-info">
  <strong>💡 Hướng dẫn mở trực tiếp thư mục CSDL trên máy tính Windows cho Thầy xem:</strong><br>
  1. Nhấn tổ hợp phím <strong><code>Windows + E</code></strong> (mở File Explorer).<br>
  2. Dán đường dẫn sau vào thanh địa chỉ: <code>\\\\wsl.localhost\\docker-desktop\\tmp\\docker-desktop-root\\var\\lib\\docker\\volumes\\seal_hackathon_postgres_data\\_data</code> và nhấn <strong>Enter</strong>.<br>
  3. Thầy Cô sẽ thấy trực tiếp toàn bộ các tệp cấu trúc nhị phân của PostgreSQL (<code>base/</code>, <code>global/</code>, <code>pg_wal/</code>, <code>postgresql.conf</code>, <code>PG_VERSION</code>...).
</div>

<h2>3. Hướng Dẫn Từng Bước Cách Show Database Cho Thầy Cô Xem</h2>

<div class="callout callout-success">
  <strong>Cách 1: Show trực quan bằng giao diện đồ họa pgAdmin 4 (Khuyên dùng khi báo cáo)</strong>
  <ol>
    <li>Mở phần mềm <strong>pgAdmin 4</strong> trên máy tính.</li>
    <li>Tại cây thư mục bên trái, mở: <strong>Servers &rarr; seal_hackathon_local &rarr; Databases &rarr; seal_hackathon</strong>.</li>
    <li>Mở mục <strong>Schemas &rarr; public &rarr; Tables</strong>: Chỉ cho Thầy thấy <strong>21 bảng dữ liệu</strong> đã được chuẩn hóa.</li>
    <li>Nhấp chuột phải vào database <code>seal_hackathon</code>, chọn <strong>Query Tool</strong> (hoặc bấm <code>Alt + Shift + Q</code>).</li>
    <li>Gõ câu lệnh kiểm tra bảng xếp hạng hoặc bài thi và nhấn nút <strong>Execute (Play ▶ hoặc F5)</strong>:
      <pre><code>SELECT t.name AS ten_doi, tr.name AS hang_muc, rk.total_weighted_score AS diem, rk.rank_overall AS hang
FROM ranking rk 
JOIN team t ON rk.team_id = t.id 
LEFT JOIN track tr ON t.track_id = tr.id 
ORDER BY rk.rank_overall ASC;</code></pre>
    </li>
  </ol>
</div>

<div class="callout callout-info">
  <strong>Cách 2: Show bằng dòng lệnh Terminal (Thể hiện kỹ năng DevOps chuyên nghiệp)</strong><br>
  Nếu Thầy Cô muốn xem trực tiếp qua terminal lệnh của Docker, mở Terminal và gõ:
  <pre><code>docker exec -it seal-postgres psql -U seal_admin -d seal_hackathon -c "\dt"</code></pre>
  Lệnh trên sẽ in ra toàn bộ danh sách 21 bảng vật lý đang hoạt động trực tiếp trong database!
</div>

<div class="page-break"></div>

<!-- CHỦ ĐỀ 3: QUY TRÌNH TẠO & CẤU HÌNH CUỘC THI (EVENT WORKFLOW) -->
<h1>PHẦN 3: QUY TRÌNH KHỞI TẠO &amp; CẤU HÌNH CUỘC THI HACKATHON</h1>

<h2>1. Ai có quyền tạo sự kiện trong hệ thống?</h2>
<p>
  Chỉ có tài khoản mang vai trò <strong>Ban Tổ Chức (Coordinator)</strong> mới được cấp quyền tạo và điều phối các mùa giải Hackathon (bảo vệ bởi Spring Security: <code>@PreAuthorize("hasRole('COORDINATOR')")</code>).
</p>
<div class="callout callout-info">
  &bull; <strong>Tài khoản điều phối mẫu:</strong> <code>coordinator@demo.local</code> &nbsp;&nbsp;|&nbsp;&nbsp; <strong>Mật khẩu:</strong> <code>Demo@123456</code>
</div>

<h2>2. Hướng Dẫn Từng Bước Tạo Sự Kiện Trên Giao Diện Web</h2>
<ol>
  <li><strong>Đăng nhập Ban Tổ Chức:</strong> Truy cập <code>http://localhost:3000/login</code>, đăng nhập tài khoản <code>coordinator@demo.local</code>.</li>
  <li><strong>Mở trang Sự kiện:</strong> Nhấp vào mục <strong>"Sự kiện"</strong> trên thanh điều hướng hoặc truy cập <code>http://localhost:3000/coordinator/events</code>.</li>
  <li><strong>Bấm nút "+ Tạo sự kiện":</strong> Nhấp vào nút màu xanh ở góc phải trên. Cửa sổ Modal hiển thị gồm các trường:
    <ul>
      <li><strong>Tên sự kiện:</strong> Nhập tên giải đấu (Ví dụ: <em>SEAL Hackathon AI Challenge 2026</em>).</li>
      <li><strong>Mô tả:</strong> Nhập thông điệp, quy chế và mục tiêu cuộc thi.</li>
      <li><strong>Ngày bắt đầu &amp; Ngày kết thúc:</strong> Chọn mốc thời gian diễn ra giải đấu (Ví dụ: <code>01/10/2026</code> &rarr; <code>30/10/2026</code>).</li>
    </ul>
  </li>
  <li><strong>Lưu sự kiện:</strong> Nhấn nút <strong>"Lưu"</strong>. Sự kiện mới xuất hiện tức thì trong danh sách với trạng thái ban đầu là <strong><code>Bản nháp (DRAFT)</code></strong>.</li>
</ol>

<h2>3. Cấu Hình 3 Phân Hệ Nghiệp Vụ Của Sự Kiện (Event Detail Tabs)</h2>
<p>Nhấp vào thẻ sự kiện vừa tạo để chuyển sang trang chi tiết (<code>/coordinator/events/:eventId</code>):</p>
<ul>
  <li><strong>Tab 1: Hạng mục (Tracks):</strong> Bấm <em>"+ Thêm hạng mục"</em> để chia bảng đấu cho thí sinh (Ví dụ: Bảng <em>Trí tuệ nhân tạo (AI)</em>, Bảng <em>Ứng dụng di động (Mobile)</em>, Bảng <em>Nền tảng Web</em>).</li>
  <li><strong>Tab 2: Vòng thi (Rounds):</strong> Bấm <em>"+ Thêm vòng thi"</em> để tạo lộ trình:
    <ul>
      <li><strong>Vòng 1 (Vòng Sơ Loại):</strong> Đặt hạn chót nộp bài, chọn bộ tiêu chí đánh giá Rubric (Kỹ thuật 40%, Sáng tạo 30%, UX 30%).</li>
      <li><strong>Vòng 2 (Vòng Chung Kết):</strong> Đặt thời gian thuyết trình và chấm điểm trực tiếp.</li>
    </ul>
  </li>
  <li><strong>Tab 3: Giám khảo &amp; Mentor:</strong> Phân công danh sách giám khảo vào từng vòng thi để họ có thẩm quyền chấm bài.</li>
  <li><strong>Công bố sự kiện (Publish):</strong> Tại trang danh sách sự kiện, nhấn nút <strong>"Chuyển sang Đã công bố (Published)"</strong> hoặc <strong>"Đang diễn ra (Ongoing)"</strong>. Cổng đăng ký sẽ chính thức mở cho toàn thể sinh viên vào tạo đội!</li>
</ul>

<h2>4. Cách Tạo Sự Kiện Qua API Swagger UI &amp; Đối Chiếu PostgreSQL</h2>
<ul>
  <li><strong>Mở Swagger UI:</strong> Truy cập <code>http://localhost:8080/swagger-ui.html</code> &rarr; Mục <code>event-controller</code> &rarr; Chọn <code>POST /api/events</code>.</li>
  <li><strong>Dữ liệu truyền lên (Payload JSON):</strong>
    <pre><code>{{
  "name": "SEAL Hackathon AI Innovation 2026",
  "description": "Đấu trường công nghệ trí tuệ nhân tạo dành cho sinh viên",
  "startDate": "2026-10-01",
  "endDate": "2026-10-30",
  "rblEnabled": true
}}</code></pre>
  </li>
  <li><strong>Truy vấn kiểm tra trong PostgreSQL (pgAdmin 4):</strong>
    <pre><code>SELECT id, name, description, start_date, end_date, status, rbl_enabled, created_at 
FROM hackathon_event ORDER BY created_at DESC;</code></pre>
  </li>
</ul>

<div class="page-break"></div>

<!-- CHỦ ĐỀ 4: CÔNG CỤ QUẢN LÝ DATABASE - FLYWAY MIGRATION -->
<h1>PHẦN 4: CÔNG CỤ QUẢN LÝ DATABASE — FLYWAY MIGRATION</h1>

<h2>1. Flyway Migration là gì &amp; có chức năng gì?</h2>
<ul>
  <li><strong>Bản chất:</strong> Flyway là công cụ <strong>Database Version Control</strong> (quản lý phiên bản mã nguồn cho cơ sở dữ liệu), đóng vai trò tương tự như Git đối với mã nguồn Java/TypeScript.</li>
  <li><strong>3 Chức năng cốt lõi:</strong>
    <ol>
      <li><strong>Tự động hóa:</strong> Khi Spring Boot khởi động, Flyway tự động rà soát và thực thi tuần tự các file script SQL mà không cần can thiệp thủ công.</li>
      <li><strong>Đồng bộ môi trường:</strong> Đảm bảo toàn bộ 6 thành viên trong nhóm và máy chủ production đều sở hữu cùng một cấu trúc database duy nhất.</li>
      <li><strong>Kiểm toán tính toàn vẹn (Checksum):</strong> Ngăn chặn việc sửa lén script cũ thông qua cơ chế so sánh mã băm.</li>
    </ol>
  </li>
</ul>

<h2>2. Sơ đồ luồng vận hành Flyway Migration</h2>
<img class="diagram-img" src="data:image/jpeg;base64,{img_base64}" alt="Flyway Migration Diagram">

<h2>3. Cách Show Code Flyway Cho Thầy Cô Xem</h2>
<ul>
  <li><strong>Mở thư mục Migration:</strong> Đường dẫn <code>backend/src/main/resources/db/migration/</code> (gồm 9 file từ <code>V001</code> &rarr; <code>V009</code>).</li>
  <li><strong>Quy ước đặt tên bắt buộc:</strong> <code>V&lt;Phiên_bản&gt;__&lt;Mô_tả&gt;.sql</code> (bắt buộc phải có <strong>2 dấu gạch dưới <code>__</code></strong>).</li>
  <li><strong>Cấu hình Spring Boot:</strong> File <code>backend/src/main/resources/application.yml</code>:
    <pre><code>spring:
  jpa:
    hibernate:
      ddl-auto: validate   # Hibernate chỉ đối chiếu Entity, cấm tự ý sửa bảng
  flyway:
    enabled: true          # Bật Flyway tự động chạy
    locations: classpath:db/migration</code></pre>
  </li>
  <li><strong>Đối chiếu trên pgAdmin 4:</strong> Chạy câu lệnh truy vấn bảng <code>flyway_schema_history</code>:
    <pre><code>SELECT installed_rank, version, description, script, checksum, 
       installed_on AT TIME ZONE 'Asia/Ho_Chi_Minh' AS thoi_gian_chay, success 
FROM flyway_schema_history ORDER BY installed_rank ASC;</code></pre>
  </li>
</ul>

<h2>4. Bộ Câu Hỏi Bẫy Của Thầy Cô Về Flyway &amp; Câu Trả Lời A+</h2>
<div class="callout callout-warning">
  <strong>Hỏi: Tại sao không dùng <code>spring.jpa.hibernate.ddl-auto=update</code> cho nhanh mà phải dùng Flyway?</strong><br>
  <em>Đáp:</em> Dùng <code>ddl-auto=update</code> của Hibernate rất nguy hiểm trên Production vì Hibernate không thể xóa cột cũ an toàn, dễ gây mất mát dữ liệu và không lưu lại lịch sử ai đã sửa bảng nào. Do đó nhóm dùng <code>ddl-auto=validate</code> (Hibernate chỉ kiểm tra tính hợp lệ) và giao toàn quyền tiến hóa schema cho Flyway.
</div>
<div class="callout callout-warning">
  <strong>Hỏi: Nếu em lén sửa nội dung file <code>V002__seed_data.sql</code> đã chạy rồi thì chuyện gì sẽ xảy ra?</strong><br>
  <em>Đáp:</em> Khi sửa nội dung, mã băm (checksum) của file sẽ bị đổi. Ở lần khởi động tiếp theo, Flyway tính lại checksum và so với giá trị trong bảng <code>flyway_schema_history</code>, thấy không khớp sẽ lập tức ném lỗi <code>FlywayValidateException</code> và <strong>từ chối khởi động hệ thống</strong> để bảo vệ dữ liệu.
</div>

<div class="page-break"></div>

<!-- CHỦ ĐỀ 5: GIAO TIẾP DỮ LIỆU & KIẾN TRÚC API -->
<h1>PHẦN 5: GIAO TIẾP DỮ LIỆU &amp; KIẾN TRÚC API</h1>

<h2>1. API là gì? Lấy API ở đâu?</h2>
<ul>
  <li><strong>API (Application Programming Interface):</strong> Là cổng giao tiếp dữ liệu có cấu trúc giữa Frontend và Backend. Thay vì trả về giao diện HTML, Backend cung cấp các API trả về dữ liệu chuẩn JSON qua các phương thức HTTP: <code>GET</code> (truy vấn), <code>POST</code> (tạo mới), <code>PUT/PATCH</code> (cập nhật), <code>DELETE</code> (xóa).</li>
  <li><strong>Lấy API ở đâu trong dự án SEAL Hackathon?</strong>
    <ol>
      <li><strong>Tài liệu trực quan Swagger UI:</strong> Mở trình duyệt tại địa chỉ <code>http://localhost:8080/swagger-ui.html</code> khi backend đang chạy. Thầy cô có thể test trực tiếp từng API trên trình duyệt.</li>
      <li><strong>Đặc tả OpenAPI JSON:</strong> Đường dẫn <code>http://localhost:8080/v3/api-docs</code>.</li>
      <li><strong>Mã nguồn Backend Controller:</strong> Thư mục <code>backend/src/main/java/com/seal/hackathon/controller/</code> (gồm 15 Controllers: <code>AuthController</code>, <code>TeamController</code>, <code>SubmissionController</code>, <code>ScoreController</code>, <code>RankingController</code>...).</li>
      <li><strong>Mã nguồn Frontend API Client:</strong> Thư mục <code>frontend/src/api/</code> (các module TypeScript: <code>events.ts</code>, <code>teams.ts</code>, <code>submissions.ts</code>, <code>scores.ts</code>, <code>rankings.ts</code>...).</li>
    </ol>
  </li>
</ul>

<h2>2. Kiến Trúc 3 Tầng Bảo Mật BFF (Backend-For-Frontend)</h2>
<table>
  <thead>
    <tr>
      <th style="width: 25%;">Tầng Kiến Trúc</th>
      <th style="width: 25%;">Công Nghệ Sử Dụng</th>
      <th style="width: 50%;">Trách Nhiệm &amp; Vai Trò Cốt Lõi</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Client Frontend</strong></td>
      <td>React 18, TypeScript, TailwindCSS, Vite (Cổng 3000)</td>
      <td>Giao diện người dùng tương tác, render bảng điểm dạ quang, xử lý form nộp bài, đọc cookie CSRF gắn vào request header.</td>
    </tr>
    <tr>
      <td><strong>2. Gateway BFF</strong></td>
      <td>NestJS, Fastify/Express (Cổng 4000)</td>
      <td>Cổng kiểm soát an ninh: Quản lý Cookie <code>httpOnly</code> cho JWT, phát hành và kiểm tra token CSRF hai lớp, chống tấn công trực diện vào Core Backend.</td>
    </tr>
    <tr>
      <td><strong>3. Core Backend</strong></td>
      <td>Spring Boot 3, Java 17, Spring Security (Cổng 8080)</td>
      <td>Xử lý toàn bộ nghiệp vụ lõi (Business Logic): Thuật toán tính điểm Rubric, phân tích phương sai RBL, tính xếp hạng Realtime và ghi nhật ký Audit Log.</td>
    </tr>
    <tr>
      <td><strong>4. Database Layer</strong></td>
      <td>PostgreSQL 16, Flyway Migration (Cổng 5433)</td>
      <td>Lưu trữ dữ liệu quan hệ bền vững, quản lý phiên bản schema tự động.</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- CHỦ ĐỀ 6: BẢO MẬT HỆ THỐNG - CSRF & XSS -->
<h1>PHẦN 6: BẢO MẬT HỆ THỐNG — PHÒNG THỦ CSRF &amp; XSS</h1>

<h2>1. CSRF là gì? (Có mở ngoặc chú thích rõ ràng)</h2>
<p>
  <strong>CSRF</strong> viết tắt của <strong>Cross-Site Request Forgery</strong> <em>(Tấn công giả mạo yêu cầu từ trang web khác)</em>. Đây là hình thức tấn công mà kẻ xấu lợi dụng đặc tính tự động gửi kèm cookie phiên của trình duyệt để thực hiện các thao tác phá hoại mà nạn nhân không hề hay biết.
</p>

<h2>2. Tại sao SEAL Hackathon lại có nguy cơ bị CSRF?</h2>
<ul>
  <li>Để triệt tiêu hoàn toàn nguy cơ <strong>XSS</strong> <em>(Cross-Site Scripting — Tấn công tiêm mã độc vào trình duyệt)</em>, nhóm quyết định <strong>không lưu Access Token trong <code>localStorage</code></strong>.</li>
  <li>Toàn bộ token được bảo vệ trong Cookie <code>httpOnly</code> (JavaScript bị cấm truy cập). Tuy nhiên, dùng Cookie thì trình duyệt lại tự động gửi kèm mỗi request, dẫn đến nguy cơ bị tấn công <strong>CSRF</strong>.</li>
</ul>

<h2>3. Cơ Chế Phòng Thủ Double-Submit CSRF Cookie Tại Tầng BFF</h2>
<ol>
  <li><strong>Cấp phát Token:</strong> Khi người dùng đăng nhập, BFF tạo một chuỗi ngẫu nhiên bí mật và trả về qua cookie có tên là <code>XSRF-TOKEN</code> (cho phép JavaScript đọc).</li>
  <li><strong>Gửi kèm Header:</strong> Khi Frontend (React) thực hiện các lệnh làm thay đổi dữ liệu (<code>POST</code>, <code>PUT</code>, <code>DELETE</code>), mã nguồn tại <code>frontend/src/api/http.ts</code> sẽ đọc cookie <code>XSRF-TOKEN</code> và tự động gắn vào Header: <code>X-XSRF-TOKEN</code>.</li>
  <li><strong>Kiểm soát tại Guard:</strong> Bộ lọc <code>CsrfGuard.ts</code> tại BFF đối soát:
    <div style="text-align: center; font-weight: bold; margin: 8px 0; color: #0369a1;">
      Cookie [XSRF-TOKEN] &nbsp;===&nbsp; Header [X-XSRF-TOKEN] ?
    </div>
    Nếu trùng khớp &rarr; Cho phép chuyển tiếp xuống Spring Boot. Nếu thiếu hoặc sai lệch &rarr; Lập tức chặn với mã lỗi <strong>HTTP 403 Forbidden</strong>.
  </li>
  <li><strong>Nguyên lý bảo vệ tuyệt đối:</strong> Dựa trên chính sách <strong>SOP (Same-Origin Policy)</strong> của trình duyệt, trang web độc hại từ bên ngoài <strong>không thể nào đọc được cookie của SEAL Hackathon</strong>, vì vậy kẻ tấn công không thể giả mạo được Header <code>X-XSRF-TOKEN</code>. Cuộc tấn công bị ngăn chặn 100%!</li>
</ol>

<div class="page-break"></div>

<!-- CHỦ ĐỀ 7: KỊCH BẢN DEMO THỰC TẾ & ĐỐI CHIẾU PGADMIN 4 -->
<h1>PHẦN 7: KỊCH BẢN DEMO THỰC TẾ &amp; ĐỐI CHIẾU PGADMIN 4</h1>

<h2>1. Checklist 9 Bước Demo Toàn Diện Hệ Thống</h2>
<table>
  <thead>
    <tr>
      <th style="width: 8%;">Bước</th>
      <th style="width: 25%;">Thao tác trên Giao diện Web</th>
      <th style="width: 22%;">Tài khoản sử dụng</th>
      <th style="width: 20%;">Kỳ vọng Giao diện</th>
      <th style="width: 25%;">Kỳ vọng trong PostgreSQL</th>
    </tr>
  </thead>
  <tbody>
    <tr><td><strong>1</strong></td><td>Đăng ký tài khoản thí sinh &amp; Ban tổ chức duyệt</td><td><code>svfpt@gmail.com</code> &rarr; <code>coordinator@demo.local</code></td><td>Thông báo đã duyệt thành công</td><td><code>account_status = 'APPROVED'</code></td></tr>
    <tr><td><strong>2</strong></td><td>Tạo đội thi mới</td><td><code>svfpt@gmail.com</code></td><td>Đội <code>AI CHAMPIONS</code> xuất hiện</td><td>Bảng <code>team</code> có <code>status = 'FORMING'</code></td></tr>
    <tr><td><strong>3</strong></td><td>Mời thành viên vào đội</td><td>Đội trưởng (<code>mtai@gmail.com</code>)</td><td>Gửi lời mời thành công</td><td>Bảng <code>team_invite</code> có <code>PENDING</code></td></tr>
    <tr><td><strong>4</strong></td><td>Thành viên chấp nhận lời mời</td><td><code>minhtai@gmail.com</code></td><td>Thấy tên trong danh sách đội</td><td>Bảng <code>team_member</code> thêm bản ghi</td></tr>
    <tr><td><strong>5</strong></td><td>Đăng ký Hạng mục thi đấu</td><td>Đội trưởng (&ge; 3 thành viên)</td><td>Chọn Mobile Application</td><td><code>team.status = 'REGISTERED'</code></td></tr>
    <tr><td><strong>6</strong></td><td>Nộp bài dự thi</td><td>Đội trưởng</td><td>Điền link GitHub, Demo, Slide</td><td>Bảng <code>submission</code> có <code>is_late = true</code></td></tr>
    <tr><td><strong>7</strong></td><td>Chấm điểm Hiệu chuẩn (RBL)</td><td>Giám khảo <code>judge1@demo.local</code></td><td>Kéo slider chấm bài mẫu</td><td>Lưu vào bảng <code>calibration_score</code></td></tr>
    <tr><td><strong>8</strong></td><td>Chấm điểm thi chính thức</td><td>Giám khảo <code>judge1@demo.local</code></td><td>Chấm 4 tiêu chí, bấm Chốt điểm</td><td>Lưu vào bảng <code>score</code> (<code>finalized = t</code>)</td></tr>
    <tr><td><strong>9</strong></td><td>Kiểm tra Xếp hạng Realtime</td><td>Khách vãng lai / Toàn trường</td><td>Mở trang <code>/rankings</code></td><td>Bảng <code>ranking</code> tự động nhảy số Top 1</td></tr>
  </tbody>
</table>

<h2>2. Tập Lệnh SQL Đối Chiếu Trực Tiếp Trên pgAdmin 4</h2>
<pre><code>-- 1. Xem bài nộp và thời gian nộp bài quy đổi giờ Việt Nam
SELECT t.name AS ten_doi, s.repo_url, s.demo_url, 
       s.submitted_at AT TIME ZONE 'Asia/Ho_Chi_Minh' AS gio_nop_viet_nam, s.is_late AS nop_muon
FROM submission s JOIN team t ON s.team_id = t.id ORDER BY s.submitted_at DESC;

-- 2. Xem điểm hiệu chuẩn của các giám khảo (RBL Calibration)
SELECT cr.name AS phien_hieu_chuan, u.full_name AS giam_khao, c.name AS tieu_chi, cs.score_value AS diem
FROM calibration_score cs
JOIN calibration_round cr ON cs.calibration_round_id = cr.id
JOIN app_user u ON cs.judge_id = u.id
JOIN criterion c ON cs.criterion_id = c.id;

-- 3. Xem bảng xếp hạng chính thức sau khi giám khảo chấm điểm
SELECT rk.rank_overall AS hang, t.name AS ten_doi, tr.name AS hang_muc, 
       rk.total_weighted_score AS diem_tong_hop, rk.promoted AS vao_chung_ket
FROM ranking rk
JOIN team t ON rk.team_id = t.id
LEFT JOIN track tr ON t.track_id = tr.id ORDER BY rk.rank_overall ASC;

-- 4. Soi vết kiểm toán bất biến (Audit Log)
SELECT id, action, entity_type, timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh' AS thoi_gian 
FROM audit_log ORDER BY timestamp DESC LIMIT 10;</code></pre>

<div class="page-break"></div>

<!-- CHỦ ĐỀ 8: BỘ CÂU HỎI QUAN TRỌNG HỘI ĐỒNG PHẢN BIỆN CHẮC CHẮN SẼ HỎI -->
<h1>PHẦN 8: BỘ CÂU HỎI TRỌNG YẾU HỘI ĐỒNG CHẮC CHẮN SẼ HỎI</h1>

<div class="callout callout-info">
  <strong>Câu 1: Điểm hiệu chuẩn (Calibration Score) và Điểm thi thật (Score) khác nhau thế nào? Tại sao phải tách thành 2 bảng?</strong><br>
  <em>Trả lời:</em> Điểm hiệu chuẩn là điểm giám khảo chấm thử trên bài mẫu (Sample Submission) trước giờ thi để làm quen thước đo và phục vụ nghiên cứu khoa học (đo hệ số tin cậy liên đánh giá viên IRR). Việc tách thành 2 bảng <code>calibration_score</code> và <code>score</code> đảm bảo các dữ liệu nghiên cứu thử nghiệm không bao giờ làm xáo trộn điểm thi và bảng xếp hạng chính thức của thí sinh.
</div>

<div class="callout callout-info">
  <strong>Câu 2: Tại sao khi nộp bài cờ <code>is_late</code> lại bằng <code>true (t)</code> và hệ thống xử lý bài nộp trễ như thế nào?</strong><br>
  <em>Trả lời:</em> Trong cơ sở dữ liệu mẫu, hạn chót nộp bài của Vòng Chung Kết là ngày <code>20/09/2026 23:59:59</code>, trong khi thời điểm nộp bài thực tế là ngày <code>23/09/2026</code>. Thuật toán tại <code>SubmissionService.java</code> so sánh <code>submittedAt.isAfter(deadline)</code> thấy trễ nên tự động đánh dấu <code>is_late = true</code>. Khi tính điểm xếp hạng tại <code>RankingService.java</code>, bài nộp trễ sẽ tự động bị phạt trừ 10% tổng điểm có trọng số nhằm đảm bảo công bằng.
</div>

<div class="callout callout-info">
  <strong>Câu 3: Làm thế nào để Bảng xếp hạng cập nhật ngay lập tức (Realtime) khi Giám khảo vừa bấm Lưu điểm?</strong><br>
  <em>Trả lời:</em> Trước đây việc tính điểm phải chờ Ban Tổ Chức bấm nút thủ công. Nhóm đã tối ưu trong <code>ScoreService.java</code>: Ngay khi Giám khảo bấm "Lưu" hoặc "Chốt điểm", hệ thống sẽ phát sinh sự kiện nội bộ và tự động gọi thuật toán <code>rankingService.compute()</code> chạy ngầm ngay tức khắc. Nhờ đó bảng xếp hạng tại <code>/rankings</code> luôn hiển thị kết quả chính xác theo thời gian thực 100%.
</div>

<div class="callout callout-info">
  <strong>Câu 4: Bảng <code>audit_log</code> bảo vệ hệ thống trước sự cố gian lận như thế nào?</strong><br>
  <em>Trả lời:</em> Mọi thao tác thay đổi trạng thái (Duyệt user, Nộp bài, Sửa điểm, Khóa điểm, Loại đội thi) đều tự động ghi lại Actor, Action, Entity, Timestamp và IP vào bảng <code>audit_log</code>. Hệ thống không cung cấp bất kỳ API nào để cập nhật hay xóa bảng này (Append-only trail), đảm bảo tính minh bạch, khách quan và chống chối bỏ trách nhiệm.
</div>

<div style="margin-top: 30px; text-align: center; border-top: 1px solid #cbd5e1; padding-top: 15px; color: #64748b; font-size: 11.5px;">
  <em>Báo cáo được biên soạn và chuẩn hóa phục vụ Lễ Bảo Vệ Khóa Luận Tốt Nghiệp Chuyên Ngành Kỹ Thuật Phần Mềm &mdash; Hệ Thống SEAL Hackathon 2026</em>
</div>

</body>
</html>
"""

with open(html_path, "w", encoding="utf-8") as f:
    f.write(html_content)

print(f"HTML written to {html_path}")

cmd = [
    r"C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "--headless=new",
    "--disable-gpu",
    "--run-all-compositor-stages-before-draw",
    f"--print-to-pdf={pdf_path}",
    html_path
]

print("Running Edge headless print-to-pdf...")
res = subprocess.run(cmd, capture_output=True, text=True)
print("Return code:", res.returncode)
print("Output:", res.stdout)
if res.stderr:
    print("Stderr:", res.stderr)

if os.path.exists(pdf_path):
    print(f"SUCCESS! PDF created at: {pdf_path} (Size: {os.path.getsize(pdf_path)} bytes)")
else:
    print("FAILED to create PDF.")
