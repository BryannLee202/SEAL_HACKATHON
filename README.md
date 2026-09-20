# SEAL Hackathon Management System (SHMS)

<div align="center">

![SEAL Hackathon Logo](./frontend/public/seal-logo-mark.png)

**Nền Tảng Quản Lý, Chấm Thi Chuyên Môn Đa Tiêu Chí & Nghiên Cứu Đánh Giá (RBL) Toàn Diện**

[![CI / Build Status](https://img.shields.io/badge/Build-Passing-10b981?style=for-the-badge&logo=github-actions)](https://github.com/BryannLee202/SEAL_HACKATHON)
[![Frontend Tests](https://img.shields.io/badge/Frontend%20Tests-101%2F101%20Pass%20(100%25)-10b981?style=for-the-badge&logo=vitest)](./frontend)
[![Backend Tests](https://img.shields.io/badge/Backend%20Tests-98%20Pass%20(100%25)-10b981?style=for-the-badge&logo=junit5)](./backend)
[![Docker Support](https://img.shields.io/badge/Docker%20Compose-Ready-38bdf8?style=for-the-badge&logo=docker)](./docker-compose.yml)
[![Architecture](https://img.shields.io/badge/Architecture-3--Tier%20BFF-bc7155?style=for-the-badge)](./docs/03-architecture)

[Tổng Quan](#-tổng-quan-dự-án) • [Kiến Trúc](#-kiến-trúc-hệ-thống) • [Tính Năng Nổi Bật](#-tính-năng-nổi-bật) • [Cài Đặt & Khởi Động](#-hướng-dẫn-cài-đặt--khởi-động-1-click) • [Tài Khoản Mẫu](#-tài-khoản-demo-sẵn-có) • [Kịch Bản Thuyết Trình](#-kịch-bản-demo--bảo-vệ) • [Đội Ngũ](#-phân-công-phát-triển)

</div>

---

## 📖 Tổng Quan Dự Án

**SEAL Hackathon Management System (SHMS)** là hệ thống phần mềm cấp doanh nghiệp được thiết kế chuyên biệt nhằm số hóa, chuẩn hóa và tự động hóa toàn bộ quy trình tổ chức cuộc thi lập trình công nghệ (Hackathon) từ giai đoạn phát động, đăng ký đội thi, nộp bài dự thi Git repo, phân công giám khảo, chấm điểm tiêu chuẩn hóa đa tiêu chí có trọng số (Rubric-Based Assessment), đến bình chọn khán giả trực tiếp và vinh danh trao giải.

Đặc biệt, hệ thống tích hợp phân hệ **Nghiên Cứu Hiệu Chuẩn Đánh Giá (RBL - Rubric-Based Learning / Inter-Rater Reliability)**, thu thập phân phối điểm số và tính toán phương sai liên đánh giá viên phục vụ đánh giá tính công bằng và nhất quán của hội đồng chuyên môn.

### 🎯 Mục Tiêu Cốt Lõi
- **Minh bạch & Bất biến**: Mọi hành vi chấm điểm, hiệu chuẩn, thăng hạng và xử lý vi phạm đều được ghi nhận vào **Audit Log** không thể chỉnh sửa.
- **Bảo mật Đa lớp**: Áp dụng mô hình bảo mật **BFF (Backend-For-Frontend)** với cookie `httpOnly`, chống rò rỉ JWT token qua JavaScript (XSS) và phòng thủ tấn công CSRF hai chiều (`Double Submit Cookie`).
- **Trải nghiệm Đỉnh cao**: Giao diện mang đậm phong cách **Cyber Tech / IT Editorial**, tích hợp **Linh vật 3D tương tác (SEAL Robotic Mascot)** bay lượn và hiệu ứng hoạt họa mượt mà.

---

## 🏛️ Kiến Trúc Hệ Thống

Hệ thống được thiết kế theo mô hình **3-Tier Architecture tách biệt nghiêm ngặt**, triển khai độc lập thông qua Docker Compose:

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          CLIENT LAYER (Browser)                         │
│   React 19 + TypeScript + Vite + Tailwind/Vanilla CSS (Port 3000/3001)  │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Cookie (httpOnly: shms_at, shms_rt)
                                     │ Header: X-XSRF-TOKEN
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                    BFF LAYER (Backend-For-Frontend)                     │
│                 NestJS / Node.js Reverse Proxy (Port 4000)              │
│   - Quản lý phiên làm việc & refresh token tự động                      │
│   - Xử lý Cookie httpOnly bảo mật, che giấu cấu trúc Spring Boot       │
│   - Validate CSRF token & CORS Policy nghiêm ngặt                       │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ Authorization: Bearer <JWT>
                                     │ Internal Network
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         CORE BACKEND SERVICES                           │
│                      Spring Boot 3 + Java 21 (Port 8080)                │
│   - Spring Security 6 + JJWT Filter                                     │
│   - 29 Business Services + 24 REST Controllers                          │
│   - Flyway Database Migration (V1 → V6)                                 │
│   - Thuật toán tính điểm Rubric có trọng số & Phân tích RBL Variance    │
└────────────────────────────────────┬────────────────────────────────────┘
                                     │ JDBC / Connection Pooling
                                     ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                            DATABASE LAYER                               │
│                         PostgreSQL 16 (Port 5432)                       │
│   - 21 Quan hệ thực thể (Relational Schema)                             │
│   - Toàn vẹn tham chiếu & Ràng buộc Audit Log bất biến                  │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## ✨ Tính Năng Nổi Bật

| Phân hệ | Mô tả chức năng chi tiết |
|---|---|
| **🌐 Cổng Thông Tin Công Khai** | Landing Page phong cách Cyber Arena, giới thiệu cơ cấu giải thưởng 20Tr+, đơn vị đồng hành (FPT Software, GDSC, SEAL Lab), và linh vật 3D bay lượn khí động học. |
| **🤖 Trợ Lý Ảo AI SEAL Bot** | Drawer trợ lý AI thông minh toàn hệ thống (`MascotChatDrawer`), phản hồi thời gian thực về thể lệ, bộ tiêu chí, phân tích RBL và gợi ý câu hỏi mẫu. |
| **🌐 Song Ngữ Quốc Tế (i18n)** | Chuyển đổi ngôn ngữ tức thì giữa **Tiếng Việt (🇻🇳)** và **English (🇬🇧)** trên toàn bộ Landing Page, Auth Hero, Login, Register, Bảng xếp hạng và Bình chọn. |
| **🌓 Giao Diện Kép (Dark / Light)** | Thiết kế phong cách Hyer Aviation Luxury Editorial (Sáng) & Cyber Midnight Hull (Tối), chuyển đổi êm mượt, tối ưu độ tương phản và chống chói mắt. |
| **🗳️ Bình Chọn Khán Giả (`/vote`)** | Cổng bình chọn thời gian thực cho khán giả tiếp sức đội thi yêu thích; bảo vệ chống spam phiếu qua mã khóa cục bộ và giao diện dạ quang hổ phách. |
| **🏆 Bảng Xếp Hạng (`/rankings`)** | Bục vinh danh quán quân Leaderboard Arena, lọc theo vòng thi, gắn huy chương Top 1-2-3 và xuất file kết quả chính thức định dạng CSV/Excel. |
| **👥 Quản Lý Đội Thi & Bài Nộp** | Đội trưởng lập nhóm 3–5 thành viên, gửi lời mời qua email, nộp link GitHub repo, tài liệu docs và link chạy demo. |
| **🧑‍🏫 Mentor Đồng Hành** | Theo dõi các đội thi thuộc bảng đấu phụ trách, xem bài nộp và gửi phản hồi, góp ý kỹ thuật trực tiếp cho thí sinh. |
| **⚖️ Hội Đồng Chấm Thi (Judge)** | Chấm điểm độc lập theo ma trận tiêu chí có trọng số (0–10 điểm), nhập nhận xét chi tiết, khóa điểm chính thức (Finalize Score). |
| **🔬 Vòng Hiệu Chuẩn (RBL Calibration)** | Giám khảo nội bộ và chuyên gia khách mời cùng chấm một bài thi chuẩn để tính độ lệch chuẩn (StdDev), giá trị trung bình (Mean) và phân tích tính nhất quán liên đánh giá viên. |
| **🎛️ Bàn Điều Phối (Coordinator)** | Thiết lập sự kiện, bảng thi đấu, thứ tự vòng thi, phân công giám khảo, phê duyệt thăng hạng Top N tự động và tra cứu Audit Logs. |

---

## 🛠️ Công Nghệ Sử Dụng (Tech Stack)

### Frontend
- **Framework**: React 19, TypeScript 5, Vite 8
- **Routing & State**: React Router 7, React Context API, Axios Client
- **Trợ lý Thông minh & i18n**: AI Knowledge Engine Mock, Bilingual Localization Engine (`vi`/`en`), Theme Context
- **Testing**: Vitest, React Testing Library, jsdom (101/101 tests pass 100%)
- **Styling & Motion**: Modern CSS Variables, Glassmorphism, BEM, CSS Keyframe Animations (Pitch/Roll/Soar Flight Physics)

### BFF (Backend-For-Frontend)
- **Framework**: NestJS / Node.js 22 LTS
- **Bảo mật**: `cookie-parser`, `csurf` double-submit, HTTP-Proxy middleware, Helmet
- **Testing**: Jest (19 tests pass)

### Backend
- **Framework**: Spring Boot 4.1, Java 21 LTS
- **Bảo mật**: Spring Security 6, JJWT (HMAC-SHA256), BCrypt Password Hashing
- **ORM & DB**: Spring Data JPA, Hibernate ORM, Flyway Migration
- **Testing**: JUnit 5, Mockito, Spring Boot Test (194 tests pass)

### DevOps & Cơ sở hạ tầng
- **Database**: PostgreSQL 16 Alpine
- **Containerization**: Docker Compose đa dịch vụ, Docker multi-stage build, Nginx Alpine

---

## 🚀 Hướng Dẫn Cài Đặt & Khởi Động (1-Click)

### Yêu Cầu Tiên Quyết
- Đã cài đặt **Docker Desktop** (khuyến nghị) hoặc:
  - **Node.js**: v20+ hoặc v22 LTS
  - **JDK**: Java 21 LTS
  - **Maven**: 3.9+
  - **PostgreSQL**: 16

---

### Cách 1: Khởi Động 1-Click Siêu Tốc Bằng `start-system.bat` (Khuyến nghị cho Demo)

Dự án cung cấp sẵn tệp kịch bản tự động hóa cho hệ điều hành Windows:
1. **Khởi chạy hệ thống**: Nhấp đúp chuột vào file **`start-system.bat`** (hoặc chạy trong PowerShell / CMD):
   ```cmd
   start-system.bat
   ```
   Menu console cung cấp 5 tùy chọn linh hoạt:
   - **`[1]` (Mặc định / Enter)**: Khởi động trọn gói 4 Container qua Docker Compose (Web: [http://localhost:3000](http://localhost:3000)). Khuyên dùng khi demo.
   - **`[2]`**: Chạy Cục bộ (Local Mode) trên 3 cửa sổ terminal với H2 in-memory Database nạp sẵn dữ liệu demo (không cần Docker Desktop).
   - **`[3]`**: Chạy toàn bộ kiểm thử tự động (gọi trực tiếp `run-automated-tests.bat`).
   - **`[4]`**: Dừng và dọn dẹp sạch toàn bộ các container Docker (`docker compose down`).
   - **`[5]`**: Thoát menu.

2. **Chạy kiểm thử tự động 100% Xanh**: Nhấp đúp chuột vào file **`run-automated-tests.bat`**:
   ```cmd
   run-automated-tests.bat
   ```
   - Tự động chạy Ma trận RTM (27/27 Use Cases)
   - Tự động chạy 194 bài kiểm thử Backend (JUnit 5 / Java 21)
   - Tự động chạy 101 bài kiểm thử Frontend (Vitest / React 19)
   - Tự động kiểm tra cú pháp TypeScript & Bundle production (0 errors)

---

### Cách 2: Khởi động Thủ Công bằng Docker Compose

1. **Khởi chạy toàn bộ hệ thống trong 1 lệnh duy nhất**:
   ```bash
   docker compose up -d
   ```
2. **Kiểm tra trạng thái các container**:
   ```bash
   docker compose ps
   ```
   *Cả 4 container (`seal-frontend`, `seal-bff`, `seal-backend`, `seal-postgres`) phải ở trạng thái `Up (healthy)`.*

3. **Truy cập ứng dụng**:
   - **Giao diện người dùng**: [http://localhost:3000](http://localhost:3000)
   - **Cổng bình chọn**: [http://localhost:3000/vote](http://localhost:3000/vote)
   - **Bảng xếp hạng**: [http://localhost:3000/rankings](http://localhost:3000/rankings)
   - **API Health Backend**: [http://localhost:8080/actuator/health](http://localhost:8080/actuator/health)
   - **API Health BFF**: [http://localhost:4000/health](http://localhost:4000/health)

---

### Cách 2: Chạy Thủ Công Từng Tầng (Dành Cho Lập Trình Viên Dev/Debug)

Mở 3 cửa sổ dòng lệnh (Terminal) theo thứ tự bắt buộc:

**Terminal 1 — Backend (Spring Boot, Port 8080):**
```powershell
cd backend
$env:SPRING_PROFILES_ACTIVE="demo"
./mvnw spring-boot:run
```

**Terminal 2 — BFF (NestJS, Port 4000):**
```powershell
cd bff
npm install
npm run start:dev
```

**Terminal 3 — Frontend (React, Port 3001 khi dev):**
```powershell
cd frontend
npm install
$env:VITE_BFF_URL="http://localhost:4000"
npm run dev
```

---

## 🔐 Tài Khoản Demo Sẵn Có

Dữ liệu mẫu đã được nạp sẵn qua các file migration (`V006__demo_seed_users.sql` & `data-demo.sql`):

| Vai trò | Email đăng nhập | Mật khẩu mặc định | Quyền hạn chính |
|---|---|---|---|
| **Ban Tổ Chức / Quản Trị** | `coordinator@demo.local` | `Demo@123456` | Cấu hình giải đấu, phân công giám khảo, tính điểm, xuất file CSV |
| **Giám Khảo 1** | `judge1@demo.local` | `Demo@123456` | Chấm điểm bài nộp vòng chung kết, tham gia vòng hiệu chuẩn RBL |
| **Giám Khảo 2** | `judge2@demo.local` | `Demo@123456` | Giám khảo độc lập đối soát phân phối điểm số |
| **Mentor Chuyên Môn** | `mentor1@demo.local` | `Demo@123456` | Theo dõi và gửi phản hồi kỹ thuật cho các đội bảng đấu |
| **Đội Trưởng (Team Leader)** | `leader@demo.local` | `Demo@123456` | Quản lý đội Team Rocket, nộp link Github repo & tài liệu dự án |
| **Tài Khoản Gốc (SysAdmin)** | `coordinator@seal.edu.vn` | `Coordinator@123` | Quản trị viên hệ thống ban đầu |

---

## 🧪 Kiểm Thử Hệ Thống (Testing Suite)

Dự án áp dụng quy trình kiểm thử tự động nghiêm ngặt nhằm đảm bảo độ tin cậy phần mềm:

```bash
# 1. Chạy 101 unit tests Frontend (Pass 100%)
cd frontend
npm test -- --run

# 2. Kiểm tra biên dịch TypeScript & Đóng gói Production
npm run build

# 3. Chạy unit & integration tests Backend
cd ../backend
./mvnw test
```

---

## 📁 Cấu Trúc Thư Mục Dự Án (Monorepo)

```
SEAL_HACKATHON/
├── backend/                         # Core Backend Spring Boot 3
│   ├── src/main/java/com/seal/hackathon/
│   │   ├── domain/                  # Entities, Enums (EventStatus, TeamStatus...)
│   │   ├── repository/              # Spring Data JPA Repositories
│   │   ├── service/                 # Business logic & Algorithms (RBL, Scoring...)
│   │   ├── web/rest/                # 24 REST Controllers
│   │   └── security/                # JWT Filter, RBAC Authorization
│   └── src/main/resources/
│       ├── db/migration/            # Flyway Migrations (V001 -> V006)
│       └── data-demo.sql            # Dữ liệu seed phục vụ demo
├── bff/                             # Backend-For-Frontend Proxy (NestJS)
│   ├── src/                         # Auth proxy, Cookie httpOnly handler
│   └── Dockerfile
├── frontend/                        # Client SPA (React 19 + TypeScript)
│   ├── public/                      # Static assets, 3D Mascot PNGs, Logos
│   ├── src/
│   │   ├── api/                     # Axios client & Type interfaces
│   │   ├── components/              # Reusable UI, MascotBot, SealLogo, Icons
│   │   ├── context/                 # AuthContext (RBAC session)
│   │   └── pages/                   # 24 Màn hình (Landing, Vote, Ranking, Judge...)
│   └── Dockerfile
├── docs/                            # Hồ sơ tài liệu kỹ thuật & kiến trúc ADR
├── docker-compose.yml               # File cấu hình triển khai 4 container
├── DEMO_GUIDE.md                    # Cẩm nang hướng dẫn chạy demo cho nhóm
├── DEFENSE_REPORT_AND_PITCH.md      # Báo cáo chức năng & Chiến lược bảo vệ đồ án A+
└── README.md                        # Tài liệu dự án chính
```

---

## 👥 Phân Công Phát Triển

| Thành Viên | Phụ Trách Chính | Phân Hệ Thực Hiện |
|---|---|---|
| **Lê Minh Tài** | **Trưởng nhóm & Fullstack Architect** | Tiêu chí chấm điểm, Bảng giải thưởng, Xử lý vi phạm, UI Cyber Mascot, CI/CD & Docker Deployment |
| **Phạm Nguyễn Hoài Long** | **Security & Core Platform** | Hạ tầng xác thực, Phân quyền RBAC, BFF Cookie HttpOnly, Quản lý tài khoản Admin |
| **Hoàng Lê Giang** | **Public Experience & Data** | Cổng Landing Page, Cổng bình chọn khán giả (/vote), Bảng xếp hạng (/rankings), Dữ liệu seed demo |
| **Tạ Huỳnh Nguyên** | **Coordinator Domain** | Nghiệp vụ điều phối: Cấu trúc sự kiện, Bảng đấu (Tracks), Vòng thi (Rounds), Tiêu chí vòng thi |
| **Nguyễn Thục Toàn** | **Scoring & Research Engine** | Chấm điểm đa tiêu chí, Thuật toán phân tích RBL Variance, Vòng hiệu chuẩn (Calibration), Màn hình Mentor |
| **Trần Thị Yến Vy** | **Team & Submission Domain** | Đăng ký đội thi, Mời thành viên qua email, Quản lý bài nộp Git repo/Demo/Docs |

---

## 📜 Tài Liệu Tham Khảo Thêm
- [Cẩm Nang Hướng Dẫn Chạy Demo Cho Nhóm](./DEMO_GUIDE.md)
- [Báo Cáo Chức Năng & Chiến Lược Bảo Vệ Đồ Án Điểm A+](./DEFENSE_REPORT_AND_PITCH.md)
- [Hồ sơ Quyết định Kiến trúc (ADRs)](./docs/adr/README.md)
- [Quy trình đóng góp (Contributing Guidelines)](./CONTRIBUTING.md)
