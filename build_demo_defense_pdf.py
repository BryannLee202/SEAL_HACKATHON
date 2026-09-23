import base64
import subprocess
import os

html_path = r"C:\SEAL_HACKATHON\BAO_CAO_THUYET_TRINH_DEMO_KHOA_LUAN.html"
pdf_path = r"C:\SEAL_HACKATHON\BAO_CAO_THUYET_TRINH_DEMO_KHOA_LUAN.pdf"
img_path = r"C:\SEAL_HACKATHON\flyway_diagram.jpg"

img_base64 = ""
if os.path.exists(img_path):
    with open(img_path, "rb") as f:
        img_base64 = base64.b64encode(f.read()).decode("utf-8")

html_content = """<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<title>Cẩm Nang Thuyết Trình &amp; Kịch Bản Demo Khóa Luận Tốt Nghiệp — SEAL Hackathon</title>
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
  
  /* Bìa Đồ Án */
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
    font-size: 14px;
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
    font-size: 16px;
    color: #0369a1;
    border-bottom: 2px solid #0284c7;
    padding-bottom: 5px;
    margin-top: 20px;
    margin-bottom: 10px;
    text-transform: uppercase;
    page-break-after: avoid;
  }
  h2 {
    font-size: 13.5px;
    color: #0f172a;
    margin-top: 14px;
    margin-bottom: 7px;
    border-left: 4px solid #0284c7;
    padding-left: 8px;
    page-break-after: avoid;
  }
  h3 {
    font-size: 12.5px;
    color: #334155;
    margin-top: 10px;
    margin-bottom: 5px;
    page-break-after: avoid;
  }
  
  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 9px 0;
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
    padding: 9px 12px;
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
    width: 20px;
    height: 20px;
    text-align: center;
    line-height: 20px;
    font-size: 11px;
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
    <div class="badge-thesis">CẨM NANG THUYẾT TRÌNH &amp; KỊCH BẢN DEMO ĐỒ ÁN TỐT NGHIỆP</div>
    
    <div class="project-title">HỆ THỐNG QUẢN LÝ CUỘC THI HACKATHON &amp; NGHIÊN CỨU ĐỘ TIN CẬY ĐÁNH GIÁ VIÊN</div>
    <div class="project-sub">SEAL HACKATHON MANAGEMENT SYSTEM (SHMS) — CHIẾN LƯỢC ĐẠT ĐIỂM TỐI ĐA (A+)</div>
  </div>

  <div class="info-box">
    <div class="info-row"><span class="info-label">Đề tài:</span> <span class="info-val">Hệ thống Quản lý Hackathon &amp; Nghiên cứu RBL / IRR</span></div>
    <div class="info-row"><span class="info-label">Chuyên ngành:</span> <span class="info-val">Kỹ thuật Phần mềm (Software Engineering)</span></div>
    <div class="info-row"><span class="info-label">Sinh viên bảo vệ:</span> <span class="info-val">Nhóm Đề Tài Tốt Nghiệp SEAL</span></div>
    <div class="info-row"><span class="info-label">Cấu trúc công nghệ:</span> <span class="info-val">React 18 &bull; Express (BFF) &bull; Spring Boot 3 &bull; PostgreSQL 16</span></div>
    <div class="info-row"><span class="info-label">Quy trình trình bày:</span> <span class="info-val">FE (Giao diện) &rarr; BE (Bảo mật &amp; Lõi) &rarr; Tiến độ &rarr; DB &rarr; Live Demo</span></div>
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
      <td><strong>API</strong></td>
      <td>Application Programming Interface</td>
      <td><em>(Giao diện lập trình ứng dụng / Cổng trao đổi dữ liệu)</em>: Cầu nối truyền nhận dữ liệu JSON giữa Frontend và Backend thông qua HTTP methods.</td>
    </tr>
  </tbody>
</table>

<div class="page-break"></div>

<!-- PHẦN 1: MỞ ĐẦU THUYẾT TRÌNH - GIỚI THIỆU TỔNG QUAN QUA FRONTEND -->
<h1>PHẦN 1: MỞ ĐẦU THUYẾT TRÌNH — GIỚI THIỆU TỔNG QUAN QUA GIAO DIỆN FRONTEND (UX/UI)</h1>

<div class="callout callout-speech">
  <strong>🎤 LỜI THOẠI MỞ ĐẦU KHI BƯỚC LÊN BỤC BẢO VỆ (GÂY ẤN TƯỢNG MẠNH VỚI HỘI ĐỒNG):</strong><br>
  <em>"Kính thưa quý Thầy Cô trong Hội đồng phản biện, đề tài của nhóm chúng em là <strong>Hệ Thống Quản Lý Cuộc Thi Hackathon &amp; Nghiên Cứu Độ Tin Cậy Đánh Giá Viên (SEAL Hackathon)</strong>.<br>
  Để giúp Thầy Cô có cái nhìn trực quan và sinh động nhất ngay từ giây phút đầu tiên, nhóm xin phép mở đầu bài thuyết trình bằng việc dẫn dắt Thầy Cô trực tiếp qua không gian giao diện người dùng (Frontend), khám phá cách các tác nhân tương tác với hệ thống, sau đó nhóm sẽ trình bày kiến trúc Backend bảo mật phía sau, rồi đi sâu vào phân tích đối chiếu tiến độ, cơ sở dữ liệu và kịch bản demo thực tế."</em>
</div>

<h2>1. Trải Nghiệm Giao Diện Người Dùng (Frontend UX/UI) Theo 4 Nhóm Vai Trò</h2>
<p>
  Giao diện Frontend được thiết kế theo tư duy <strong>Cyber IT Editorial</strong> hiện đại, trực quan, phân quyền chặt chẽ theo 4 không gian làm việc chuyên biệt:
</p>

<table>
  <thead>
    <tr>
      <th style="width: 22%;">Không Gian Giao Diện</th>
      <th style="width: 38%;">Chức Năng &amp; Màn Hình Nổi Bật</th>
      <th style="width: 40%;">Trải Nghiệm UX &amp; Logic Client Tương Tác</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Ban Tổ Chức<br>(Coordinator Portal)</strong></td>
      <td>
        &bull; <code>/coordinator/events</code>: Bảng điều khiển quản lý toàn bộ các giải đấu.<br>
        &bull; Modal Khởi tạo giải đấu, Bảng đấu (Tracks) và Vòng thi (Rounds).<br>
        &bull; Phân bổ Giám khảo vào từng vòng thi cụ thể.
      </td>
      <td>
        <strong>Dynamic Rubric Validator:</strong> Khi tạo vòng thi, giao diện tính toán realtime tổng trọng số các tiêu chí. Nếu chưa đủ <strong>100%</strong> (ví dụ 36%), hệ thống hiển thị gợi ý màu hổ phách và khóa nút Lưu để bảo vệ tính toàn vẹn toán học.
      </td>
    </tr>
    <tr>
      <td><strong>2. Thí Sinh<br>(Participant Portal)</strong></td>
      <td>
        &bull; <code>/teams</code> &amp; <code>/teams/my-team</code>: Khởi tạo đội thi và nhận mã mời.<br>
        &bull; Cổng nộp bài (Submission Modal): Nhập link GitHub Repo &amp; Video demo.<br>
        &bull; Cổng tra cứu Bảng xếp hạng Realtime.
      </td>
      <td>
        <strong>Auto Status Guard &amp; Deadline Check:</strong> Tự động chặn thao tác nộp bài khi vòng thi đã đóng, hiển thị trạng thái duyệt thành viên mượt mà, phản hồi Toast thông minh.
      </td>
    </tr>
    <tr>
      <td><strong>3. Giám Khảo<br>(Judge Portal)</strong></td>
      <td>
        &bull; <code>/judge/evaluations</code>: Danh sách các bài nộp được phân công.<br>
        &bull; <code>/judge/calibration</code>: <strong>Màn hình chấm hiệu chuẩn tiền chấm thi (Calibration Round)</strong>.<br>
        &bull; Màn hình chấm điểm Rubric đa tiêu chí và Khóa điểm (Finalize Score).
      </td>
      <td>
        <strong>Interactive Rubric Sliders:</strong> Thanh trượt điểm số theo thang điểm quy định, nhập nhận xét chi tiết, cảnh báo xác nhận trước khi Khóa điểm chống sửa đổi ngoài ý muốn.
      </td>
    </tr>
    <tr>
      <td><strong>4. Quản Trị Viên<br>(Admin Portal)</strong></td>
      <td>
        &bull; <code>/admin/users</code>: Duyệt nhanh tài khoản đăng ký mới.<br>
        &bull; <code>/admin/audit-logs</code>: Nhật ký kiểm toán an ninh toàn hệ thống.
      </td>
      <td>
        <strong>Realtime Audit Trail:</strong> Giao diện hiển thị tức thì hành vi của từng user (ai duyệt ai, ai nộp bài, ai chấm điểm) theo chuẩn truy vết điều tra số.
      </td>
    </tr>
  </tbody>
</table>

<h2>2. Công Nghệ &amp; Cơ Chế Tối Ưu Hóa Tầng Frontend (Client Layer)</h2>
<ul>
  <li><strong>Công Nghệ Sử Dụng:</strong> React 18, TypeScript, TailwindCSS, Vite, Lucide Icons, Headless UI (chạy trên cổng <code>3000</code>).</li>
  <li><strong>Cơ Chế Bảo Vệ Điều Hướng (Route Guard):</strong> Áp dụng <code>ProtectedRoute</code> kiểm tra JWT Claims và phân quyền Role-Based Access Control ngay tại Client; người dùng không thể truy cập trái phép bằng cách sửa URL.</li>
  <li><strong>Cơ Chế Safe Fallback:</strong> Toàn bộ các Component giao diện đều có cơ chế bọc <code>ErrorBoundary</code> và Safe Fallback State, loại bỏ hoàn toàn hiện tượng màn hình trắng (White Screen of Death) khi dữ liệu mạng gặp độ trễ.</li>
  <li><strong>Hỗ Trợ Song Ngữ (i18n) &amp; Dark/Light Mode:</strong> Chuyển đổi ngôn ngữ Tiếng Việt &mdash; Tiếng Anh và giao diện Sáng &mdash; Tối chỉ với 1 click chuột.</li>
</ul>

<div class="page-break"></div>

<!-- PHẦN 2: TẦNG NỀN TẢNG XỬ LÝ & BẢO MẬT BACKEND -->
<h1>PHẦN 2: TẦNG NỀN TẢNG XỬ LÝ &amp; BẢO MẬT BACKEND (BFF GATEWAY + CORE BACKEND)</h1>

<div class="callout callout-speech">
  <strong>🎤 LỜI THOẠI CHUYỂN TIẾP SANG BACKEND:</strong><br>
  <em>"Kính thưa Thầy Cô, để vận hành và bảo vệ trọn vẹn toàn bộ trải nghiệm người dùng trên Frontend vừa trình bày, hệ thống sử dụng kiến trúc Backend đa tầng chuyên biệt gồm: <strong>Tầng bảo mật trung gian BFF (Backend-For-Frontend)</strong> và <strong>Tầng máy chủ nghiệp vụ lõi Core Backend</strong>."</em>
</div>

<h2>1. Sơ Đồ Kiến Trúc 2 Tầng Backend Chuyên Biệt</h2>
<table>
  <thead>
    <tr>
      <th style="width: 25%;">Tầng Kiến Trúc</th>
      <th style="width: 25%;">Công Nghệ Sử Dụng</th>
      <th style="width: 50%;">Nhiệm Vụ Kỹ Thuật &amp; Cơ Chế Vận Hành</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td><strong>1. Gateway BFF<br>(Lớp Khiên An Ninh)</strong></td>
      <td>Node.js, Express, Axios, Helmet, CORS (Cổng 4000)</td>
      <td>
        &bull; Quản lý Token phiên làm việc hoàn toàn qua Cookie <code>httpOnly</code> (`shms_at`, `shms_rt`), <strong>chống triệt để tấn công XSS</strong>.<br>
        &bull; Triển khai cơ chế <strong>Double-Submit CSRF Cookie</strong> bảo vệ mọi tác vụ POST/PUT/DELETE.<br>
        &bull; Đóng vai trò Reverse Proxy: Tiếp nhận request từ React, chuẩn hóa DTO, kiểm tra Rate Limit và chuyển tiếp an toàn vào Core Backend.
      </td>
    </tr>
    <tr>
      <td><strong>2. Core Backend<br>(Động Cơ Nghiệp Vụ Lõi)</strong></td>
      <td>Spring Boot 3, Java 21, Spring Security 6, Hibernate JPA (Cổng 8080)</td>
      <td>
        &bull; Quản lý 21 thực thể quan hệ (Entities), đảm bảo tính toàn vẹn dữ liệu chuẩn giao dịch ACID.<br>
        &bull; Thuật toán phân tích RBL và tính toán ma trận điểm đa tiêu chí thời gian thực.<br>
        &bull; Phân quyền đầu cuối nghiêm ngặt với <code>@PreAuthorize</code> trên từng API Endpoint.<br>
        &bull; Tự động ghi nhận nhật ký kiểm toán bất biến vào bảng <code>audit_log</code>.<br>
        &bull; Tối ưu hóa truy vấn cơ sở dữ liệu qua HikariCP Connection Pool.
      </td>
    </tr>
  </tbody>
</table>

<h2>2. Cơ Chế Bảo Mật Đỉnh Cao: Chống XSS &amp; Chống CSRF Double-Submit</h2>
<div class="callout callout-info">
  <strong>🛡️ Vì sao hệ thống không thể bị tấn công chiếm phiên làm việc?</strong><br>
  1. <strong>Chống XSS (Cross-Site Scripting):</strong> Hệ thống tuyệt đối không lưu JWT trong <code>localStorage</code> (nơi các đoạn mã JavaScript độc hại dễ dàng đọc trộm). JWT được đóng gói trong Cookie với cờ <code>httpOnly = true</code> và <code>SameSite = Strict</code> &rarr; Mã độc JavaScript trên trình duyệt hoàn toàn không thể truy cập.<br>
  2. <strong>Chống CSRF (Cross-Site Request Forgery):</strong> Tầng BFF triển khai kỹ thuật Double-Submit Token. Khi người dùng đăng nhập, hệ thống sinh token ngẫu nhiên và gửi về qua cookie <code>XSRF-TOKEN</code>. Với các request thay đổi trạng thái, Frontend đọc cookie này và gửi kèm trong Header <code>X-XSRF-TOKEN</code>. BFF so sánh: nếu <code>Cookie == Header</code> thì mới cho phép xử lý. Kẻ tấn công từ website bên ngoài bị chính sách <strong>Same-Origin Policy (SOP)</strong> của trình duyệt chặn lại nên không thể đọc trộm cookie để tạo header giả mạo!
</div>

<div class="page-break"></div>

<!-- PHẦN 3: ĐI SÂU VÀO ĐỐI CHIẾU TIẾN ĐỘ -->
<h1>PHẦN 3: ĐI SÂU VÀO ĐỐI CHIẾU TIẾN ĐỘ — LÀM ĐƯỢC GÌ &amp; CHƯA LÀM GÌ</h1>

<div class="callout callout-speech">
  <strong>🎤 LỜI THOẠI CHUYỂN TIẾP ĐI SÂU VÀO ĐÁNH GIÁ KẾT QUẢ:</strong><br>
  <em>"Sau khi đã đi qua bức tranh toàn cảnh từ giao diện người dùng Frontend đến động cơ bảo mật Backend, nhóm xin đi sâu vào phân tích đối chiếu những gì đồ án đã làm được, 3 điểm sáng nghiên cứu học thuật giúp đề tài đạt điểm tối đa, và định hướng phát triển mở rộng trong tương lai."</em>
</div>

<h2>1. Tỷ Lệ Hoàn Thành: ĐẠT 94% TOÀN DIỆN HỆ THỐNG</h2>
<p>Hệ thống đã hoàn thiện xuất sắc toàn bộ các phân hệ nghiệp vụ cốt lõi theo tiêu chuẩn SRS của một đồ án tốt nghiệp chuyên ngành Kỹ thuật Phần mềm:</p>

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

<div class="page-break"></div>

<!-- PHẦN 4: ĐI SÂU VÀO CƠ SỞ DỮ LIỆU & FLYWAY MIGRATION -->
<h1>PHẦN 4: ĐI SÂU VÀO CƠ SỞ DỮ LIỆU &amp; FLYWAY MIGRATION</h1>

<div class="callout callout-speech">
  <strong>🎤 LỜI THOẠI CHUYỂN TIẾP SANG DATABASE:</strong><br>
  <em>"Kính thưa Thầy Cô, sau đây nhóm xin đi sâu vào trái tim lưu trữ của hệ thống: Cơ sở dữ liệu quan hệ chuẩn 3NF và kiến trúc tiến hóa schema tự động qua Flyway Migration có kiểm soát Checksum."</em>
</div>

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
      <td><code>\\wsl$\docker-desktop-data\data\docker\volumes\seal_hackathon_postgres_data\_data</code></td>
      <td>Vị trí file vật lý thực tế trên ổ cứng máy host của hệ điều hành Windows qua phân vùng WSL2.</td>
    </tr>
  </tbody>
</table>

<h2>2. Sơ Đồ Kiến Trúc Flyway Migration &amp; Kiểm Soát Checksum</h2>
<img class="diagram-img" src="data:image/jpeg;base64,__IMG_BASE64__" alt="Flyway Migration Diagram">

<div class="callout callout-info">
  <strong>⚙️ Cơ chế hoạt động của Flyway Migration trong đồ án:</strong><br>
  Khi container <code>seal-backend</code> khởi động, Flyway quét thư mục <code>db/migration</code>. Các file script từ <code>V1</code> đến <code>V5</code> được thực thi tuần tự. Mỗi script sau khi chạy sẽ được tính mã băm băm <strong>CRC32 Checksum</strong> và ghi vào bảng <code>flyway_schema_history</code>. Nếu lập trình viên tự ý sửa đổi file đã chạy, Checksum sẽ lệch và hệ thống từ chối khởi động &rarr; Chống sửa đè và bảo vệ an toàn tuyệt đối cho cơ sở dữ liệu.
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

<!-- PHẦN 5: KỊCH BẢN LIVE DEMO THEO THỨ TỰ THỜI GIAN CHUẨN -->
<h1>PHẦN 5: KỊCH BẢN LIVE DEMO THEO THỨ TỰ THỜI GIAN CHUẨN (BAN TỔ CHỨC LÊN ĐẦU)</h1>

<div class="callout callout-speech">
  <strong>🎤 LỜI THOẠI BƯỚC VÀO TRÌNH DIỄN DEMO THỰC TẾ:</strong><br>
  <em>"Kính thưa Thầy Cô, sau đây nhóm xin phép bắt đầu phần trình diễn Live Demo thực tế toàn bộ vòng đời của một cuộc thi Hackathon. Để phản ánh đúng quy trình thực tế ngoài đời, <strong>nhóm xin phép demo phân hệ Ban Tổ Chức khởi tạo giải đấu lên đầu tiên</strong>, sau đó đến phân hệ Thí sinh đăng ký nộp bài, và cuối cùng là phân hệ Giám khảo chấm thi cùng Bảng xếp hạng Realtime."</em>
</div>

<h2>🟢 GIAI ĐOẠN 1: BAN TỔ CHỨC (COORDINATOR) — KHỞI TẠO CUỘC THI LÊN ĐẦU TIÊN</h2>
<div class="callout callout-info">
  <strong><span class="step-num">1</span> Đăng nhập Ban Tổ Chức:</strong> Truy cập <code>http://localhost:3000/login</code> &rarr; Đăng nhập bằng tài khoản: <code>coord_demo@seal.edu.vn</code> / <code>Password123!</code>.<br>
  <strong><span class="step-num">2</span> Tạo Sự Kiện Mới:</strong> Vào mục <strong>Quản lý sự kiện</strong> (<code>/coordinator/events</code>) &rarr; Nhấn nút <strong>Tạo sự kiện mới</strong> &rarr; Nhập tên: <code>DATA RACE 2026</code> &rarr; Chọn thời gian &rarr; Bấm <strong>Lưu</strong>.<br>
  <strong><span class="step-num">3</span> Tạo Bảng Đấu (Tracks):</strong> Vào tab <strong>Bảng đấu</strong> &rarr; Thêm bảng: <code>Bảng A - AI &amp; Big Data</code>.<br>
  <strong><span class="step-num">4</span> Tạo Vòng Thi &amp; Ma Trận Rubric 100%:</strong> Vào tab <strong>Vòng thi</strong> &rarr; Nhấn <strong>Thêm vòng thi</strong> &rarr; Nhập tên: <code>Vòng Chung Kết</code>:
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
  <strong><span class="step-num">7</span> Đăng nhập Thí Sinh:</strong> Đăng xuất &rarr; Đăng nhập tài khoản thí sinh: <code>thanh.nguyen@student.edu.vn</code> / <code>Password123!</code>.<br>
  <strong><span class="step-num">8</span> Tạo Đội &amp; Mời Bạn:</strong> Vào mục <strong>Đội của tôi</strong> (<code>/teams/my-team</code>) &rarr; Tạo đội <code>DATA_PIONEERS</code> &rarr; Copy mã mời cho đồng đội vào đội.<br>
  <strong><span class="step-num">9</span> Đăng Ký Cuộc Thi:</strong> Vào danh sách sự kiện &rarr; Chọn <code>DATA RACE 2026</code> vừa tạo ở Giai đoạn 1 &rarr; Chọn <code>Bảng A - AI &amp; Big Data</code> &rarr; Bấm <strong>Đăng ký tham gia</strong>.<br>
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

<!-- PHẦN 6: BỘ CÂU HỎI TRỌNG YẾU HỘI ĐỒNG PHẢN BIỆN -->
<h1>PHẦN 6: BỘ CÂU HỎI TRỌNG YẾU HỘI ĐỒNG PHẢN BIỆN &amp; LỜI ĐÁP ĐẠT ĐIỂM 10</h1>

<div class="callout callout-info">
  <strong>Câu 1: Điểm sáng nghiên cứu học thuật của đề tài là gì, có gì phức tạp hơn một bài toán CRUD thông thường?</strong><br>
  <em>Trả lời tự tin:</em> Thưa Thầy Cô, đề tài của nhóm tập trung giải quyết bài toán cốt lõi về <strong>Độ tin cậy của đánh giá viên (Inter-Rater Reliability — IRR)</strong> thông qua phương pháp <strong>Rubric-Based Learning (RBL)</strong>. Hệ thống giải quyết sự thiên vị cảm tính của giám khảo bằng 2 cơ chế: (1) Vòng hiệu chuẩn tiền chấm thi (Calibration Round) đo lường hệ số tương quan nội nhóm ICC/Kappa; và (2) Ma trận tính điểm đa tiêu chí chuẩn hóa tự động tính điểm theo thời gian thực (Realtime Weighted Score). Dữ liệu hiệu chuẩn được tách riêng vào bảng <code>calibration_score</code> để phân tích chuyên sâu.
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
""".replace("__IMG_BASE64__", img_base64)

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
