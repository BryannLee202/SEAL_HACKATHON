import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MascotBot } from "../components/MascotBot";
import { CountUp } from "../components/CountUp";
import {
  IconCalendar,
  IconGavel,
  IconTrophy,
  IconShieldCheck,
  IconSparkles,
  IconArrowRight,
  IconUsers,
  IconGift,
  IconHeart,
} from "../components/icons";

interface RevealProps {
  children: React.ReactNode;
  className?: string;
}

function Reveal({ children, className = "" }: RevealProps) {
  return <div className={`l-reveal ${className}`}>{children}</div>;
}

const STATS = [
  { target: 500, suffix: "+", label: "Sinh viên & Thí sinh" },
  { target: 50, suffix: "+", label: "Đội thi tham gia" },
  { target: 100, suffix: "%", label: "Minh bạch điểm số" },
  { target: 20, suffix: " tr+", label: "Tổng giải thưởng (VNĐ)" },
];

const ROUNDS = [
  {
    tag: "Vòng 1",
    title: "Vòng Loại — Khởi động & Nộp Đề án",
    desc: "Các đội thành lập từ 3-5 thành viên, đăng ký theo Hạng mục và nộp repository, tài liệu đề án giải pháp công nghệ.",
  },
  {
    tag: "Vòng 2",
    title: "Vòng Bán Kết — Triển khai & Hiệu chuẩn",
    desc: "Top đội thi xuất sắc nộp sản phẩm hoàn thiện, video demo. Hội đồng giám khảo chấm điểm độc lập và đối soát hiệu chuẩn.",
  },
  {
    tag: "Vòng 3",
    title: "Vòng Chung Kết — Pitching & Trao Giải",
    desc: "Trực tiếp trình bày trước hội đồng ban giám khảo và mở cổng bình chọn khán giả công khai để vinh danh đội vô địch.",
  },
];

const CRITERIA = [
  { weight: 35, name: "Kỹ thuật & Kiến trúc phần mềm", desc: "Chất lượng mã nguồn, kiến trúc hệ thống, kiểm thử tự động và áp dụng công nghệ phù hợp." },
  { weight: 25, name: "Tính sáng tạo & Đổi mới", desc: "Ý tưởng độc đáo, giải quyết bài toán thực tế một cách sáng tạo và có giá trị khác biệt." },
  { weight: 20, name: "Trải nghiệm người dùng (UX/UI)", desc: "Giao diện hiện đại, trực quan, khả năng tiếp cận và độ mượt mà khi tương tác." },
  { weight: 20, name: "Tính khả thi & Tiềm năng ứng dụng", desc: "Khả năng thương mại hóa, giải quyết nhu cầu xã hội và mô hình triển khai bền vững." },
];

const ROLES = [
  {
    id: "team",
    icon: <IconUsers width={24} height={24} />,
    name: "Thành viên & Đội trưởng",
    tag: "Thí sinh tranh tài",
    color: "#38bdf8",
    bgAlpha: "rgba(56, 189, 248, 0.12)",
    borderAlpha: "rgba(56, 189, 248, 0.35)",
    desc: "Tạo đội thi từ 3–5 thành viên, nộp bài dự thi qua link Git repo, theo dõi tiến độ và nhận phản hồi từ Mentor.",
    highlights: [
      "Nộp repo Git & tài liệu kỹ thuật",
      "Theo dõi điểm số & phản hồi trực tiếp",
      "Kêu gọi bình chọn cộng đồng",
    ],
  },
  {
    id: "judge",
    icon: <IconGavel width={24} height={24} />,
    name: "Hội đồng Giám khảo",
    tag: "Đánh giá chuyên môn",
    color: "#bc7155",
    bgAlpha: "rgba(188, 113, 85, 0.15)",
    borderAlpha: "rgba(188, 113, 85, 0.38)",
    desc: "Chấm điểm từng tiêu chí với trọng số rõ ràng, tham gia vòng hiệu chuẩn (Calibration) nâng cao tính đồng thuận đánh giá.",
    highlights: [
      "Chấm điểm tiêu chuẩn hoá đa tiêu chí",
      "Góp ý & nhận xét chuyên sâu",
      "Phân tích độ tin cậy liên đánh giá (RBL)",
    ],
  },
  {
    id: "coord",
    icon: <IconShieldCheck width={24} height={24} />,
    name: "Ban Điều phối (Coordinator)",
    tag: "Vận hành sự kiện",
    color: "#10b981",
    bgAlpha: "rgba(16, 185, 129, 0.12)",
    borderAlpha: "rgba(16, 185, 129, 0.35)",
    desc: "Cấu hình toàn diện sự kiện, vòng thi, bộ tiêu chí, phê duyệt tài khoản thí sinh và giám sát nhật ký kiểm toán minh bạch.",
    highlights: [
      "Cấu hình đa vòng thi & luật thăng hạng",
      "Kiểm soát tài khoản & phân quyền chặt chẽ",
      "Nhật ký kiểm toán minh bạch không thể xoá",
    ],
  },
];

