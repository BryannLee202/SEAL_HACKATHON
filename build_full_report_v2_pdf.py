import base64
import subprocess
import os
import shutil

html_path = r"C:\SEAL_HACKATHON\BAO_CAO_KHOA_LUAN_SEAL_HACKATHON_V2_UPDATE.html"
pdf_path = r"C:\SEAL_HACKATHON\BAO_CAO_KHOA_LUAN_SEAL_HACKATHON_V2_UPDATE.pdf"

arch_img_path = r"C:\SEAL_HACKATHON\multi_tier_architecture.png"
flyway_img_path = r"C:\SEAL_HACKATHON\flyway_diagram.jpg"

arch_base64 = ""
if os.path.exists(arch_img_path):
    with open(arch_img_path, "rb") as f:
        arch_base64 = base64.b64encode(f.read()).decode("utf-8")

flyway_base64 = ""
if os.path.exists(flyway_img_path):
    with open(flyway_img_path, "rb") as f:
        flyway_base64 = base64.b64encode(f.read()).decode("utf-8")

html_content = """<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Báo Cáo Khóa Luận Tốt Nghiệp V2 — Hệ Thống SEAL Hackathon &amp; Nghiên Cứu RBL/IRR</title>
<style>
  @page {
    size: A4;
    margin: 14mm 13mm 14mm 13mm;
    @bottom-right {
      content: counter(page);
    }
  }
  * {
    box-sizing: border-box;
  }
  body {
    font-family: 'Segoe UI', Arial, sans-serif;
    line-height: 1.52;
    color: #1e293b;
    background: #ffffff;
    font-size: 12.2px;
    margin: 0;
    padding: 0;
  }
  
  /* Cover Page */
  .cover-page {
    page-break-after: always;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 98vh;
    border: 3px double #0284c7;
    padding: 32px 26px;
    text-align: center;
    background: linear-gradient(180deg, #f8fafc 0%, #f0f9ff 100%);
  }
  .school-header {
    font-size: 14.5px;
    font-weight: 700;
    text-transform: uppercase;
    color: #0369a1;
    letter-spacing: 1px;
    margin-bottom: 4px;
  }
  .school-sub {
    font-size: 12.5px;
    color: #64748b;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 12px;
    display: inline-block;
  }
  .badge-thesis {
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
  }
  .project-title {
    font-size: 23px;
    font-weight: 800;
    color: #0f172a;
    margin: 18px 0 8px 0;
    text-transform: uppercase;
    line-height: 1.3;
  }
  .project-sub {
    font-size: 14px;
    color: #0369a1;
    font-weight: 600;
    margin-bottom: 22px;
  }
  .info-box {
    margin: 25px auto;
    width: 88%;
    background: #ffffff;
    border: 1px solid #cbd5e1;
    border-radius: 8px;
    padding: 16px 24px;
    text-align: left;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  }
  .info-row {
    display: flex;
    justify-content: space-between;
    padding: 5px 0;
    border-bottom: 1px dashed #e2e8f0;
  }
  .info-row:last-child {
    border-bottom: none;
  }
  .info-label {
    font-weight: 600;
    color: #475569;
  }
  .info-val {
    font-weight: 700;
    color: #0f172a;
  }
  .cover-footer {
    font-size: 11.5px;
    color: #64748b;
  }
  
  /* Headings */
  h1 {
    font-size: 15.5px;
    color: #0369a1;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 5px;
    margin-top: 18px;
    margin-bottom: 9px;
    text-transform: uppercase;
    page-break-after: avoid;
  }
  h2 {
    font-size: 13.2px;
    color: #0f172a;
    margin-top: 13px;
    margin-bottom: 6px;
    border-left: 4px solid #0284c7;
    padding-left: 8px;
    page-break-after: avoid;
  }
  h3 {
    font-size: 12.2px;
    color: #334155;
    margin-top: 9px;
    margin-bottom: 4px;
    page-break-after: avoid;
  }
  
  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 8px 0;
    font-size: 11px;
    page-break-inside: avoid;
  }
  th, td {
    border: 1px solid #cbd5e1;
    padding: 5px 7px;
    text-align: left;
    vertical-align: top;
  }
  th {
    background-color: #f1f5f9;
    color: #0f172a;
    font-weight: 700;
  }
  tr:nth-child(even) {
    background-color: #f8fafc;
  }
  
  /* Code blocks */
  pre, code {
    font-family: 'Consolas', 'Courier New', monospace;
  }
  pre {
    background-color: #0f172a;
    color: #e2e8f0;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 10.5px;
    overflow-x: auto;
    margin: 7px 0;
    page-break-inside: avoid;
    line-height: 1.45;
  }
  code {
    background-color: #f1f5f9;
    color: #0369a1;
    padding: 1px 4px;
    border-radius: 3px;
    font-size: 11px;
  }
  pre code {
    background-color: transparent;
    color: inherit;
    padding: 0;
  }
  
  /* Callouts & Badges */
  .callout {
    padding: 8px 12px;
    margin: 8px 0;
    border-radius: 6px;
    font-size: 11.5px;
    page-break-inside: avoid;
  }
  .callout-info {
    background-color: #f0f9ff;
    border-left: 4px solid #0284c7;
    color: #0c4a6e;
  }
  .callout-speech {
    background-color: #fdf4ff;
    border-left: 4px solid #c026d3;
    color: #701a75;
  }
  .callout-success {
    background-color: #f0fdf4;
    border-left: 4px solid #16a34a;
    color: #14532d;
  }
  .callout-warning {
    background-color: #fffbeb;
    border-left: 4px solid #f59e0b;
    color: #78350f;
  }
  .badge {
    display: inline-block;
    padding: 2px 7px;
    border-radius: 10px;
    font-size: 10px;
    font-weight: 700;
  }
  .badge-success { background: #dcfce7; color: #166534; }
  .badge-primary { background: #e0f2fe; color: #0369a1; }
  
  .page-break {
    page-break-after: always;
  }
  .diagram-img {
    width: 100%;
    max-width: 720px;
    border-radius: 8px;
    border: 1px solid #cbd5e1;
    margin: 8px auto;
    display: block;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  }
  .step-num {
    background: #0284c7;
    color: #ffffff;
    font-weight: bold;
    border-radius: 50%;
    display: inline-block;
    width: 19px;
    height: 19px;
    text-align: center;
    line-height: 19px;
    font-size: 10.5px;
    margin-right: 5px;
  }
</style>
</head>
<body>

<!-- TRANG BÌA -->
<div class="cover-page">
  <div>
    <div class="school-header">BỘ GIÁO DỤC VÀ ĐÀO TẠO — TRƯỜNG ĐẠI HỌC CÔNG NGHỆ</div>
    <div class="school-sub">KHOA CÔNG NGHỆ THÔNG TIN &amp; KỸ THUẬT PHẦN MỀM</div>
    <br>
    <div class="badge-thesis">BÁO CÁO KHÓA LUẬN TỐT NGHIỆP TOÀN DIỆN (PHIÊN BẢN V2 MỞ RỘNG)</div>
    
    <div class="project-title">HỆ THỐNG QUẢN LÝ CUỘC THI HACKATHON &amp; NGHIÊN CỨU ĐỘ TIN CẬY ĐÁNH GIÁ VIÊN</div>
    <div class="project-sub">SEAL HACKATHON MANAGEMENT SYSTEM (SHMS) — ĐÁP ÁN BẢO VỆ ĐẠT ĐIỂM TỐI ĐA (A+)</div>
  </div>

  <div class="info-box">
    <div class="info-row"><span class="info-label">Đề tài:</span> <span class="info-val">Hệ thống Quản lý Hackathon &amp; Nghiên cứu RBL / IRR</span></div>
    <div class="info-row"><span class="info-label">Chuyên ngành:</span> <span class="info-val">Kỹ thuật Phần mềm (Software Engineering)</span></div>
    <div class="info-row"><span class="info-label">Sinh viên thực hiện:</span> <span class="info-val">Nhóm Đề Tài Tốt Nghiệp SEAL</span></div>
    <div class="info-row"><span class="info-label">Kiến trúc:</span> <span class="info-val">4 Tầng Độc Lập (React 18 &bull; Express BFF &bull; Spring Boot 3 &bull; PostgreSQL 16)</span></div>
    <div class="info-row"><span class="info-label">Cơ chế nổi bật:</span> <span class="info-val">HttpOnly Anti-XSS &bull; Double-Submit CSRF &bull; Flyway Checksum &bull; Realtime RBL</span></div>
    <div class="info-row"><span class="info-label">Trạng thái hệ thống:</span> <span class="info-val">100% Hoàn Thành &bull; Đã Đóng Gói Docker Compose Chạy Thực Tế</span></div>
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
      <th style="width: 28%;">Tên tiếng Anh đầy đủ</th>
      <th style="width: 57%;">Mở ngoặc chú thích ý nghĩa tiếng Việt</th>
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
      <td><em>(Tầng máy chủ trung gian phục vụ riêng cho giao diện)</em>: Tầng trung chuyển nằm giữa React và Spring Boot, quản lý phiên cookie, CSRF và định dạng API cho giao diện.</td>
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
      <td><em>(Cơ chế quản lý phiên bản cơ sở dữ liệu tự động)</em>: Công cụ tự động chạy các script SQL theo thứ tự phiên bản (<code>V001</code> &rarr; <code>V005</code>), bảo vệ toàn vẹn qua Checksum.</td>
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
      <td><strong>ACID</strong></td>
      <td>Atomicity, Consistency, Isolation, Durability</td>
      <td><em>(4 thuộc tính bảo đảm toàn vẹn giao dịch cơ sở dữ liệu)</em>: Đảm bảo giao dịch thực thi trọn vẹn, không có hiện tượng lưu dở dang khi xảy ra sự cố mạng.</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- MỤC TRỌNG TÂM: KIẾN TRÚC PHÂN TẦNG VÀ LUỒNG GIAO TIẾP (CÂU HỎI THẦY CÔ) -->
<h1>PHẦN 1: KIẾN TRÚC PHÂN TẦNG &amp; LUỒNG GIAO TIẾP TOÀN HỆ THỐNG</h1>

<div class="callout callout-speech">
  <strong>🎤 TRẢ LỜI CÂU HỎI THẦY CÔ: "HỆ THỐNG CÓ BAO NHIÊU TẦNG VÀ CÁC TẦNG GIAO TIẾP VỚI NHAU NHƯ THẾ NÀO?"</strong><br>
  <em>"Kính thưa Thầy Cô, hệ thống của nhóm được thiết kế theo <strong>Kiến trúc 4 Tầng Vật Lý (4 Tiers)</strong> được đóng gói độc lập trong các Docker Container, và bên trong tầng Core Backend lại được phân thành <strong>3 Lớp Logic (Layered Architecture)</strong> chuẩn công nghiệp: Controller &rarr; Service &rarr; Repository."</em>
</div>

<h2>1. Sơ Đồ Kiến Trúc 4 Tầng &amp; Luồng Giao Tiếp Đa Lớp Bảo Mật</h2>
<img class="diagram-img" src="data:image/png;base64,__ARCH_BASE64__" alt="Sơ Đồ Kiến Trúc 4 Tầng và Luồng Giao Tiếp">

<h2>2. Bảng Mô Tả Chi Tiết 4 Tầng Vật Lý &amp; Trách Nhiệm Kỹ Thuật</h2>
<table>
  <thead>
    <tr>
      <th style="width: 18%;">Tầng Kiến Trúc</th>
      <th style="width: 25%;">Công Nghệ Sử Dụng</th>
      <th style="width: 12%;">Cổng Port</th>
      <th style="width: 45%;">Trách Nhiệm Kỹ Thuật &amp; Cơ Chế Vận Hành</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>Tầng 1: Client / Frontend</strong></td>
      <td>React 18, TypeScript, TailwindCSS, Vite (SPA)</td>
      <td><code>3000</code></td>
      <td>
        &bull; 4 Không gian làm việc chuyên biệt: Coordinator, Participant, Judge, Admin.<br>
        &bull; <strong>Client-side Rubric Percentage Validator:</strong> Kiểm tra tổng trọng số Rubric bắt buộc = 100% trước khi cho phép kích hoạt nút Lưu.<br>
        &bull; <strong>Role-based Route Guard:</strong> Tự động chặn truy cập trái quyền và bắt lỗi màn hình (Safe Fallback).
      </td>
    </tr>
    <tr>
      <td><strong>Tầng 2: Security Gateway / BFF</strong></td>
      <td>Node.js, Express, Axios, Helmet, CORS</td>
      <td><code>4000</code></td>
      <td>
        &bull; <strong>"Tấm khiên an ninh" (Security Shield):</strong> Quản lý Token qua Cookie <code>httpOnly</code>, triệt tiêu 100% nguy cơ tấn công XSS.<br>
        &bull; <strong>Cơ chế Double-Submit CSRF:</strong> Xác minh <code>Cookie == Header</code> cho mọi tác vụ POST/PUT/DELETE.<br>
        &bull; Đóng vai trò Reverse Proxy: Lọc request độc hại, Rate Limiter và chuyển tiếp request vào mạng nội bộ Docker.
      </td>
    </tr>
    <tr>
      <td><strong>Tầng 3: Core Backend</strong></td>
      <td>Spring Boot 3, Java 21, Spring Security 6, Hibernate JPA</td>
      <td><code>8080</code></td>
      <td>
        &bull; <strong>Controller Layer:</strong> Kiểm tra quyền hạn với <code>@PreAuthorize</code> trên từng API Endpoint và kiểm tra tính hợp lệ DTO.<br>
        &bull; <strong>Service Layer:</strong> Xử lý nghiệp vụ lõi, giao dịch <code>@Transactional</code> ACID, thuật toán RBL và Bảng xếp hạng Realtime.<br>
        &bull; <strong>Repository Layer:</strong> Hibernate ORM và HikariCP Connection Pool tối ưu hiệu năng CSDL.<br>
        &bull; <strong>Audit Log:</strong> Tự động ghi vết bất biến hành vi vào bảng <code>audit_log</code>.
      </td>
    </tr>
    <tr>
      <td><strong>Tầng 4: Database Persistence</strong></td>
      <td>PostgreSQL 16.14, Flyway Migration, Docker Volume</td>
      <td><code>5433</code> / <code>5432</code></td>
      <td>
        &bull; Lưu trữ bền vững 21 bảng quan hệ chuẩn hóa 3NF trên Docker Named Volume.<br>
        &bull; Tiến hóa schema tự động từ <code>V1</code> đến <code>V5</code> với kiểm soát mã băm Checksum (CRC32).
      </td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<h2>3. Luồng Giao Tiếp Chi Tiết Của Một Request Thực Tế (Inter-Tier Request Lifecycle)</h2>
<p>
  Khi một thí sinh bấm <strong>"Nộp bài thi"</strong> hoặc Ban tổ chức bấm <strong>"Lưu vòng thi"</strong>, luồng dữ liệu di chuyển tuần tự qua 5 bước nghiêm ngặt:
</p>

<div class="callout callout-info">
  <strong><span class="step-num">B1</span> Giao tiếp Frontend &rarr; BFF Gateway (Port 3000 &rarr; Port 4000):</strong><br>
  Trình duyệt gửi HTTP <code>POST</code> Request qua <code>fetch</code>/<code>axios</code>. Trình duyệt tự động đính kèm Cookie <code>shms_at</code> (Access Token dạng <code>httpOnly</code>). Đồng thời, mã JavaScript đọc cookie <code>XSRF-TOKEN</code> và gắn vào HTTP Header <code>X-XSRF-TOKEN</code> theo cơ chế chống giả mạo request Double-Submit CSRF.
</div>

<div class="callout callout-info">
  <strong><span class="step-num">B2</span> Thẩm định an ninh tại BFF Gateway (Port 4000):</strong><br>
  BFF kiểm tra: Giá trị trong Header <code>X-XSRF-TOKEN</code> có trùng khớp với Cookie <code>XSRF-TOKEN</code> hay không? Nếu hacker gửi request giả mạo từ trang web khác, chính sách <strong>Same-Origin Policy (SOP)</strong> sẽ ngăn không cho website độc hại đọc được cookie để tạo header &rarr; BFF lập tức chặn đứng (Lỗi 403 Forbidden). Tiếp theo, BFF giải mã JWT từ HttpOnly Cookie, trích xuất thông tin người dùng và gắn vào Header nội bộ: <code>Authorization: Bearer &lt;JWT&gt;</code>.
</div>

<div class="callout callout-info">
  <strong><span class="step-num">B3</span> Giao tiếp BFF &rarr; Core Backend (Mạng ảo nội bộ Docker):</strong><br>
  BFF chuyển tiếp request qua mạng nội bộ Docker (<code>http://seal-backend:8080/api/...</code>). Cổng này không được public ra Internet, ngăn chặn hoàn toàn nguy cơ quét cổng hoặc tấn công trực tiếp. Tại Core Backend:
  <ul>
    <li><code>Controller</code>: Xác thực quyền bằng <code>@PreAuthorize("hasRole('COORDINATOR')")</code> và kiểm tra dữ liệu đầu vào (<code>@Valid</code>).</li>
    <li><code>Service</code>: Mở giao dịch <code>@Transactional</code> ACID, kiểm tra hạn chót, tính toán ma trận trọng số và ghi nhật ký <code>audit_log</code>.</li>
    <li><code>Repository</code>: Nhận connection từ <strong>HikariCP Pool</strong> và biên dịch thành câu lệnh SQL tối ưu.</li>
  </ul>
</div>

<div class="callout callout-info">
  <strong><span class="step-num">B4</span> Giao tiếp Core Backend &rarr; Database (Port 5432 TCP/IP):</strong><br>
  Core Backend gửi câu lệnh SQL qua giao thức TCP/IP chuẩn cổng 5432 tới container PostgreSQL. CSDL thực thi ghi bản ghi vào các file dữ liệu nằm trên Docker Named Volume <code>seal_hackathon_postgres_data</code> và trả tập kết quả (Result Set) về cho Backend.
</div>

<div class="callout callout-info">
  <strong><span class="step-num">B5</span> Luồng phản hồi ngược (Response Flow):</strong><br>
  Database trả bản ghi &rarr; Hibernate map vào Entity &rarr; Service chuyển thành DTO &rarr; Controller trả HTTP <code>201 Created</code> (JSON) về BFF &rarr; BFF chuyển tiếp về Frontend &rarr; React cập nhật State và hiển thị Toast thông báo thành công cho người dùng!
</div>

<h2>4. Hai Câu Hỏi Cốt Lõi Về Kiến Trúc Phân Tầng Giúp Đạt Điểm A+</h2>
<div class="callout callout-success">
  <strong>❓ Câu 1: Tại sao nhóm tách riêng tầng BFF mà không để React gọi thẳng vào Spring Boot?</strong><br>
  <em>Trả lời:</em> Nếu React gọi thẳng Spring Boot, React bắt buộc phải lưu JWT trong <code>localStorage</code> của trình duyệt — nơi các đoạn mã JavaScript độc hại (XSS) có thể đánh cắp dễ dàng. Khi có tầng BFF, toàn bộ JWT được cất trong Cookie <code>httpOnly</code>, mã độc JS hoàn toàn bất lực. Hơn nữa, BFF giúp che giấu toàn bộ cấu trúc mạng nội bộ của Spring Boot và giảm tải băng thông nhờ tinh gọn dữ liệu DTO trước khi trả về Client.
</div>

<div class="callout callout-success">
  <strong>❓ Câu 2: Giả sử sau này muốn phát triển ứng dụng Mobile (Flutter / React Native) thì có phải sửa Backend không?</strong><br>
  <em>Trả lời:</em> Hoàn toàn không cần sửa Backend! Nhờ kiến trúc phân tầng lỏng (Loose Coupling) và giao tiếp chuẩn RESTful JSON, toàn bộ tầng Core Backend và Database giữ nguyên 100%. Nhóm chỉ cần xây dựng giao diện Mobile và kết nối vào API là hệ thống hoạt động ngay lập tức.
</div>

<div class="page-break"></div>

<!-- PHẦN 2: TỔNG QUAN DỰ ÁN & TÍNH CẤP THIẾT -->
<h1>PHẦN 2: TỔNG QUAN DỰ ÁN &amp; TÍNH CẤP THIẾT (RBL &amp; IRR)</h1>

<h2>1. Bài Toán Thực Tiễn &amp; Hạn Chế Của Các Cuộc Thi Truyền Thống</h2>
<ul>
  <li><strong>Về mặt quản lý vận hành:</strong> Ban tổ chức phải quản lý hồ sơ thí sinh, chia bảng đấu, thu bài nộp và tính điểm bằng các file Excel rời rạc &rarr; Dễ nhầm lẫn, chậm trễ công bố bảng xếp hạng và không có bằng chứng kiểm toán (Audit Trail) chống gian lận.</li>
  <li><strong>Về mặt học thuật &amp; tính công bằng:</strong> Điểm số phụ thuộc nặng nề vào cảm tính chủ quan của từng giám khảo (người chấm quá dễ dãi, người chấm quá khắt khe) &rarr; Dẫn đến sự bất công cho các đội thi.</li>
</ul>

<h2>2. 3 Điểm Sáng Học Thuật Giúp Đề Tài Đạt Điểm A+ (Không Phải CRUD Đơn Thuần)</h2>
<div class="callout callout-success">
  <strong>🌟 3 Điểm Sáng Vượt Trội Nhóm Cần Nhấn Mạnh Với Thầy Cô:</strong>
  <ul>
    <li><strong>Nghiên Cứu Hiệu Chuẩn Đánh Giá RBL (Rubric-Based Learning):</strong> Áp dụng thuật toán phân tích phương sai ($Mean$, $StdDev$, $Min$, $Max$) để đo lường hệ số tương quan nội nhóm (<strong>ICC / Fleiss' Kappa</strong>), giúp phát hiện và chuẩn hóa thước đo giữa các giám khảo.</li>
    <li><strong>Vòng Hiệu Chuẩn Tiền Chấm Thi (Calibration Round):</strong> Trước khi chấm bài thật, tất cả giám khảo cùng chấm một bài mẫu (Sample Submission) để đo độ đồng thuận và thống nhất góc nhìn. Dữ liệu này được lưu vào bảng riêng <code>calibration_score</code> để không làm ảnh hưởng đến điểm thi thật.</li>
    <li><strong>Tính Xếp Hạng Đa Tiêu Chí Realtime Tự Động:</strong> Tích hợp ma trận trọng số động theo công thức chuẩn hóa:
      <div style="background: #f1f5f9; padding: 7px 12px; border-radius: 6px; font-weight: 700; color: #0f172a; margin: 6px 0; text-align: center; border: 1px solid #cbd5e1;">
        Total Weighted Score = &sum; [ (Score<sub>i</sub> / MaxScore<sub>i</sub>) &times; Weight<sub>i</sub> ]
      </div>
      Ngay khi giám khảo bấm Khóa điểm, hệ thống ngầm kích hoạt thuật toán tính toán và cập nhật bảng xếp hạng tức thì theo thời gian thực (Realtime Ranking).</li>
  </ul>
</div>

<h2>3. Bảng Đối Chiếu Tiến Độ Thực Hiện: ĐÃ HOÀN THÀNH 94% HỆ THỐNG</h2>
<table>
  <thead>
    <tr>
      <th style="width: 25%;">Phân Hệ / Module</th>
      <th style="width: 15%;">Tỷ Lệ Xong</th>
      <th style="width: 35%;">Các Tính Năng Đã Hoàn Thành Thực Tế</th>
      <th style="width: 25%;">Định Hướng Mở Rộng Tương Lai</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Quản Trị &amp; Ban Tổ Chức</strong></td>
      <td><span class="badge badge-success">100% Hoàn Thành</span></td>
      <td>Tạo giải đấu, Tạo bảng đấu, Tạo vòng thi, Thiết lập trọng số Rubric = 100%, Gán giám khảo, Duyệt thí sinh.</td>
      <td>Xuất báo cáo PDF tổng kết giải đấu tự động chỉ với 1 click.</td>
    </tr>
    <tr>
      <td><strong>2. Thí Sinh &amp; Đội Thi</strong></td>
      <td><span class="badge badge-success">100% Hoàn Thành</span></td>
      <td>Tạo đội, Mời thành viên bằng Token, Đăng ký bảng đấu, Nộp link Repo/Demo, Tự động kiểm tra Deadline.</td>
      <td>Tích hợp Chat thời gian thực (WebSocket) giữa các thành viên đội.</td>
    </tr>
    <tr>
      <td><strong>3. Giám Khảo &amp; Đánh Giá</strong></td>
      <td><span class="badge badge-success">100% Hoàn Thành</span></td>
      <td>Chấm điểm theo Rubric, <strong>Vòng chấm hiệu chuẩn Calibration</strong>, Khóa điểm chống sửa, Tra cứu bài nộp.</td>
      <td>Tích hợp AI Webhook tự động chấm trước mã nguồn thí sinh.</td>
    </tr>
    <tr>
      <td><strong>4. Bảng Xếp Hạng &amp; Điểm Số</strong></td>
      <td><span class="badge badge-success">100% Hoàn Thành</span></td>
      <td>Thuật toán chuẩn hóa trọng số, Bảng xếp hạng Realtime tự động cập nhật ngay khi Giám khảo khóa điểm.</td>
      <td>Gửi Email SMTP thông báo chúc mừng thứ hạng tự động.</td>
    </tr>
    <tr>
      <td><strong>5. An Ninh &amp; Dữ Liệu</strong></td>
      <td><span class="badge badge-success">100% Hoàn Thành</span></td>
      <td>Bảo vệ HttpOnly Cookie, Double CSRF Token, Audit Trail bất biến, Flyway Migration tự động từ V1 đến V5.</td>
      <td>Xác thực sinh trắc học hoặc WebAuthn (Passkey).</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- PHẦN 3: CƠ SỞ DỮ LIỆU & FLYWAY MIGRATION -->
<h1>PHẦN 3: CƠ SỞ DỮ LIỆU &amp; FLYWAY MIGRATION</h1>

<h2>1. Bản Chất 3 Cấp Độ Đường Dẫn <code>/var/lib/postgresql/data</code></h2>
<p>Khi Hội đồng hỏi <em>"Dữ liệu của hệ thống lưu ở đâu?"</em>, hãy trình bày rõ ràng 3 cấp độ:</p>

<table>
  <thead>
    <tr>
      <th style="width: 25%;">Cấp độ môi trường</th>
      <th style="width: 40%;">Đường dẫn chính xác</th>
      <th style="width: 35%;">Ý nghĩa kỹ thuật</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Bên trong Docker Container</strong></td>
      <td><code>/var/lib/postgresql/data/pgdata</code></td>
      <td>Đường dẫn tiêu chuẩn của máy chủ Linux PostgreSQL bên trong container <code>seal-postgres</code>.</td>
    </tr>
    <tr>
      <td><strong>2. Docker Named Volume</strong></td>
      <td><code>seal_hackathon_postgres_data</code></td>
      <td>Volume độc lập do Docker Engine quản lý, bảo toàn 100% dữ liệu không bị mất khi restart hay build lại container.</td>
    </tr>
    <tr>
      <td><strong>3. Đường dẫn thật trên Windows (WSL2)</strong></td>
      <td><code>\\\\wsl$\\docker-desktop-data\\data\\docker\\volumes\\seal_hackathon_postgres_data\\_data</code></td>
      <td>Vị trí file vật lý thực tế trên ổ cứng máy host của hệ điều hành Windows qua phân vùng WSL2.</td>
    </tr>
  </tbody>
</table>

<h2>2. Sơ Đồ Kiến Trúc Flyway Migration &amp; Kiểm Soát Checksum</h2>
<img class="diagram-img" src="data:image/jpeg;base64,__FLYWAY_BASE64__" alt="Flyway Migration Architecture Diagram">

<div class="callout callout-info">
  <strong>⚙️ Cơ chế hoạt động của Flyway Migration trong đồ án:</strong><br>
  Khi container <code>seal-backend</code> khởi động, Flyway quét thư mục <code>db/migration</code>. Các file script từ <code>V1</code> đến <code>V5</code> được thực thi tuần tự. Mỗi script sau khi chạy sẽ được tính mã băm <strong>CRC32 Checksum</strong> và ghi vào bảng <code>flyway_schema_history</code>. Nếu lập trình viên tự ý sửa đổi file đã chạy, Checksum sẽ lệch và hệ thống từ chối khởi động &rarr; Chống sửa đè và bảo vệ an toàn tuyệt đối cho cơ sở dữ liệu.
</div>

<h2>3. 6 Câu Lệnh SQL Đối Chiếu Trực Tiếp Trên pgAdmin 4</h2>
<pre><code>-- 1. Kiểm tra lịch sử migration và Checksum Flyway
SELECT installed_rank, version, description, type, script, checksum, success FROM flyway_schema_history;

-- 2. Kiểm tra sự kiện do Ban tổ chức vừa tạo
SELECT id, name, status, current_round, created_at FROM events ORDER BY created_at DESC LIMIT 1;

-- 3. Kiểm tra bộ tiêu chí Rubric (Tổng trọng số = 100%)
SELECT id, name, weight, max_score, round_id FROM evaluation_criteria ORDER BY weight DESC;

-- 4. Kiểm tra đội thi của thí sinh và trạng thái thành viên
SELECT t.id, t.team_name, t.status, tm.role, tm.status as member_status 
FROM teams t JOIN team_members tm ON t.id = tm.team_id ORDER BY t.created_at DESC LIMIT 5;

-- 5. Kiểm tra điểm chấm hiệu chuẩn độc lập (Calibration)
SELECT id, judge_id, submission_id, score, feedback FROM calibration_score ORDER BY created_at DESC;

-- 6. Kiểm tra nhật ký kiểm toán bất biến chống gian lận
SELECT id, actor_id, action, entity_type, entity_id, created_at FROM audit_log ORDER BY created_at DESC LIMIT 5;</code></pre>

<div class="page-break"></div>

<!-- PHẦN 4: KỊCH BẢN LIVE DEMO THEO THỨ TỰ THỜI GIAN CHUẨN -->
<h1>PHẦN 4: KỊCH BẢN LIVE DEMO THEO THỨ TỰ THỜI GIAN CHUẨN (BAN TỔ CHỨC LÊN ĐẦU)</h1>

<div class="callout callout-speech">
  <strong>🎤 LỜI THOẠI TRÌNH DIỄN DEMO:</strong><br>
  <em>"Để phản ánh đúng quy trình thực tế ngoài đời, <strong>nhóm xin phép demo phân hệ Ban Tổ Chức khởi tạo giải đấu lên đầu tiên</strong>, sau đó đến phân hệ Thí sinh đăng ký nộp bài, và cuối cùng là phân hệ Giám khảo chấm thi cùng Bảng xếp hạng Realtime."</em>
</div>

<h2>🟢 GIAI ĐOẠN 1: BAN TỔ CHỨC (COORDINATOR) — KHỞI TẠO CUỘC THI LÊN ĐẦU TIÊN</h2>
<div class="callout callout-info">
  <strong><span class="step-num">1</span> Đăng nhập Ban Tổ Chức:</strong> Truy cập <code>http://localhost:3000/login</code> &rarr; Đăng nhập: <code>coord_demo@seal.edu.vn</code> / <code>Password123!</code>.<br>
  <strong><span class="step-num">2</span> Tạo Sự Kiện Mới:</strong> Vào mục <strong>Quản lý sự kiện</strong> (<code>/coordinator/events</code>) &rarr; Nhấn <strong>Tạo sự kiện mới</strong> &rarr; Nhập tên: <code>DATA RACE 2026</code> &rarr; Bấm <strong>Lưu</strong>.<br>
  <strong><span class="step-num">3</span> Tạo Bảng Đấu (Tracks):</strong> Vào tab <strong>Bảng đấu</strong> &rarr; Thêm bảng: <code>Bảng A - AI &amp; Big Data</code>.<br>
  <strong><span class="step-num">4</span> Tạo Vòng Thi &amp; Ma Trận Rubric 100%:</strong> Vào tab <strong>Vòng thi</strong> &rarr; Nhấn <strong>Thêm vòng thi</strong> &rarr; Nhập: <code>Vòng Chung Kết</code>:
  <ul>
    <li>Tiêu chí 1: <code>KỸ THUẬT &amp; SOURCE CODE</code> (Trọng số: <code>60%</code>, Điểm tối đa: <code>100</code>).</li>
    <li>Tiêu chí 2: <code>TÍNH SÁNG TẠO &amp; ỨNG DỤNG</code> (Trọng số: <code>40%</code>, Điểm tối đa: <code>100</code>).</li>
    <li><em>Lưu ý biểu diễn với Thầy Cô:</em> Nhập thử 36% &rarr; Nút Lưu bị khóa &rarr; Nhập đủ 100% &rarr; Nút Lưu sáng lên để lưu vòng thi.</li>
  </ul>
  <strong><span class="step-num">5</span> Gán Giám Khảo &amp; Công Bố:</strong> Chọn tab <strong>Giám khảo</strong> &rarr; Gán 2 giám khảo vào vòng thi &rarr; Chuyển trạng thái sự kiện sang <code>PUBLISHED</code>.<br>
  <strong><span class="step-num">6</span> Đối chiếu pgAdmin 4:</strong> Chạy câu lệnh kiểm tra sự kiện và bảng tiêu chí vừa được ghi vào CSDL.
</div>

<h2>🟡 GIAI ĐOẠN 2: THÍ SINH (PARTICIPANT) — LẬP ĐỘI &amp; NỘP BÀI DỰ THI</h2>
<div class="callout callout-info">
  <strong><span class="step-num">7</span> Đăng nhập Thí Sinh:</strong> Đăng xuất &rarr; Đăng nhập: <code>thanh.nguyen@student.edu.vn</code> / <code>Password123!</code>.<br>
  <strong><span class="step-num">8</span> Tạo Đội &amp; Mời Bạn:</strong> Vào mục <strong>Đội của tôi</strong> (<code>/teams/my-team</code>) &rarr; Tạo đội <code>DATA_PIONEERS</code> &rarr; Copy mã mời cho bạn vào đội.<br>
  <strong><span class="step-num">9</span> Đăng Ký Cuộc Thi:</strong> Chọn <code>DATA RACE 2026</code> &rarr; Chọn <code>Bảng A - AI &amp; Big Data</code> &rarr; Bấm <strong>Đăng ký tham gia</strong>.<br>
  <strong><span class="step-num">10</span> Nộp Bài Thi (Submission):</strong> Vào trang chi tiết vòng thi &rarr; Bấm <strong>Nộp bài</strong> &rarr; Điền link GitHub Repo và YouTube Demo &rarr; Hệ thống ghi nhận trạng thái nộp bài hợp lệ.
</div>

<h2>🔴 GIAI ĐOẠN 3: GIÁM KHẢO &amp; BẢNG XẾP HẠNG (JUDGE &amp; REALTIME LEADERBOARD)</h2>
<div class="callout callout-info">
  <strong><span class="step-num">11</span> Chấm Hiệu Chuẩn Tiền Chấm Thi (Calibration):</strong> Đăng nhập Giám khảo <code>judge_demo@seal.edu.vn</code> / <code>Password123!</code> &rarr; Vào mục Calibration &rarr; Chấm bài thi mẫu để hệ thống đo hệ số đồng thuận ICC/Kappa &rarr; Dữ liệu lưu vào <code>calibration_score</code>.<br>
  <strong><span class="step-num">12</span> Chấm Điểm Bài Thi Chính Thức:</strong> Vào mục <strong>Chấm điểm</strong> &rarr; Chọn bài thi của đội <code>DATA_PIONEERS</code> &rarr; Chấm 2 tiêu chí Rubric (90 điểm Kỹ thuật, 85 điểm Sáng tạo) &rarr; Bấm <strong>Khóa điểm (Finalize Score)</strong>.<br>
  <strong><span class="step-num">13</span> Tra Cứu Bảng Xếp Hạng Realtime:</strong> Mở trang <code>/leaderboard</code> &rarr; Đội <code>DATA_PIONEERS</code> nhảy lên dẫn đầu bảng xếp hạng theo công thức chuẩn hóa trọng số.<br>
  <strong><span class="step-num">14</span> Chứng Minh Nhật Ký Kiểm Toán (Audit Trail):</strong> Mở pgAdmin 4 chạy câu lệnh kiểm tra bảng <code>audit_log</code> &rarr; Chỉ ra dòng ghi vết hành vi khóa điểm của giám khảo.
</div>

<div class="page-break"></div>

<!-- PHẦN 5: BỘ CÂU HỎI TRỌNG YẾU HỘI ĐỒNG PHẢN BIỆN -->
<h1>PHẦN 5: BỘ CÂU HỎI TRỌNG YẾU HỘI ĐỒNG PHẢN BIỆN &amp; LỜI ĐÁP ĐẠT ĐIỂM 10</h1>

<div class="callout callout-info">
  <strong>Câu 1: Điểm sáng nghiên cứu học thuật của đề tài là gì, có gì phức tạp hơn một bài toán CRUD thông thường?</strong><br>
  <em>Trả lời:</em> Đề tài giải quyết bài toán cốt lõi về <strong>Độ tin cậy của đánh giá viên (Inter-Rater Reliability — IRR)</strong> thông qua phương pháp <strong>Rubric-Based Learning (RBL)</strong>. Hệ thống giải quyết sự thiên vị cảm tính của giám khảo bằng 2 cơ chế: (1) Vòng hiệu chuẩn tiền chấm thi (Calibration Round) đo lường hệ số tương quan nội nhóm ICC/Kappa; và (2) Ma trận tính điểm đa tiêu chí chuẩn hóa tự động tính điểm theo thời gian thực (Realtime Weighted Score). Dữ liệu hiệu chuẩn được tách riêng vào bảng <code>calibration_score</code> để phân tích chuyên sâu.
</div>

<div class="callout callout-info">
  <strong>Câu 2: Tại sao nhóm tách riêng tầng BFF mà không để Frontend gọi trực tiếp vào Spring Boot?</strong><br>
  <em>Trả lời:</em> Tầng BFF (Backend-For-Frontend) đóng vai trò là "Lớp khiên bảo mật an ninh trung gian". Việc tách BFF mang lại 3 lợi thế vượt trội: (1) Quản lý phiên qua Cookie <code>httpOnly</code> triệt tiêu 100% nguy cơ tấn công XSS; (2) Thực thi cơ chế CSRF Double-Submit Token; và (3) Đóng gói, tinh gọn dữ liệu DTO trước khi trả về trình duyệt, giảm tải băng thông mạng và che giấu hoàn toàn cấu trúc mạng nội bộ của Core Backend.
</div>

<div class="callout callout-info">
  <strong>Câu 3: Cơ chế Flyway Migration bảo vệ cơ sở dữ liệu như thế nào khi triển khai thực tế?</strong><br>
  <em>Trả lời:</em> Flyway tự động hóa hoàn toàn việc cập nhật cấu trúc bảng theo các phiên bản từ <code>V1</code> đến <code>V5</code>. Mỗi file script SQL đều được tính toán mã băm Checksum (CRC32). Nếu một file SQL đã được áp dụng trong quá khứ bị sửa đổi nội dung, Flyway sẽ phát hiện Checksum không khớp và lập tức khóa quá trình khởi động để ngăn ngừa sai lệch dữ liệu.
</div>

<div class="callout callout-info">
  <strong>Câu 4: Bảng <code>audit_log</code> bảo vệ hệ thống trước sự cố gian lận như thế nào?</strong><br>
  <em>Trả lời:</em> Mọi thao tác thay đổi trạng thái (Duyệt tài khoản, Nộp bài, Sửa điểm, Khóa điểm, Loại đội thi) đều tự động ghi lại Actor, Action, Entity, Timestamp và IP vào bảng <code>audit_log</code>. Hệ thống không cung cấp bất kỳ API nào để cập nhật hay xóa bảng này (Append-only trail), đảm bảo tính minh bạch, khách quan và chống chối bỏ trách nhiệm.
</div>

<div class="callout callout-info">
  <strong>Câu 5: Tại sao khi tạo vòng thi trên giao diện, tổng trọng số các tiêu chí bắt buộc phải bằng 100%?</strong><br>
  <em>Trả lời:</em> Theo nguyên tắc của phương pháp Rubric-Based Learning (RBL), tổng trọng số đại diện cho 100% năng lực toàn diện của bài thi. Nếu tổng trọng số khác 100% (ví dụ chỉ 36%), công thức chuẩn hóa ma trận điểm sẽ bị sai lệch tỷ lệ. Giao diện Frontend tự động kiểm tra realtime và khóa nút lưu nếu chưa đủ 100% để bảo vệ tính toàn vẹn toán học của giải đấu ngay từ tầng client.
</div>

<div style="margin-top: 25px; text-align: center; border-top: 1px solid #cbd5e1; padding-top: 12px; color: #64748b; font-size: 11px;">
  <em>Tài liệu được biên soạn phục vụ Lễ Bảo Vệ Khóa Luận Tốt Nghiệp Chuyên Ngành Kỹ Thuật Phần Mềm &mdash; Hệ Thống SEAL Hackathon 2026 &bull; Điểm Tối Đa A+</em>
</div>

</body>
</html>
""".replace("__ARCH_BASE64__", arch_base64).replace("__FLYWAY_BASE64__", flyway_base64)

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
