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

export function LandingPage() {
  const { user } = useAuth();
  const { language } = useLanguage();
  const isEn = language === "en";
  const [selectedRoleTab, setSelectedRoleTab] = useState(0);

  const stats = [
    { target: 500, suffix: "+", label: isEn ? "Students & Contestants" : "Sinh viên & Thí sinh" },
    { target: 50, suffix: "+", label: isEn ? "Competing Teams" : "Đội thi tham gia" },
    { target: 100, suffix: "%", label: isEn ? "Scoring Transparency" : "Minh bạch điểm số" },
    { target: 20, suffix: isEn ? "M+ VND" : " tr+ VNĐ", label: isEn ? "Total Prize Pool" : "Tổng giải thưởng" },
  ];

  const rounds = [
    {
      tag: isEn ? "Stage 1" : "Vòng 1",
      title: isEn ? "Qualifying — Kickoff & Proposal Submission" : "Vòng Loại — Khởi động & Nộp Đề án",
      desc: isEn
        ? "Teams of 3–5 form, register under chosen tracks, and submit project repositories and architectural documentation."
        : "Các đội thành lập từ 3-5 thành viên, đăng ký theo Hạng mục và nộp repository, tài liệu đề án giải pháp công nghệ.",
    },
    {
      tag: isEn ? "Stage 2" : "Vòng 2",
      title: isEn ? "Semi-Finals — Implementation & Calibration" : "Vòng Bán Kết — Triển khai & Hiệu chuẩn",
      desc: isEn
        ? "Top qualifying teams submit functional products and video demos. Judges evaluate independently with calibration reconciliation."
        : "Top đội thi xuất sắc nộp sản phẩm hoàn thiện, video demo. Hội đồng giám khảo chấm điểm độc lập và đối soát hiệu chuẩn.",
    },
    {
      tag: isEn ? "Stage 3" : "Vòng 3",
      title: isEn ? "Grand Finale — Pitching & Award Ceremony" : "Vòng Chung Kết — Pitching & Trao Giải",
      desc: isEn
        ? "Live pitch before the judging panel combined with public audience voting to crown the championship team."
        : "Trực tiếp trình bày trước hội đồng ban giám khảo và mở cổng bình chọn khán giả công khai để vinh danh đội vô địch.",
    },
  ];

  const criteria = [
    {
      weight: 35,
      name: isEn ? "Software Engineering & Architecture" : "Kỹ thuật & Kiến trúc phần mềm",
      desc: isEn
        ? "Code cleanliness, system architecture, automated test suites, and appropriate technology stack."
        : "Chất lượng mã nguồn, kiến trúc hệ thống, kiểm thử tự động và áp dụng công nghệ phù hợp.",
    },
    {
      weight: 25,
      name: isEn ? "Innovation & Originality" : "Tính sáng tạo & Đổi mới",
      desc: isEn
        ? "Unique concept, novel problem-solving approach, and distinctive technological differentiation."
        : "Ý tưởng độc đáo, giải quyết bài toán thực tế một cách sáng tạo và có giá trị khác biệt.",
    },
    {
      weight: 20,
      name: isEn ? "User Experience (UX/UI)" : "Trải nghiệm người dùng (UX/UI)",
      desc: isEn
        ? "Modern, intuitive interface, accessibility standards, and smooth interaction flows."
        : "Giao diện hiện đại, trực quan, khả năng tiếp cận và độ mượt mà khi tương tác.",
    },
    {
      weight: 20,
      name: isEn ? "Feasibility & Practical Impact" : "Tính khả thi & Tiềm năng ứng dụng",
      desc: isEn
        ? "Commercial viability, real-world impact, and sustainable deployment capability."
        : "Khả năng thương mại hóa, giải quyết nhu cầu xã hội và mô hình triển khai bền vững.",
    },
  ];

  const features = [
    {
      image: "/images/feat-rounds.jpg",
      icon: <IconTechBracket width={19} height={19} />,
      tag: isEn ? "Roadmap & Brackets" : "Lộ trình & Bảng đấu",
      title: isEn ? "Multi-round & Track Management" : "Quản lý Đa vòng & Hạng mục",
      desc: isEn
        ? "Flexible setup for qualifiers, grand finals, topic-based brackets, and automated Top N progression."
        : "Cấu hình linh hoạt vòng loại, chung kết, các bảng thi đấu chuyên đề và luật thăng hạng Top N tự động.",
    },
    {
      image: "/images/feat-scoring.jpg",
      icon: <IconTechScoring width={19} height={19} />,
      tag: isEn ? "Judging Panel" : "Hội đồng Giám khảo",
      title: isEn ? "Weighted Multi-Criteria Evaluation" : "Chấm điểm Tiêu chí có Trọng số",
      desc: isEn
        ? "Judges evaluate independently per criterion, real-time score synthesis, and structured technical feedback."
        : "Giám khảo chấm độc lập theo từng tiêu chí, tính điểm trực tiếp và ghi nhận nhận xét chi tiết từng bài thi.",
    },
    {
      image: "/images/feat-voting.jpg",
      icon: <IconTechPulseVote width={19} height={19} />,
      tag: isEn ? "Community Pulse" : "Tương tác Cộng đồng",
      title: isEn ? "Live Public Audience Voting" : "Bình chọn Khán giả Công khai",
      desc: isEn
        ? "Real-time voting portal allowing the tech community to support favorite teams with live tally updates."
        : "Cổng bình chọn trực tuyến cho khán giả theo dõi đội thi yêu thích và cập nhật lượt vote tức thì thời gian thực.",
    },
    {
      image: "/images/feat-ranking.jpg",
      icon: <IconTechTrophy width={19} height={19} />,
      tag: isEn ? "Honor & Reporting" : "Vinh danh & Báo cáo",
      title: isEn ? "Leaderboard & Excel/CSV Export" : "Xếp hạng & Xuất kết quả Excel",
      desc: isEn
        ? "Automated ranking by track and overall tournament, with instant official Excel and CSV export."
        : "Tự động xếp hạng theo bảng và toàn cuộc thi, hỗ trợ xuất báo cáo xếp hạng chuẩn định dạng Excel/CSV.",
    },
    {
      image: "/images/feat-audit.jpg",
      icon: <IconTechAudit width={19} height={19} />,
      tag: isEn ? "Total Transparency" : "Minh bạch Tuyệt đối",
      title: isEn ? "Immutable Audit Logging" : "Nhật ký Kiểm toán (Audit Log)",
      desc: isEn
        ? "Every approval, score submission, and qualification action is permanently logged for maximum integrity."
        : "Mọi hành động phê duyệt, chấm điểm, loại đội đều được ghi log bất biến, đảm bảo tính công bằng cao nhất.",
    },
    {
      image: "/images/feat-research.jpg",
      icon: <IconTechRadar width={19} height={19} />,
      tag: isEn ? "Scientific Rigor" : "Độ tin cậy Khoa học",
      title: isEn ? "Calibration & RBL Research" : "Hiệu chuẩn & Nghiên cứu RBL",
      desc: isEn
        ? "Collects distribution metrics from internal and external judges to empower ICC inter-rater reliability analysis."
        : "Thu thập phân phối điểm số của giám khảo nội bộ và chuyên gia khách mời phục vụ phân tích độ tin cậy ICC.",
    },
  ];

  const roles = [
    {
      id: "team",
      image: "/images/role-team.jpg",
      icon: <IconUsers width={22} height={22} />,
      name: isEn ? "Team Leader & Members" : "Thành viên & Đội trưởng",
      tag: isEn ? "Contestant Arena" : "Thí sinh tranh tài",
      color: "#38bdf8",
      bgAlpha: "rgba(56, 189, 248, 0.12)",
      borderAlpha: "rgba(56, 189, 248, 0.35)",
      desc: isEn
        ? "Form teams of 3–5, submit project deliverables via Git repo URLs, track progress, and receive direct feedback from Mentors."
        : "Tạo đội thi từ 3–5 thành viên, nộp bài dự thi qua link Git repo, theo dõi tiến độ và nhận phản hồi từ Mentor.",
      highlights: isEn
        ? [
            "Submit Git repo & technical specs",
            "Track real-time scores & mentor feedback",
            "Rally community audience votes",
          ]
        : [
            "Nộp repo Git & tài liệu kỹ thuật",
            "Theo dõi điểm số & phản hồi trực tiếp",
            "Kêu gọi bình chọn cộng đồng",
          ],
    },
    {
      id: "judge",
      image: "/images/role-judge.jpg",
      icon: <IconGavel width={22} height={22} />,
      name: isEn ? "Judging Panel" : "Hội đồng Giám khảo",
      tag: isEn ? "Expert Evaluation" : "Đánh giá chuyên môn",
      color: "#bc7155",
      bgAlpha: "rgba(188, 113, 85, 0.15)",
      borderAlpha: "rgba(188, 113, 85, 0.38)",
      desc: isEn
        ? "Score projects across weighted criteria with clear rubrics, participating in calibration rounds to maximize scoring consensus."
        : "Chấm điểm từng tiêu chí với trọng số rõ ràng, tham gia vòng hiệu chuẩn (Calibration) nâng cao tính đồng thuận đánh giá.",
      highlights: isEn
        ? [
            "Standardized multi-criteria rubrics",
            "In-depth technical critique & guidance",
            "Inter-rater reliability (RBL) analysis",
          ]
        : [
            "Chấm điểm tiêu chuẩn hoá đa tiêu chí",
            "Góp ý & nhận xét chuyên sâu",
            "Phân tích độ tin cậy liên đánh giá (RBL)",
          ],
    },
    {
      id: "coord",
      image: "/images/role-coord.jpg",
      icon: <IconShieldCheck width={22} height={22} />,
      name: isEn ? "Organizing Coordinator" : "Ban Điều phối (Coordinator)",
      tag: isEn ? "Event Operations" : "Vận hành sự kiện",
      color: "#10b981",
      bgAlpha: "rgba(16, 185, 129, 0.12)",
      borderAlpha: "rgba(16, 185, 129, 0.35)",
      desc: isEn
        ? "Comprehensive configuration of rounds, criteria sets, account verification, and transparent immutable audit logging."
        : "Cấu hình toàn diện sự kiện, vòng thi, bộ tiêu chí, phê duyệt tài khoản thí sinh và giám sát nhật ký kiểm toán minh bạch.",
      highlights: isEn
        ? [
            "Multi-round setup & auto-advancement",
            "Strict RBAC access controls",
            "Immutable audit log governance",
          ]
        : [
            "Cấu hình đa vòng thi & luật thăng hạng",
            "Kiểm soát tài khoản & phân quyền chặt chẽ",
            "Nhật ký kiểm toán minh bạch không thể xoá",
          ],
    },
  ];

  const prizes = [
    {
      medal: "🥇",
      track: isEn ? "Grand Champion" : "Giải Nhất Toàn cuộc thi",
      amount: "10.000.000 VNĐ",
      reward: isEn ? "Championship Trophy & Gold Certificate" : "Cúp Vô Địch & Giấy chứng nhận",
    },
    {
      medal: "🥈",
      track: isEn ? "First Runner-Up" : "Giải Nhì Toàn cuộc thi",
      amount: "5.000.000 VNĐ",
      reward: isEn ? "Prestigious Silver Honor Medallion" : "Kỷ niệm chương danh giá",
    },
    {
      medal: "🥉",
      track: isEn ? "Second Runner-Up" : "Giải Ba Toàn cuộc thi",
      amount: "3.000.000 VNĐ",
      reward: isEn ? "Prestigious Bronze Honor Medallion" : "Kỷ niệm chương danh giá",
    },
    {
      medal: "💖",
      track: isEn ? "Audience Choice Award" : "Giải Đội thi được Yêu thích nhất",
      amount: "2.000.000 VNĐ",
      reward: isEn ? "Voted directly by online audience" : "Khán giả bình chọn trực tuyến",
    },
  ];

  const sponsors = isEn
    ? [
        "Software Engineering Department — FPT University",
        "FPT Software",
        "SEAL Research Lab",
        "Google Developer Student Clubs",
      ]
    : [
        "Khoa Kỹ thuật Phần mềm — Đại học FPT",
        "FPT Software",
        "SEAL Research Lab",
        "Google Developer Student Clubs",
      ];

  return (
    <div className="landing">
      <LandingNav loggedIn={!!user} />

      {/* Hero Section */}
      <section className="l-hero" id="hero">
        <div className="l-container l-hero-inner">
          <div className="l-hero-left">
            <div className="l-badge">
              <IconSparkles width={14} height={14} />
              {isEn
                ? "SEAL Hackathon 2026 — Software Engineering Department"
                : "SEAL Hackathon 2026 — Ngành Kỹ thuật Phần mềm"}
            </div>
            <h1 className="l-hero-title">
              {isEn ? (
                <>
                  Arena of Technology.
                  <br />
                  <span className="l-title-accent">Build &amp; Benchmark</span> Software.
                </>
              ) : (
                <>
                  Đấu trường Công nghệ.
                  <br />
                  <span className="l-title-accent">Kiến tạo &amp; Đánh giá</span> Phần mềm.
                </>
              )}
            </h1>
            <p className="l-hero-subtitle">
              {isEn
                ? "Comprehensive digital system for SEAL Hackathon: multi-round workflows, independent multi-criteria scoring, real-time public voting, and inter-rater reliability (RBL) research."
                : "Hệ thống số hóa toàn diện quy trình SEAL Hackathon: quản lý vòng thi, chấm điểm đa tiêu chí độc lập, bình chọn khán giả công khai và phân tích độ tin cậy liên đánh giá viên (RBL)."}
            </p>

            <div className="l-hero-actions">
              <Link className="l-btn-primary" to={user ? "/app" : "/register"}>
                {user
                  ? (isEn ? "Go to Dashboard" : "Vào trang quản trị")
                  : (isEn ? "Register Now" : "Đăng ký tham gia ngay")}{" "}
                <IconArrowRight width={16} height={16} />
              </Link>
              <Link className="l-btn-ghost" to="/vote">
                <IconHeart width={16} height={16} /> {isEn ? "Audience Voting" : "Bình chọn khán giả"}
              </Link>
              <Link className="l-btn-ghost" to="/rankings">
                <IconTrophy width={16} height={16} /> {isEn ? "Leaderboard" : "Bảng xếp hạng"}
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
            {stats.map((s) => (
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
            <div className="l-eyebrow">{isEn ? "Platform Overview" : "Giới thiệu nền tảng"}</div>
            <h2 className="l-section-title">
              {isEn
                ? "Complete Transparency for Hackathon Operations"
                : "Minh bạch hoá toàn bộ quy trình Hackathon"}
            </h2>
            <p className="l-section-desc">
              {isEn
                ? "Fully replacing disconnected spreadsheets with a unified system — empowering independent scoring, automated progression, and academic reliability analysis."
                : "Thay thế hoàn toàn bảng tính Excel rời rạc bằng hệ thống tập trung — hỗ trợ giám khảo chấm điểm độc lập, tự động hóa thăng vòng và tạo dữ liệu nghiên cứu độ tin cậy đánh giá viên."}
            </p>
          </Reveal>

          <div className="l-feature-grid">
            {features.map((f) => (
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
          <div className="l-eyebrow">{isEn ? "Competition Timeline" : "Lộ trình thi đấu"}</div>
          <h2 className="l-section-title light">
            {isEn ? "3 Stages — One Journey to Excellence" : "3 chặng đua — Một hành trình vươn tầm"}
          </h2>
          <div className="l-timeline">
            {rounds.map((r, i) => (
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
            <div className="l-eyebrow">{isEn ? "Evaluation Criteria" : "Tiêu chí đánh giá"}</div>
            <h2 className="l-section-title">
              {isEn
                ? "Rigorous Standards — Transparent Weighting"
                : "Khung tiêu chí chuẩn mực — Trọng số minh bạch"}
            </h2>
            <p className="l-section-desc">
              {isEn
                ? "Inheriting core Software Engineering department standards with agile adjustments for each competitive stage."
                : "Mỗi sự kiện kế thừa bộ tiêu chí cốt lõi của ngành Phần mềm và tuỳ chỉnh linh hoạt theo từng vòng thi."}
            </p>
          </Reveal>
          <div className="l-criteria-grid">
            {criteria.map((c) => (
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
            <div className="l-eyebrow">{isEn ? "Dedicated Roles" : "Phân quyền chuyên biệt"}</div>
            <h2 className="l-section-title light">
              {isEn ? "One Platform — Every Stakeholder Empowered" : "Một nền tảng — Đầy đủ mọi vai trò"}
            </h2>
            <p className="l-section-desc" style={{ color: "#94a3b8" }}>
              {isEn
                ? "Tailored experiences for every participant with dedicated workspaces and fine-grained permissions."
                : "Trải nghiệm tùy biến chuyên sâu cho từng chủ thể tham gia với giao diện và phân quyền riêng biệt."}
            </p>
          </Reveal>

          {/* Interactive Role Tab Strip */}
          <div className="l-role-tabs-strip">
            {roles.map((r, idx) => (
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
            {roles.map((r, idx) => {
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

      {/* Prizes Section */}
      <section className="l-section l-section-prizes" id="prizes">
        <div className="l-container">
          <Reveal>
            <div className="l-eyebrow">{isEn ? "Prize Structure" : "Cơ cấu giải thưởng"}</div>
            <h2 className="l-section-title">
              {isEn ? "Awards & Official Partners" : "Giải thưởng & Đơn vị đồng hành"}
            </h2>
            <p className="l-section-desc">
              {isEn
                ? "Honoring premier software solutions and connecting talent with leading tech enterprises."
                : "Vinh danh những sản phẩm phần mềm xuất sắc nhất và kết nối thí sinh với doanh nghiệp công nghệ uy tín."}
            </p>
          </Reveal>

          <Reveal className="l-prize-banner">
            <div className="l-prize-amount-col">
              <div className="l-prize-trophy-badge">
                <IconTechTrophy width={38} height={38} />
              </div>
              <div className="l-prize-amount">
                <CountUp target={20} suffix={isEn ? " Million+ VND" : " triệu+ VNĐ"} duration={1.6} />
                <small>
                  {isEn
                    ? "Total cash prizes, trophies & official partner gear"
                    : "Tổng giá trị giải thưởng tiền mặt, cúp & quà tặng hiện vật"}
                </small>
              </div>
              <div className="l-prize-guarantee">
                <span className="l-prize-guarantee-dot" />{" "}
                {isEn
                  ? "Official honors awarded live at Grand Finale Gala"
                  : "Trao thưởng vinh danh tại Đêm Chung kết"}
              </div>
            </div>
            <div className="l-prize-list">
              {prizes.map((p, idx) => (
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
            <div className="l-eyebrow center">
              {isEn ? "Sponsors & Academic Support" : "Đơn vị tài trợ & Hỗ trợ chuyên môn"}
            </div>
            <div className="l-sponsors">
              {sponsors.map((s) => (
                <span className="l-sponsor-chip" key={s}>
                  <IconGift width={16} height={16} />
                  {s}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="l-cta" id="cta">
        <div className="l-container">
          <div className="l-cta-shell">
            <div className="l-cta-content">
              <div className="l-cta-badge">
                <span className="l-cta-live-dot" />
                {isEn ? "SEASON 2026 • REGISTRATION OPEN" : "MÙA THI ĐẤU 2026 • ĐANG MỞ ĐĂNG KÝ"}
              </div>
              <h2 className="l-cta-title">
                {isEn ? (
                  <>
                    Ready to build <br />
                    <span className="l-cta-title-accent">breakthrough tech</span> solutions?
                  </>
                ) : (
                  <>
                    Sẵn sàng kiến tạo <br />
                    <span className="l-cta-title-accent">giải pháp công nghệ</span> đột phá?
                  </>
                )}
              </h2>
              <p className="l-cta-desc">
                {isEn
                  ? "Create your student account, form a team of 3–5, and join the premier academic software competition today."
                  : "Tạo tài khoản sinh viên, thành lập đội thi 3–5 thành viên và gia nhập cuộc đua hackathon lập trình chuyên nghiệp ngay hôm nay."}
              </p>

              <div className="l-cta-perks">
                <div className="l-cta-perk">
                  <span className="l-cta-perk-check">✓</span>
                  <span>
                    {isEn
                      ? "100% Free registration for all eligible student teams"
                      : "Miễn phí 100% lệ phí tham dự cho mọi thí sinh"}
                  </span>
                </div>
                <div className="l-cta-perk">
                  <span className="l-cta-perk-check">✓</span>
                  <span>
                    {isEn
                      ? "Direct live pitch before tech leads & recruiters"
                      : "Trực tiếp thuyết trình trước hội đồng chuyên gia & nhà tuyển dụng"}
                  </span>
                </div>
                <div className="l-cta-perk">
                  <span className="l-cta-perk-check">✓</span>
                  <span>
                    {isEn
                      ? "Official Software Engineering certification provided"
                      : "Cấp giấy chứng nhận kỹ năng phần mềm chính thức"}
                  </span>
                </div>
              </div>

              <div className="l-cta-actions">
                <Link className="l-btn-primary l-cta-btn-glow" to={user ? "/app" : "/register"}>
                  {user
                    ? (isEn ? "Open Control Center" : "Vào bảng điều khiển")
                    : (isEn ? "Register New Account" : "Đăng ký tài khoản mới")}{" "}
                  <IconArrowRight width={16} height={16} />
                </Link>
                <Link className="l-btn-ghost l-cta-btn-ghost" to="/vote">
                  <IconHeart width={16} height={16} /> {isEn ? "Audience Voting" : "Bình chọn khán giả"}
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
                  <span className="l-cta-chip-text">
                    {isEn ? "50+ Competing Teams" : "50+ Đội thi tranh tài"}
                  </span>
                </div>
                <div className="l-cta-chip l-cta-chip-bottom">
                  <span className="l-cta-chip-icon">🏆</span>
                  <span className="l-cta-chip-text">
                    {isEn ? "Total Prize 20M+ VND" : "Tổng thưởng 20Tr+"}
                  </span>
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
            {isEn
              ? "© 2026 SEAL Hackathon — Software Engineering Department (SE Department)."
              : "© 2026 SEAL Hackathon — Ngành Kỹ thuật Phần mềm (SE Department)."}
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
