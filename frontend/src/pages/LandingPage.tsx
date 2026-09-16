import { useState } from "react";
import { Link } from "react-router-dom";
import { ThemeToggle } from "../components/ThemeToggle";
import { LanguageSwitcher } from "../components/LanguageSwitcher";
import { useLanguage } from "../context/LanguageContext";
import { useAuth } from "../context/AuthContext";
import { MascotBot } from "../components/MascotBot";
import { SealLogo } from "../components/SealLogo";
import { CountUp } from "../components/CountUp";
import {
  IconGavel,
  IconTrophy,
  IconShieldCheck,
  IconSparkles,
  IconArrowRight,
  IconUsers,
  IconGift,
  IconHeart,
  IconTechBracket,
  IconTechScoring,
  IconTechPulseVote,
  IconTechTrophy,
  IconTechAudit,
  IconTechRadar,
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

const FEATURES = [
  {
    image: "/images/feat-rounds.jpg",
    icon: <IconTechBracket width={19} height={19} />,
    tag: "Lộ trình & Bảng đấu",
    title: "Quản lý Đa vòng & Hạng mục",
    desc: "Cấu hình linh hoạt vòng loại, chung kết, các bảng thi đấu chuyên đề và luật thăng hạng Top N tự động.",
  },
  {
    image: "/images/feat-scoring.jpg",
    icon: <IconTechScoring width={19} height={19} />,
    tag: "Hội đồng Giám khảo",
    title: "Chấm điểm Tiêu chí có Trọng số",
    desc: "Giám khảo chấm độc lập theo từng tiêu chí, tính điểm trực tiếp và ghi nhận nhận xét chi tiết từng bài thi.",
  },
  {
    image: "/images/feat-voting.jpg",
    icon: <IconTechPulseVote width={19} height={19} />,
    tag: "Tương tác Cộng đồng",
    title: "Bình chọn Khán giả Công khai",
    desc: "Cổng bình chọn trực tuyến cho khán giả theo dõi đội thi yêu thích và cập nhật lượt vote tức thì thời gian thực.",
  },
  {
    image: "/images/feat-ranking.jpg",
    icon: <IconTechTrophy width={19} height={19} />,
    tag: "Vinh danh & Báo cáo",
    title: "Xếp hạng & Xuất kết quả Excel",
    desc: "Tự động xếp hạng theo bảng và toàn cuộc thi, hỗ trợ xuất báo cáo xếp hạng chuẩn định dạng Excel/CSV.",
  },
  {
    image: "/images/feat-audit.jpg",
    icon: <IconTechAudit width={19} height={19} />,
    tag: "Minh bạch Tuyệt đối",
    title: "Nhật ký Kiểm toán (Audit Log)",
    desc: "Mọi hành động phê duyệt, chấm điểm, loại đội đều được ghi log bất biến, đảm bảo tính công bằng cao nhất.",
  },
  {
    image: "/images/feat-research.jpg",
    icon: <IconTechRadar width={19} height={19} />,
    tag: "Độ tin cậy Khoa học",
    title: "Hiệu chuẩn & Nghiên cứu RBL",
    desc: "Thu thập phân phối điểm số của giám khảo nội bộ và chuyên gia khách mời phục vụ phân tích độ tin cậy ICC.",
  },
];

const ROLES = [
  {
    id: "team",
    image: "/images/role-team.jpg",
    icon: <IconUsers width={22} height={22} />,
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
    image: "/images/role-judge.jpg",
    icon: <IconGavel width={22} height={22} />,
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
    image: "/images/role-coord.jpg",
    icon: <IconShieldCheck width={22} height={22} />,
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
  { medal: "🥇", track: "Giải Nhất Toàn cuộc thi", amount: "10.000.000 VNĐ", reward: "Cúp Vô Địch & Giấy chứng nhận" },
  { medal: "🥈", track: "Giải Nhì Toàn cuộc thi", amount: "5.000.000 VNĐ", reward: "Kỷ niệm chương danh giá" },
  { medal: "🥉", track: "Giải Ba Toàn cuộc thi", amount: "3.000.000 VNĐ", reward: "Kỷ niệm chương danh giá" },
  { medal: "💖", track: "Giải Đội thi được Yêu thích nhất", amount: "2.000.000 VNĐ", reward: "Khán giả bình chọn trực tuyến" },
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
            <MascotBot size={640} variant="hero" />
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
            {FEATURES.map((f) => (
              <Reveal className="l-feature-card" key={f.title}>
                <div className="l-feature-img-wrap">
                  <img
                    src={f.image}
                    alt={f.title}
                    className="l-feature-img"
                    loading="lazy"
                  />
                  <div className="l-feature-img-overlay" />
                  <span className="l-feature-tag">{f.tag}</span>
                  <div className="l-feature-icon-badge">{f.icon}</div>
                </div>
                <div className="l-feature-body">
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </div>
              </Reveal>
            ))}
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
                  <div className="l-role-img-wrap">
                    <img
                      src={r.image}
                      alt={r.name}
                      className="l-role-img"
                      loading="lazy"
                    />
                    <div className="l-role-img-overlay" />
                    <span
                      className="l-role-tag"
                      style={{
                        color: r.color,
                        borderColor: r.borderAlpha,
                      }}
                    >
                      {r.tag}
                    </span>
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
                  </div>
                  <div className="l-role-body">
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
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Prizes Section - Soft Platinum Canvas with Prestigious Gold/Amber Championship Banner */}
      <section className="l-section l-section-prizes" id="prizes">
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
              <div className="l-prize-trophy-badge">
                <IconTechTrophy width={38} height={38} />
              </div>
              <div className="l-prize-amount">
                <CountUp target={20} suffix=" triệu+" duration={1.6} />
                <small>Tổng giá trị giải thưởng tiền mặt, cúp &amp; quà tặng hiện vật</small>
              </div>
              <div className="l-prize-guarantee">
                <span className="l-prize-guarantee-dot" /> Trao thưởng vinh danh tại Đêm Chung kết
              </div>
            </div>
            <div className="l-prize-list">
              {PRIZES.map((p, idx) => (
                <div className={`l-prize-row ${idx === 0 ? "first-prize" : ""}`} key={p.track}>
                  <div className="l-prize-row-left">
                    <span className="l-prize-medal">{p.medal}</span>
                    <div>
                      <span className="track-name">{p.track}</span>
                      <small className="reward-detail">{p.reward}</small>
                    </div>
                  </div>
                  <span className="amount">{p.amount}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <div className="l-sponsors-wrap">
            <div className="l-eyebrow center">Đơn vị tài trợ &amp; Hỗ trợ chuyên môn</div>
            <div className="l-sponsors">
              {SPONSORS.map((s) => (
                <span className="l-sponsor-chip" key={s}>
                  <IconGift width={16} height={16} />
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action - Grand Cyber Arena Deck with 3D Cyber Seal Mascot in Flight */}
      <section className="l-cta" id="cta">
        <div className="l-container">
          <div className="l-cta-shell">
            <div className="l-cta-content">
              <div className="l-cta-badge">
                <span className="l-cta-live-dot" />
                MÙA THI ĐẤU 2026 • ĐANG MỞ ĐĂNG KÝ
              </div>
              <h2 className="l-cta-title">
                Sẵn sàng kiến tạo <br />
                <span className="l-cta-title-accent">giải pháp công nghệ</span> đột phá?
              </h2>
              <p className="l-cta-desc">
                Tạo tài khoản sinh viên, thành lập đội thi 3–5 thành viên và gia nhập cuộc đua hackathon lập trình chuyên nghiệp ngay hôm nay.
              </p>

              <div className="l-cta-perks">
                <div className="l-cta-perk">
                  <span className="l-cta-perk-check">✓</span>
                  <span>Miễn phí 100% lệ phí tham dự cho mọi thí sinh</span>
                </div>
                <div className="l-cta-perk">
                  <span className="l-cta-perk-check">✓</span>
                  <span>Trực tiếp thuyết trình trước hội đồng chuyên gia &amp; nhà tuyển dụng</span>
                </div>
                <div className="l-cta-perk">
                  <span className="l-cta-perk-check">✓</span>
                  <span>Cấp giấy chứng nhận kỹ năng phần mềm chính thức</span>
                </div>
              </div>

              <div className="l-cta-actions">
                <Link className="l-btn-primary l-cta-btn-glow" to={user ? "/app" : "/register"}>
                  {user ? "Vào bảng điều khiển" : "Đăng ký tài khoản mới"}{" "}
                  <IconArrowRight width={16} height={16} />
                </Link>
                <Link className="l-btn-ghost l-cta-btn-ghost" to="/vote">
                  <IconHeart width={16} height={16} /> Bình chọn khán giả
                </Link>
              </div>
            </div>

            <div className="l-cta-mascot-col">
              <div className="l-cta-mascot-stage">
                <div className="l-cta-mascot-halo" />
                <div className="l-cta-mascot-radar-ring" />
                <img
                  src="/seal-mascot-hero.png"
                  alt="SEAL Hackathon 3D Cyber Mascot"
                  className="l-cta-mascot-img"
                  loading="lazy"
                />
                <div className="l-cta-mascot-shadow" />

                <div className="l-cta-chip l-cta-chip-top">
                  <span className="l-cta-chip-icon">⚡</span>
                  <span className="l-cta-chip-text">50+ Đội thi tranh tài</span>
                </div>
                <div className="l-cta-chip l-cta-chip-bottom">
                  <span className="l-cta-chip-icon">🏆</span>
                  <span className="l-cta-chip-text">Tổng thưởng 20Tr+</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="l-footer">
        <div className="l-container l-footer-inner">
          <div className="l-footer-brand">
            <SealLogo size={34} showText={true} theme="dark" />
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
  const { language } = useLanguage();
  const isEn = language === "en";

  return (
    <header className="l-nav">
      <div className="l-container l-nav-inner">
        <Link className="l-nav-brand" to="/" style={{ textDecoration: "none" }}>
          <SealLogo size={36} showText={true} />
        </Link>
        <nav className="l-nav-links">
          <a href="#about">{isEn ? "About" : "Về cuộc thi"}</a>
          <a href="#timeline">{isEn ? "Timeline" : "Lộ trình"}</a>
          <a href="#criteria">{isEn ? "Criteria" : "Tiêu chí"}</a>
          <a href="#roles">{isEn ? "Roles" : "Vai trò"}</a>
          <Link to="/vote">{isEn ? "Voting" : "Bình chọn"}</Link>
          <Link to="/rankings">{isEn ? "Leaderboard" : "Bảng xếp hạng"}</Link>
        </nav>
        <div className="l-nav-actions" style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ThemeToggle />
          <LanguageSwitcher />
          {loggedIn ? (
            <Link className="l-btn-primary small" to="/app">
              {isEn ? "Console" : "Vào hệ thống"}
            </Link>
          ) : (
            <>
              <Link className="l-btn-ghost small" to="/login">
                {isEn ? "Log in" : "Đăng nhập"}
              </Link>
              <Link className="l-btn-primary small" to="/register">
                {isEn ? "Register" : "Đăng ký"}
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