const PRIZES = [
  { track: "Giải Nhất Toàn cuộc thi", amount: "10.000.000 VNĐ + Cúp & Giấy chứng nhận" },
  { track: "Giải Nhì Toàn cuộc thi", amount: "5.000.000 VNĐ + Kỷ niệm chương" },
  { track: "Giải Ba Toàn cuộc thi", amount: "3.000.000 VNĐ + Kỷ niệm chương" },
  { track: "Giải Đội thi được Yêu thích nhất (Khán giả bình chọn)", amount: "2.000.000 VNĐ" },
];

const SPONSORS = [
  "Khoa Kỹ thuật Phần mềm — Đại học FPT",
  "FPT Software",
  "SEAL Research Lab",
  "Google Developer Student Clubs",
];

export function LandingPage() {
  const { user } = useAuth();
  const [selectedRoleTab, setSelectedRoleTab] = useState(0);

  return (
    <div className="landing">
      <LandingNav loggedIn={!!user} />

      {/* Hero Section */}
      <section className="l-hero" id="hero">
        <div className="l-container l-hero-inner">
          <div className="l-hero-left">
            <div className="l-badge">
              <IconSparkles width={14} height={14} />
              SEAL Hackathon 2026 — Ngành Kỹ thuật Phần mềm
            </div>
            <h1 className="l-hero-title">
              Đấu trường Công nghệ.
              <br />
              <span className="l-title-accent">Kiến tạo &amp; Đánh giá</span> Phần mềm.
            </h1>
            <p className="l-hero-subtitle">
              Hệ thống số hóa toàn diện quy trình SEAL Hackathon: quản lý vòng thi, chấm điểm đa tiêu chí độc lập, bình chọn khán giả công khai và phân tích độ tin cậy liên đánh giá viên (RBL).
            </p>

            <div className="l-hero-actions">
              <Link className="l-btn-primary" to={user ? "/app" : "/register"}>
                {user ? "Vào trang quản trị" : "Đăng ký tham gia ngay"}{" "}
                <IconArrowRight width={16} height={16} />
              </Link>
              <Link className="l-btn-ghost" to="/vote">
                <IconHeart width={16} height={16} /> Bình chọn khán giả
              </Link>
              <Link className="l-btn-ghost" to="/rankings">
                <IconTrophy width={16} height={16} /> Bảng xếp hạng
              </Link>
            </div>
          </div>

          <div className="l-hero-right">
            <MascotBot size={520} variant="hero" />
          </div>
        </div>
      </section>

      {/* Stats Counter Section */}
      <section className="l-stats-section">
        <div className="l-container">
          <div className="l-stats-grid">
            {STATS.map((s) => (
              <div className="l-stat-item" key={s.label}>
                <div className="l-stat-value">
                  <CountUp target={s.target} suffix={s.suffix} duration={1.5} />
                </div>
                <div className="l-stat-label">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="l-section l-section-alt" id="about">
        <div className="l-container">
          <Reveal>
            <div className="l-eyebrow">Giới thiệu nền tảng</div>
            <h2 className="l-section-title">Minh bạch hoá toàn bộ quy trình Hackathon</h2>
            <p className="l-section-desc">
              Thay thế hoàn toàn bảng tính Excel rời rạc bằng hệ thống tập trung — hỗ trợ giám khảo chấm điểm độc lập,
              tự động hóa thăng vòng và tạo dữ liệu nghiên cứu độ tin cậy đánh giá viên.
            </p>
          </Reveal>

          <div className="l-feature-grid">
            <Reveal className="l-feature-card">
              <div className="l-feature-icon">
                <IconCalendar />
              </div>
              <h3>Quản lý Đa vòng &amp; Hạng mục</h3>
              <p>Cấu hình linh hoạt vòng loại, chung kết, các bảng thi đấu chuyên đề và luật thăng hạng Top N.</p>
            </Reveal>

            <Reveal className="l-feature-card">
              <div className="l-feature-icon">
                <IconGavel />
              </div>
              <h3>Chấm điểm Tiêu chí có Trọng số</h3>
              <p>Giám khảo chấm độc lập theo từng tiêu chí, tính điểm trực tiếp và ghi nhận nhận xét chi tiết.</p>
            </Reveal>

            <Reveal className="l-feature-card">
              <div className="l-feature-icon">
                <IconHeart />
              </div>
              <h3>Bình chọn Khán giả Công khai</h3>
              <p>Cổng bình chọn trực tuyến cho khán giả theo dõi đội thi yêu thích và cập nhật lượt vote tức thì.</p>
            </Reveal>

            <Reveal className="l-feature-card">
              <div className="l-feature-icon">
                <IconTrophy />
              </div>
              <h3>Xếp hạng &amp; Xuất kết quả Excel</h3>
              <p>Tự động xếp hạng theo bảng và toàn cuộc thi, hỗ trợ xuất báo cáo xếp hạng định dạng Excel/CSV.</p>
            </Reveal>

            <Reveal className="l-feature-card">
              <div className="l-feature-icon">
                <IconShieldCheck />
              </div>
              <h3>Nhật ký Kiểm toán (Audit Log)</h3>
              <p>Mọi hành động phê duyệt, chấm điểm, loại đội đều được ghi log bất biến, đảm bảo tính công bằng.</p>
            </Reveal>

            <Reveal className="l-feature-card">
              <div className="l-feature-icon">
                <IconSparkles />
              </div>
              <h3>Hiệu chuẩn &amp; Nghiên cứu RBL</h3>
              <p>Thu thập phân phối điểm số của giám khảo nội bộ và giám khảo khách mời phục vụ phân tích ICC.</p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Timeline Section */}
      <section className="l-section l-section-dark" id="timeline">
        <div className="l-container">
          <div className="l-eyebrow">Lộ trình thi đấu</div>
          <h2 className="l-section-title light">3 chặng đua — Một hành trình vươn tầm</h2>
          <div className="l-timeline">
            {ROUNDS.map((r, i) => (
              <div className="l-timeline-item" key={r.title}>
                <div className="l-timeline-index">{String(i + 1).padStart(2, "0")}</div>
                <div className="l-timeline-tag">{r.tag}</div>
                <h3>{r.title}</h3>
                <p>{r.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Criteria Section */}
      <section className="l-section l-section-alt" id="criteria">
        <div className="l-container">
          <Reveal>
            <div className="l-eyebrow">Tiêu chí đánh giá</div>
            <h2 className="l-section-title">Khung tiêu chí chuẩn mực — Trọng số minh bạch</h2>
            <p className="l-section-desc">
              Mỗi sự kiện kế thừa bộ tiêu chí cốt lõi của ngành Phần mềm và tuỳ chỉnh linh hoạt theo từng vòng thi.
            </p>
          </Reveal>
          <div className="l-criteria-grid">
            {CRITERIA.map((c) => (
              <Reveal className="l-criteria-card" key={c.name}>
                <div className="l-criteria-weight">{c.weight}%</div>
                <div>
                  <h4>{c.name}</h4>
                  <p>{c.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Roles Section */}
      <section className="l-section l-section-dark" id="roles">
        <div className="l-container">
          <Reveal>
            <div className="l-eyebrow">Phân quyền chuyên biệt</div>
            <h2 className="l-section-title light">Một nền tảng — Đầy đủ mọi vai trò</h2>
            <p className="l-section-desc" style={{ color: "#94a3b8" }}>
              Trải nghiệm tùy biến chuyên sâu cho từng chủ thể tham gia với giao diện và phân quyền riêng biệt.
            </p>
          </Reveal>

          {/* Interactive Role Tab Strip */}
          <div className="l-role-tabs-strip">
            {ROLES.map((r, idx) => (
              <button
                key={r.id}
                type="button"
                className={`l-role-tab-btn ${selectedRoleTab === idx ? "active" : ""}`}
                onClick={() => setSelectedRoleTab(idx)}
                style={{
                  borderColor: selectedRoleTab === idx ? r.color : "transparent",
                  color: selectedRoleTab === idx ? "#ffffff" : "#94a3b8",
                }}
              >
                <span className="l-role-tab-dot" style={{ backgroundColor: r.color }} />
                {r.name}
              </button>
            ))}
          </div>

          <div className="l-roles-grid">
            {ROLES.map((r, idx) => {
              const isSelected = selectedRoleTab === idx;
              return (
                <div
                  className={`l-role-card ${isSelected ? "l-role-card-highlighted" : ""}`}
                  key={r.name}
                  onClick={() => setSelectedRoleTab(idx)}
                  style={{
                    borderColor: isSelected ? r.color : undefined,
                    boxShadow: isSelected ? `0 14px 34px -4px ${r.bgAlpha}` : undefined,
                  }}
                >
                  <div className="l-role-header">
                    <div
                      className="l-role-icon"
                      style={{
                        background: r.bgAlpha,
                        color: r.color,
                        borderColor: r.borderAlpha,
                      }}
                    >
                      {r.icon}
                    </div>
                    <span
                      className="l-role-tag"
                      style={{
                        color: r.color,
                        background: r.bgAlpha,
                        borderColor: r.borderAlpha,
                      }}
                    >
                      {r.tag}
                    </span>
                  </div>
                  <h3>{r.name}</h3>
                  <p>{r.desc}</p>
                  <ul className="l-role-highlights">
                    {r.highlights.map((h) => (
                      <li key={h}>
                        <span className="l-role-check" style={{ color: r.color }}>✓</span> {h}
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Prizes Section */}
      <section className="l-section" id="prizes">
        <div className="l-container">
          <Reveal>
            <div className="l-eyebrow">Cơ cấu giải thưởng</div>
            <h2 className="l-section-title">Giải thưởng &amp; Đơn vị đồng hành</h2>
            <p className="l-section-desc">
              Vinh danh những sản phẩm phần mềm xuất sắc nhất và kết nối thí sinh với doanh nghiệp công nghệ uy tín.
            </p>
          </Reveal>

          <Reveal className="l-prize-banner">
            <div className="l-prize-amount-col">
              <div className="l-prize-amount">
                <CountUp target={20} suffix=" triệu+" duration={1.6} />
                <small>Tổng giá trị giải thưởng tiền mặt &amp; hiện vật</small>
              </div>
            </div>
            <div className="l-prize-list">
              {PRIZES.map((p) => (
                <div className="l-prize-row" key={p.track}>
                  <span className="track-name">{p.track}</span>
                  <span className="amount">{p.amount}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <div style={{ marginTop: 40 }}>
            <div className="l-eyebrow">Đơn vị tài trợ &amp; Hỗ trợ chuyên môn</div>
            <div className="l-sponsors">
              {SPONSORS.map((s) => (
                <span className="l-sponsor-chip" key={s}>
                  <IconGift width={15} height={15} />
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="l-cta">
        <div className="l-container l-cta-inner">
          <h2>Sẵn sàng kiến tạo giải pháp công nghệ?</h2>
          <p>Tạo tài khoản sinh viên, đăng ký đội thi và gia nhập cuộc đua hackathon ngay hôm nay.</p>
          <div className="l-hero-actions center">
            <Link className="l-btn-primary" to={user ? "/app" : "/register"}>
              {user ? "Vào bảng điều khiển" : "Đăng ký tài khoản mới"}{" "}
              <IconArrowRight width={16} height={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="l-footer">
        <div className="l-container l-footer-inner">
          <div className="l-footer-brand">
            <div className="l-nav-mark">SH</div>
            SEAL Hackathon Management System
          </div>
          <div className="muted" style={{ fontSize: 13 }}>
            © 2026 SEAL Hackathon — Ngành Kỹ thuật Phần mềm (SE Department).
          </div>
        </div>
      </footer>
    </div>
  );
}

function LandingNav({ loggedIn }: { loggedIn: boolean }) {
  return (
    <header className="l-nav">
      <div className="l-container l-nav-inner">
        <Link className="l-nav-brand" to="/">
          <div className="l-nav-mark">SH</div>
          SEAL Hackathon
        </Link>
        <nav className="l-nav-links">
          <a href="#about">Về cuộc thi</a>
          <a href="#timeline">Lộ trình</a>
          <a href="#criteria">Tiêu chí</a>
          <a href="#roles">Vai trò</a>
          <Link to="/vote">Bình chọn</Link>
          <Link to="/rankings">Bảng xếp hạng</Link>
        </nav>
        <div className="l-nav-actions">
          {loggedIn ? (
            <Link className="l-btn-primary small" to="/app">
              Vào hệ thống
            </Link>
          ) : (
            <>
              <Link className="l-btn-ghost small" to="/login">
                Đăng nhập
              </Link>
              <Link className="l-btn-primary small" to="/register">
                Đăng ký
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
