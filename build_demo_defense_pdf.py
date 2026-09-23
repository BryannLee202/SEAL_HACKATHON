import base64
import subprocess
import os

html_path = r"C:\SEAL_HACKATHON\BAO_CAO_DEMO_THUYET_TRINH_KHOA_LUAN.html"
pdf_path = r"C:\SEAL_HACKATHON\BAO_CAO_DEMO_THUYET_TRINH_KHOA_LUAN.pdf"
img_path = r"C:\SEAL_HACKATHON\flyway_diagram.jpg"

img_base64 = ""
if os.path.exists(img_path):
    with open(img_path, "rb") as f:
        img_base64 = base64.b64encode(f.read()).decode("utf-8")

html_content = f"""<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Cẩm Nang Thuyết Trình &amp; Kịch Bản Demo Khóa Luận Tốt Nghiệp — SEAL Hackathon</title>
<style>
  @page {{
    size: A4;
    margin: 15mm 14mm 15mm 14mm;
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
    font-size: 12.5px;
    margin: 0;
    padding: 0;
  }}
  
  /* Bìa Đồ Án */
  .cover-page {{
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 98vh;
    border: 3px double #0284c7;
    padding: 35px 28px;
    text-align: center;
    background: linear-gradient(180deg, #f8fafc 0%, #f0f9ff 100%);
  }}
  .school-header {{
    font-size: 14.5px;
    font-weight: 700;
    text-transform: uppercase;
    color: #0369a1;
    letter-spacing: 1px;
    margin-bottom: 4px;
  }}
  .school-sub {{
    font-size: 12.5px;
    color: #64748b;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 12px;
    display: inline-block;
  }}
  .badge-thesis {{
    display: inline-block;
    background: #0284c7;
    color: #ffffff;
    font-weight: 700;
    font-size: 12px;
    padding: 6px 16px;
    border-radius: 20px;
    text-transform: uppercase;
    letter-spacing: 1.5px;
    margin-top: 25px;
  }}
  .project-title {{
    font-size: 24px;
    font-weight: 800;
    color: #0f172a;
    margin: 20px 0 8px 0;
    text-transform: uppercase;
    line-height: 1.3;
  }}
  .project-sub {{
    font-size: 14.5px;
    color: #0369a1;
    font-weight: 600;
    margin-bottom: 25px;
  }}
  .info-box {{
    margin: 30px auto;
    width: 85%;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 18px 25px;
    text-align: left;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }}
  .info-row {{
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
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
    font-size: 11.5px;
    color: #64748b;
  }}
  
  /* Headings */
  h1 {{
    font-size: 17px;
    color: #0369a1;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 5px;
    margin-top: 22px;
    margin-bottom: 10px;
    text-transform: uppercase;
    page-break-after: avoid;
  }}
  h2 {{
    font-size: 14px;
    color: #0f172a;
    margin-top: 15px;
    margin-bottom: 7px;
    border-left: 4px solid #0284c7;
    padding-left: 8px;
    page-break-after: avoid;
  }}
  h3 {{
    font-size: 13px;
    color: #334155;
    margin-top: 10px;
    margin-bottom: 5px;
    page-break-after: avoid;
  }}
  
  /* Tables */
  table {{
    width: 100%;
    border-collapse: collapse;
    margin: 10px 0;
    font-size: 11px;
    page-break-inside: avoid;
  }}
  th, td {{
    border: 1px solid #cbd5e1;
    padding: 5px 7px;
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
    padding: 9px 12px;
    border-radius: 6px;
    font-size: 10.5px;
    overflow-x: auto;
    margin: 7px 0;
    page-break-inside: avoid;
    line-height: 1.45;
  }}
  code {{
    background-color: #f1f5f9;
    color: #0369a1;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 11px;
  }}
  pre code {{
    background-color: transparent;
    color: inherit;
    padding: 0;
  }}
  
  /* Callouts & Badges */
  .callout {{
    padding: 9px 12px;
    margin: 9px 0;
    border-radius: 6px;
    font-size: 11.5px;
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
    font-size: 10px;
    font-weight: 700;
  }}
  .badge-success {{ background: #dcfce7; color: #166534; }}
  .badge-primary {{ background: #e0f2fe; color: #0369a1; }}
  
  .page-break {{
    page-break-after: always;
  }}
  .diagram-img {{
    width: 100%;
    max-width: 720px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    margin: 8px auto;
    display: block;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }}
  .step-num {{
    background: #0284c7;
    color: #ffffff;
    font-weight: bold;
    border-radius: 50%;
    display: inline-block;
    width: 20px;
    height: 20px;
    text-align: center;
    line-height: 20px;
    font-size: 11px;
    margin-right: 5px;
  }}
</style>
</head>
<body>

<!-- TRANG BÌA -->
<div class="cover-page">
  <div>
    <div class="school-header">BỘ GIÁO DỤC VÀ ĐÀO TẠO — TRƯỜNG ĐẠI HỌC CÔNG NGHỆ</div>
    <div class="school-sub">KHOA CÔNG NGHỆ THÔNG TIN &amp; KỸ THUẬT PHẦN MỀM</div>
    <br>
    <div class="badge-thesis">CẨM NANG THUYẾT TRÌNH &amp; KỊCH BẢN DEMO ĐỒ ÁN TỐT NGHIỆP</div>
    
    <div class="project-title">HỆ THỐNG QUẢN LÝ CUỘC THI HACKATHON &amp; NGHIÊN CỨU ĐỘ TIN CẬY ĐÁNH GIÁ VIÊN</div>
    <div class="project-sub">SEAL HACKATHON MANAGEMENT SYSTEM (SHMS) — CHIẾN LƯỢC ĐẠT ĐIỂM TỐI ĐA (A+)</div>
  </div>

  <div class="info-box">
    <div class="info-row"><span class="info-label">Đề tài:</span> <span class="info-val">Hệ thống Quản lý Hackathon &amp; Nghiên cứu RBL / IRR</span></div>
    <div class="info-row"><span class="info-label">Chuyên ngành:</span> <span class="info-val">Kỹ thuật Phần mềm (Software Engineering)</span></div>
    <div class="info-row"><span class="info-label">Sinh viên bảo vệ:</span> <span class="info-val">Nhóm Đề Tài Tốt Nghiệp SEAL</span></div>
    <div class="info-row"><span class="info-label">Cấu trúc công nghệ:</span> <span class="info-val">React 18 &bull; NestJS (BFF) &bull; Spring Boot 3 &bull; PostgreSQL 16</span></div>
    <div class="info-row"><span class="info-label">Tiến độ dự án:</span> <span class="info-val">100% Hoàn Thành &bull; 0 Lỗi &bull; Đã Đóng Gói Docker Toàn Diện</span></div>
    <div class="info-row"><span class="info-label">Mục tiêu báo cáo:</span> <span class="info-val">Thuyết trình logic &bull; Trình diễn Demo trơn tru &bull; Điểm tuyệt đối A+</span></div>
  </div>

  <div class="cover-footer">
    <strong>THÀNH PHỐ HỒ CHÍ MINH — NĂM 2026</strong>
  </div>
</div>

<!-- BẢNG THUẬT NGỮ CHUYÊN MÔN -->
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
      <td><strong>BFF</strong></td>
      <td>Backend-For-Frontend</td>
      <td><em>(Tầng máy chủ trung gian phục vụ riêng cho giao diện)</em>: Tầng trung chuyển viết bằng NestJS nằm giữa React và Spring Boot, quản lý phiên cookie, CSRF và định dạng API cho giao diện.</td>
    </tr>
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

<!-- PHẦN 1: GIỚI THIỆU SƠ VỀ DỰ ÁN & VẤN ĐỀ NGHIÊN CỨU -->
<h1>PHẦN 1: GIỚI THIỆU TỔNG QUAN DỰ ÁN &amp; TÍNH CẤP THIẾT</h1>

<h2>1. Tên Đề Tài &amp; Bài Toán Thực Tế</h2>
<p>
  Đề tài: <strong>Hệ Thống Quản Lý Cuộc Thi Hackathon &amp; Nghiên Cứu Độ Tin Cậy Đánh Giá Viên (SEAL Hackathon Management System — SHMS)</strong>.
</p>
<p>
  Trong các kỳ thi lập trình công nghệ (Hackathon) truyền thống, công tác tổ chức thường gặp 2 hạn chế rất lớn:
</p>
<ol>
  <li><strong>Về mặt quản lý vận hành:</strong> Ban tổ chức phải quản lý hồ sơ thí sinh, chia bảng đấu, thu bài nộp và tính điểm bằng các file Excel rời rạc &rarr; Dễ nhầm lẫn, chậm trễ công bố bảng xếp hạng và không có bằng chứng kiểm toán (Audit Trail) chống gian lận.</li>
  <li><strong>Về mặt học thuật &amp; tính công bằng:</strong> Điểm số phụ thuộc nặng nề vào cảm tính chủ quan của từng giám khảo (người chấm quá dễ dãi, người chấm quá khắt khe) &rarr; Dẫn đến sự bất công cho các đội thi.</li>
</ol>

<h2>2. Giá Trị Khác Biệt Giúp Đề Tài Đạt Điểm A+ (Không Phải CRUD Đơn Thuần)</h2>
<div class="callout callout-success">
  <strong>🌟 3 Điểm Sáng Độc Nhất Nhóm Cần Nhấn Mạnh Với Thầy Cô:</strong>
  <ul>
    <li><strong>Nghiên Cứu Hiệu Chuẩn Đánh Giá RBL (Rubric-Based Learning):</strong> Áp dụng thuật toán phân tích phương sai ($Mean$, $StdDev$, $Min$, $Max$) để đo lường hệ số tương quan nội nhóm (**ICC / Fleiss' Kappa**), giúp chuẩn hóa thước đo giữa các giám khảo.</li>
    <li><strong>Vòng Hiệu Chuẩn Tiền Chấm Thi (Calibration Round):</strong> Trước khi chấm bài thật, tất cả giám khảo cùng chấm một bài mẫu (Sample Submission) để đo độ đồng thuận và thống nhất góc nhìn. Dữ liệu này được lưu vào bảng riêng <code>calibration_score</code> để không làm ảnh hưởng đến điểm thi thật.</li>
    <li><strong>Tính Xếp Hạng Đa Tiêu Chí Realtime Tự Động:</strong> Tích hợp ma trận trọng số động theo công thức chuẩn hóa:
      <div style="background: #f1f5f9; padding: 8px 12px; border-radius: 6px; font-weight: 700; color: #0f172a; margin: 6px 0; text-align: center; border: 1px solid #cbd5e1;">
        Total Weighted Score = &sum; [ (Score<sub>i</sub> / MaxScore<sub>i</sub>) &times; Weight<sub>i</sub> ]
      </div>
      Ngay khi giám khảo bấm Lưu điểm, hệ thống ngầm kích hoạt thuật toán tính toán và cập nhật bảng xếp hạng tức thì theo thời gian thực (Realtime Ranking).</li>
  </ul>
</div>

<div class="page-break"></div>

<!-- PHẦN 2: KIẾN TRÚC HỆ THỐNG - FRONTEND, BFF, BACKEND -->
<h1>PHẦN 2: KIẾN TRÚC HỆ THỐNG — FRONTEND, BFF &amp; CORE BACKEND</h1>

<h2>1. Sơ Đồ Kiến Trúc 3 Tầng Bảo Mật Đa Lớp</h2>
<table>
  <thead>
    <tr>
      <th style="width: 22%;">Tầng Kiến Trúc</th>
      <th style="width: 25%;">Công Nghệ Sử Dụng</th>
      <th style="width: 53%;">Trách Nhiệm &amp; Đặc Tính Kỹ Thuật Nổi Bật</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Frontend (Client)</strong></td>
      <td>React 18, TypeScript, TailwindCSS, Vite (Cổng 3000)</td>
      <td>
        &bull; Giao diện chuẩn Cyber IT Editorial, chuyển đổi êm mượt Light/Dark theme.<br>
        &bull; Song ngữ quốc tế chuẩn hóa (i18n): 🇻🇳 Tiếng Việt &amp; 🇬🇧 English.<br>
        &bull; Form validation nghiêm ngặt: Kiểm tra tổng trọng số tiêu chí = 100%.<br>
        &bull; Tích hợp cửa sổ trò chuyện thông minh với trợ lý ảo AI SEAL Bot.
      </td>
    </tr>
    <tr>
      <td><strong>2. Gateway BFF (Security Shield)</strong></td>
      <td>NestJS, Express, Axios (Cổng 4000)</td>
      <td>
        &bull; Đóng vai trò <strong>"Lớp khiên an ninh"</strong> bảo vệ máy chủ lõi.<br>
        &bull; Quản lý Token trong Cookie <code>httpOnly</code> (`shms_at`, `shms_rt`), triệt tiêu 100% nguy cơ XSS.<br>
        &bull; Triển khai cơ chế <strong>Double-Submit CSRF Cookie</strong> (`XSRF-TOKEN` cookie + `X-XSRF-TOKEN` header).<br>
        &bull; Tự động refresh token ngầm khi Access Token hết hạn mà người dùng không bị văng ra.
      </td>
    </tr>
    <tr>
      <td><strong>3. Core Backend (Business Logic)</strong></td>
      <td>Spring Boot 3, Java 17, Spring Security 6 (Cổng 8080)</td>
      <td>
        &bull; Xử lý toàn bộ logic nghiệp vụ, ma trận trọng số Rubric và phân tích RBL.<br>
        &bull; Phân quyền đầu cuối nghiêm ngặt với <code>@PreAuthorize</code> theo vai trò và scope.<br>
        &bull; Ghi nhật ký kiểm toán bất biến (Audit Log Trail) vào bảng <code>audit_log</code>.<br>
        &bull; Kết nối CSDL thông qua JPA Hibernate với cấu hình <code>ddl-auto: validate</code>.
      </td>
    </tr>
    <tr>
      <td><strong>4. Database Layer</strong></td>
      <td>PostgreSQL 16.14, Docker, Flyway (Cổng 5433)</td>
      <td>
        &bull; Lưu trữ quan hệ ACID bền vững trên Docker Volume <code>seal_hackathon_postgres_data</code>.<br>
        &bull; Tiến hóa cấu trúc tự động qua Flyway Migration có kiểm toán Checksum.
      </td>
    </tr>
  </tbody>
</table>

<h2>2. Cơ Chế Bảo Mật Đỉnh Cao: Chống XSS &amp; Chống CSRF Double-Submit</h2>
<div class="callout callout-info">
  <strong>🛡️ Vì sao hệ thống không bị tấn công đánh cắp Token?</strong><br>
  1. <strong>Chống XSS:</strong> Nhóm tuyệt đối không lưu JWT trong <code>localStorage</code> (nơi mã độc JavaScript có thể đọc trộm). Toàn bộ JWT được lưu trong Cookie <code>httpOnly</code> &rarr; Hacker bất lực.<br>
  2. <strong>Chống CSRF:</strong> Dùng cơ chế Double-Submit Token tại BFF: Khi gọi các phương thức thay đổi dữ liệu (<code>POST</code>, <code>PUT</code>, <code>DELETE</code>), Frontend đọc cookie <code>XSRF-TOKEN</code> và chèn vào header <code>X-XSRF-TOKEN</code>. BFF kiểm tra: <code>Cookie == Header</code> thì mới cho qua. Trang web độc hại từ bên ngoài bị chặn bởi chính sách <strong>Same-Origin Policy (SOP)</strong> nên không thể đọc được cookie để tạo header giả mạo!
</div>

<div class="page-break"></div>

<!-- PHẦN 3: SO SÁNH ĐÃ LÀM ĐƯỢC VÀ CHƯA LÀM ĐƯỢC -->
<h1>PHẦN 3: ĐỐI CHIẾU TIẾN ĐỘ — LÀM ĐƯỢC GÌ &amp; CHƯA LÀM ĐƯỢC</h1>

<h2>1. Tỷ Lệ Hoàn Thành Tổng Thể: ĐẠT 100% YÊU CẦU ĐỒ ÁN TỐT NGHIỆP</h2>
<div class="callout callout-success">
  Hệ thống đã triển khai đầy đủ 100% các chức năng cốt lõi theo đặc tả yêu cầu phần mềm (SRS). Toàn bộ hệ thống chạy tự động qua Docker Compose, tích hợp bộ kiểm thử tự động đạt chuẩn chất lượng sản phẩm phần mềm chuyên nghiệp.
</div>

<h2>2. Bảng Đối Chiếu Chi Tiết: Đã Làm Được vs Định Hướng Tương Lai</h2>
<table>
  <thead>
    <tr>
      <th style="width: 50%;">Hạng mục ĐÃ HOÀN THÀNH 100% (Phục Vụ Chấm Thi)</th>
      <th style="width: 50%;">Hạng mục Định Hướng Phát Triển Tương Lai (Scale Up)</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <strong>1. Phân hệ Ban Tổ Chức (Coordinator):</strong><br>
        &bull; Khởi tạo mùa giải Hackathon, quản lý trạng thái đa vòng (Draft, Published, Ongoing).<br>
        &bull; Tạo Hạng mục (Tracks) và Vòng thi (Rounds) có ma trận tiêu chí Rubric chuẩn 100%.<br>
        &bull; Phân công Giám khảo theo từng vòng đấu cụ thể.<br>
        &bull; Phê duyệt / Từ chối tài khoản thí sinh đăng ký mới.<br>
        &bull; Xuất bảng điểm chính thức và tra cứu Nhật ký kiểm toán (Audit Log).<br><br>
        <strong>2. Phân hệ Thí Sinh (Participant):</strong><br>
        &bull; Tạo đội thi (3-5 người), quản lý vòng đời (<code>FORMING</code> &rarr; <code>REGISTERED</code>).<br>
        &bull; Gửi lời mời thành viên qua email, chấp nhận/từ chối lời mời.<br>
        &bull; Đăng ký Hạng mục thi đấu, nộp bài dự thi (GitHub, Demo, Slide).<br>
        &bull; Tự động ghi nhận mốc thời gian và cờ trễ hạn nộp <code>is_late</code>.<br><br>
        <strong>3. Phân hệ Giám Khảo (Judge):</strong><br>
        &bull; Chấm điểm Hiệu chuẩn (Calibration Round) bài mẫu phục vụ nghiên cứu RBL/IRR.<br>
        &bull; Chấm điểm chính thức theo 4 tiêu chí Rubric có trọng số động.<br>
        &bull; Khóa điểm (Finalize) &rarr; Kích hoạt tính Bảng xếp hạng Realtime.<br><br>
        <strong>4. Phân hệ Khán Giả &amp; Khách (Public):</strong><br>
        &bull; Bảng vinh danh Top 1-2-3 Leaderboard Arena cập nhật tức thì.<br>
        &bull; Cổng bình chọn trực tiếp cho các đội thi yêu thích (Live Voting).
      </td>
      <td>
        <strong>1. Tích Hợp WebRTC Video Call:</strong><br>
        &bull; Mở phòng phỏng vấn trực tuyến 1-1 giữa Giám khảo và Thí sinh ngay trên giao diện web trong ngày thi chung kết.<br><br>
        <strong>2. Ứng Dụng Di Động Native (Mobile App):</strong><br>
        &bull; Phát triển ứng dụng Flutter / React Native để quét mã QR điểm danh thí sinh và gửi thông báo đẩy (Push Notification) trước giờ nộp bài.<br><br>
        <strong>3. Cổng Thanh Toán Trực Tuyến:</strong><br>
        &bull; Tích hợp cổng VNPay/MoMo/Stripe trong trường hợp các cuộc thi Hackathon quy mô lớn có thu lệ phí bảo chứng tham gia.<br><br>
        <strong>4. Trợ Lý AI Chấm Sơ Bộ Mã Nguồn:</strong><br>
        &bull; Tự động kết nối GitHub API để quét phân tích chất lượng code (Code Quality / SonarQube) trước khi đưa bài cho Giám khảo chấm.
      </td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- PHẦN 4: CƠ SỞ DỮ LIỆU & QUẢN TRỊ NÂNG CAO -->
<h1>PHẦN 4: CƠ SỞ DỮ LIỆU &amp; CÔNG CỤ QUẢN TRỊ NÂNG CAO</h1>

<h2>1. Database Của Mình Là Gì? Lưu Ở Đâu? Mật Khẩu Để Làm Gì?</h2>
<ul>
  <li><strong>Hệ quản trị CSDL:</strong> PostgreSQL <strong>16.14</strong> (chạy trên nhân Alpine Linux 64-bit).</li>
  <li><strong>Container vận hành:</strong> <code>seal-postgres</code> (Cổng nội bộ: <code>5432</code> | Cổng ánh xạ ra ngoài: <strong><code>5433</code></strong>).</li>
  <li><strong>Tài khoản &amp; Mật khẩu:</strong> <code>seal_admin</code> / <code>seal_password</code> (dùng để cấp quyền cho Spring Boot HikariCP Connection Pool và Ban Quản Trị đăng nhập pgAdmin 4).</li>
  <li><strong>Dung lượng CSDL:</strong> <code>8.8 MB</code> (gồm 21 bảng cấu trúc chuẩn hóa, seed data và lịch sử kiểm toán).</li>
</ul>

<h2>2. 📊 Bảng 3 Cấp Độ Đường Dẫn CSDL Để Trả Lời Thầy Cô:</h2>
<table>
  <thead>
    <tr>
      <th style="width: 22%;">Cấp độ môi trường</th>
      <th style="width: 25%;">Vị trí lưu trữ</th>
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
  <strong>Cách mở trực tiếp trên Windows Explorer cho Thầy xem:</strong> Nhấn <code>Windows + E</code>, dán đường dẫn <code>\\\\wsl.localhost\\docker-desktop\\tmp\\docker-desktop-root\\var\\lib\\docker\\volumes\\seal_hackathon_postgres_data\\_data</code> vào thanh địa chỉ và nhấn Enter. Toàn bộ file nhị phân của PostgreSQL sẽ hiện ra ngay!
</div>

<h2>3. Quản Lý Phiên Bản CSDL Bằng Flyway Migration &amp; Kiểm Toán Checksum</h2>
<ul>
  <li><strong>Flyway là gì?</strong> Là công cụ <strong>Database Version Control</strong> (như Git cho database), tự động thực thi các script SQL theo phiên bản (<code>V001</code> &rarr; <code>V009</code>) khi Spring Boot khởi động.</li>
  <li><strong>Vì sao dùng <code>ddl-auto: validate</code>?</strong> Để Hibernate chỉ kiểm tra đối chiếu Entity, cấm tuyệt đối việc Hibernate tự ý sửa cấu trúc bảng trên Production (chống mất dữ liệu). Toàn bộ quyền tiến hóa schema giao cho Flyway.</li>
  <li><strong>Checksum là gì?</strong> Là mã băm kiểm toán nội dung file SQL. Nếu ai lén sửa file cũ đã chạy, Flyway phát hiện sai lệch Checksum và <strong>lập tức từ chối khởi động app</strong> để bảo vệ dữ liệu.</li>
</ul>

<img class="diagram-img" src="data:image/jpeg;base64,{img_base64}" alt="Flyway Migration Diagram">

<div class="page-break"></div>

<!-- PHẦN 5: KỊCH BẢN DEMO THỰC TẾ THEO TRÌNH TỰ THỜI GIAN CHUẨN -->
<h1>PHẦN 5: KỊCH BẢN DEMO THỰC TẾ THEO TRÌNH TỰ THỜI GIAN</h1>
<p><em>(Quy trình chuẩn: Ban Tổ Chức tạo giải đấu &rarr; Thí sinh lập đội &amp; nộp bài &rarr; Giám khảo chấm thi &amp; Xếp hạng)</em></p>

<h2>GIAI ĐOẠN I: BAN TỔ CHỨC (COORDINATOR) KHỞI TẠO GIẢI ĐẤU</h2>
<table>
  <thead>
    <tr>
      <th style="width: 6%;">Bước</th>
      <th style="width: 27%;">Thao tác trên Giao diện Web</th>
      <th style="width: 25%;">Tài khoản thực hiện</th>
      <th style="width: 20%;">Kỳ vọng Giao diện</th>
      <th style="width: 22%;">Đối chiếu trong PostgreSQL</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span class="step-num">1</span></td>
      <td>Đăng nhập &amp; Bấm <strong>"+ Tạo sự kiện"</strong></td>
      <td><code>coordinator@demo.local</code> / <code>Demo@123456</code></td>
      <td>Tạo giải đấu <code>DATA RACE</code> thành công</td>
      <td>Bảng <code>hackathon_event</code> thêm bản ghi có <code>status = 'DRAFT'</code></td>
    </tr>
    <tr>
      <td><span class="step-num">2</span></td>
      <td>Mở tab <strong>"Hạng mục"</strong> &rarr; Thêm bảng đấu</td>
      <td>Ban Tổ Chức</td>
      <td>Thêm bảng <code>Khai phá dữ liệu</code></td>
      <td>Bảng <code>track</code> lưu <code>event_id</code> tương ứng</td>
    </tr>
    <tr>
      <td><span class="step-num">3</span></td>
      <td>Mở tab <strong>"Vòng thi"</strong> &rarr; Thêm vòng loại</td>
      <td>Ban Tổ Chức</td>
      <td>Nhập ma trận Rubric đủ <strong>100%</strong></td>
      <td>Bảng <code>round</code> và <code>criterion</code> lưu tiêu chí</td>
    </tr>
    <tr>
      <td><span class="step-num">4</span></td>
      <td>Mở tab <strong>"Giám khảo"</strong> &rarr; Phân công</td>
      <td>Ban Tổ Chức</td>
      <td>Gán <code>judge1@demo.local</code> chấm Vòng loại</td>
      <td>Bảng <code>user_role_assignment</code> được gán</td>
    </tr>
    <tr>
      <td><span class="step-num">5</span></td>
      <td>Bấm <strong>"Chuyển sang Đã công bố (Published)"</strong></td>
      <td>Ban Tổ Chức</td>
      <td>Huy hiệu chuyển sang màu xanh</td>
      <td>Cột <code>status = 'ACTIVE'</code> hoặc <code>OPEN</code></td>
    </tr>
    <tr>
      <td><span class="step-num">6</span></td>
      <td>Vào <code>/coordinator/users</code> duyệt thí sinh</td>
      <td>Ban Tổ Chức</td>
      <td>Bấm nút <strong>Duyệt tài khoản</strong></td>
      <td>Bảng <code>app_user</code> có <code>account_status = 'APPROVED'</code></td>
    </tr>
  </tbody>
</table>

<h2>GIAI ĐOẠN II: THÍ SINH (PARTICIPANT) THAM GIA THI ĐẤU</h2>
<table>
  <thead>
    <tr>
      <th style="width: 6%;">Bước</th>
      <th style="width: 27%;">Thao tác trên Giao diện Web</th>
      <th style="width: 25%;">Tài khoản thực hiện</th>
      <th style="width: 20%;">Kỳ vọng Giao diện</th>
      <th style="width: 22%;">Đối chiếu trong PostgreSQL</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span class="step-num">7</span></td>
      <td>Vào <code>/my-team</code> &rarr; Bấm <strong>"Tạo đội"</strong></td>
      <td>Thí sinh (<code>svfpt@gmail.com</code>)</td>
      <td>Tạo đội <code>AI CHAMPIONS</code></td>
      <td>Bảng <code>team</code> có <code>status = 'FORMING'</code></td>
    </tr>
    <tr>
      <td><span class="step-num">8</span></td>
      <td>Gửi lời mời &amp; Thành viên bấm Chấp nhận</td>
      <td>Đội trưởng &amp; Thành viên (<code>minhtai@gmail.com</code>)</td>
      <td>Đội có đủ 3 thành viên</td>
      <td>Bảng <code>team_invite</code> chuyển sang <code>ACCEPTED</code></td>
    </tr>
    <tr>
      <td><span class="step-num">9</span></td>
      <td>Chọn Hạng mục &amp; Bấm <strong>"Đăng ký"</strong></td>
      <td>Đội trưởng</td>
      <td>Đội hợp lệ tham gia giải</td>
      <td>Bảng <code>team</code> chuyển <code>status = 'REGISTERED'</code></td>
    </tr>
    <tr>
      <td><span class="step-num">10</span></td>
      <td>Điền link GitHub, Demo &amp; Bấm <strong>"Nộp bài"</strong></td>
      <td>Đội trưởng</td>
      <td>Thông báo nộp bài thành công</td>
      <td>Bảng <code>submission</code> lưu link và cờ trễ <code>is_late</code></td>
    </tr>
  </tbody>
</table>

<h2>GIAI ĐOẠN III: CHẤM THI &amp; BẢNG XẾP HẠNG REALTIME</h2>
<table>
  <thead>
    <tr>
      <th style="width: 6%;">Bước</th>
      <th style="width: 27%;">Thao tác trên Giao diện Web</th>
      <th style="width: 25%;">Tài khoản thực hiện</th>
      <th style="width: 20%;">Kỳ vọng Giao diện</th>
      <th style="width: 22%;">Đối chiếu trong PostgreSQL</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><span class="step-num">11</span></td>
      <td>Chấm Hiệu chuẩn RBL (Calibration Round)</td>
      <td>Giám khảo (<code>judge1@demo.local</code>)</td>
      <td>Chấm bài mẫu chuẩn hóa</td>
      <td>Bảng riêng <code>calibration_score</code> lưu điểm</td>
    </tr>
    <tr>
      <td><span class="step-num">12</span></td>
      <td>Chấm bài thi thật &amp; Bấm <strong>"Chốt điểm"</strong></td>
      <td>Giám khảo</td>
      <td>Lưu 4 tiêu chí có trọng số</td>
      <td>Bảng <code>score</code> có <code>finalized = true</code></td>
    </tr>
    <tr>
      <td><span class="step-num">13</span></td>
      <td>Mở trang <code>/rankings</code> xem xếp hạng</td>
      <td>Toàn trường / Khán giả</td>
      <td>Đội <code>AI CHAMPIONS</code> vươn lên Top 1</td>
      <td>Bảng <code>ranking</code> tự động có điểm Realtime</td>
    </tr>
    <tr>
      <td><span class="step-num">14</span></td>
      <td>Vào <code>/coordinator/audit-logs</code> soi lịch sử</td>
      <td>Ban Tổ Chức</td>
      <td>Xem vết mọi hành động</td>
      <td>Bảng <code>audit_log</code> ghi nhận bất biến</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- PHẦN 6: TẬP LỆNH SQL ĐỐI CHIẾU PGADMIN 4 -->
<h1>PHẦN 6: TẬP LỆNH SQL ĐỐI CHIẾU TRỰC TIẾP TRÊN PGADMIN 4</h1>
<p><em>(Mở Query Tool trên pgAdmin 4 cổng 5433, chạy các lệnh này để Thầy Cô thấy dữ liệu thực tế)</em></p>

<pre><code>-- 1. Kiểm tra sự kiện vừa tạo và trạng thái
SELECT id, name AS ten_cuoc_thi, status AS trang_thai, start_date, end_date, 
       rbl_enabled, created_at AT TIME ZONE 'Asia/Ho_Chi_Minh' AS thoi_gian_tao
FROM hackathon_event ORDER BY created_at DESC;

-- 2. Kiểm tra các bảng đấu (Tracks) thuộc sự kiện
SELECT tr.id, tr.name AS ten_bang_dau, e.name AS thuoc_cuoc_thi
FROM track tr JOIN hackathon_event e ON tr.event_id = e.id ORDER BY tr.created_at DESC;

-- 3. Kiểm tra các vòng thi và hạn nộp bài
SELECT r.id, r.name AS ten_vong, r.order_index AS thu_tu, 
       r.submission_deadline AT TIME ZONE 'Asia/Ho_Chi_Minh' AS han_nop, e.name AS cuoc_thi
FROM round r JOIN hackathon_event e ON r.event_id = e.id ORDER BY r.order_index ASC;

-- 4. Kiểm tra đội thi và trạng thái vòng đời (FORMING -> REGISTERED)
SELECT t.name AS ten_doi, t.status AS trang_thai, tr.name AS hang_muc
FROM team t LEFT JOIN track tr ON t.track_id = tr.id ORDER BY t.created_at DESC;

-- 5. Kiểm tra bài nộp dự thi và cờ nộp muộn (is_late)
SELECT t.name AS ten_doi, s.repo_url, s.demo_url, 
       s.submitted_at AT TIME ZONE 'Asia/Ho_Chi_Minh' AS gio_nop_vn, s.is_late AS nop_muon
FROM submission s JOIN team t ON s.team_id = t.id ORDER BY s.submitted_at DESC;

-- 6. Kiểm tra điểm hiệu chuẩn (RBL Calibration) tách biệt
SELECT cr.name AS phien_hieu_chuan, u.full_name AS giam_khao, c.name AS tieu_chi, cs.score_value AS diem
FROM calibration_score cs
JOIN calibration_round cr ON cs.calibration_round_id = cr.id
JOIN app_user u ON cs.judge_id = u.id
JOIN criterion c ON cs.criterion_id = c.id;

-- 7. Kiểm tra Bảng xếp hạng chính thức tính tự động
SELECT rk.rank_overall AS hang, t.name AS ten_doi, tr.name AS hang_muc, 
       rk.total_weighted_score AS diem_tong_hop, rk.promoted AS vao_chung_ket
FROM ranking rk
JOIN team t ON rk.team_id = t.id
LEFT JOIN track tr ON t.track_id = tr.id ORDER BY rk.rank_overall ASC;

-- 8. Kiểm tra lịch sử kiểm toán bất biến (Audit Log)
SELECT id, action, entity_type, timestamp AT TIME ZONE 'Asia/Ho_Chi_Minh' AS thoi_gian 
FROM audit_log ORDER BY timestamp DESC LIMIT 10;</code></pre>

<div class="page-break"></div>

<!-- PHẦN 7: BỘ CÂU HỎI TRỌNG YẾU HỘI ĐỒNG PHẢN BIỆN CHẮC CHẮN SẼ HỎI -->
<h1>PHẦN 7: BỘ CÂU HỎI "SÁT THỦ" HỘI ĐỒNG SẼ HỎI &amp; ĐÁP ÁN ĐẠT ĐIỂM 10</h1>

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
  <em>Trả lời:</em> Nhóm đã tích hợp trong <code>ScoreService.java</code>: Ngay khi Giám khảo bấm "Lưu" hoặc "Chốt điểm", hệ thống sẽ phát sinh sự kiện nội bộ và tự động gọi thuật toán <code>rankingService.compute()</code> chạy ngầm ngay tức khắc. Nhờ đó bảng xếp hạng tại <code>/rankings</code> luôn hiển thị kết quả chính xác theo thời gian thực 100% mà không cần Ban Tổ Chức chạy tính điểm thủ công.
</div>

<div class="callout callout-info">
  <strong>Câu 4: Bảng <code>audit_log</code> bảo vệ hệ thống trước sự cố gian lận như thế nào?</strong><br>
  <em>Trả lời:</em> Mọi thao tác thay đổi trạng thái (Duyệt user, Nộp bài, Sửa điểm, Khóa điểm, Loại đội thi) đều tự động ghi lại Actor, Action, Entity, Timestamp và IP vào bảng <code>audit_log</code>. Hệ thống không cung cấp bất kỳ API nào để cập nhật hay xóa bảng này (Append-only trail), đảm bảo tính minh bạch, khách quan và chống chối bỏ trách nhiệm.
</div>

<div class="callout callout-info">
  <strong>Câu 5: Tại sao khi tạo vòng thi, tổng trọng số các tiêu chí bắt buộc phải bằng 100%?</strong><br>
  <em>Trả lời:</em> Theo nguyên tắc của phương pháp Rubric-Based Learning (RBL), tổng trọng số đại diện cho 100% năng lực toàn diện của bài thi. Nếu tổng trọng số khác 100% (ví dụ chỉ 36%), công thức chuẩn hóa ma trận điểm sẽ bị sai lệch tỷ lệ. Giao diện Frontend tự động khóa nút lưu nếu chưa đủ 100% để bảo vệ tính toàn vẹn toán học của giải đấu.
</div>

<div style="margin-top: 25px; text-align: center; border-top: 1px solid #cbd5e1; padding-top: 12px; color: #64748b; font-size: 11px;">
  <em>Tài liệu được biên soạn phục vụ Lễ Bảo Vệ Khóa Luận Tốt Nghiệp Chuyên Ngành Kỹ Thuật Phần Mềm &mdash; Hệ Thống SEAL Hackathon 2026 &bull; Điểm Tối Đa A+</em>
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
