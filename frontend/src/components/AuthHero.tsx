import type { FC } from "react";
import { Link } from "react-router-dom";
import { SealLogo } from "./SealLogo";
import { useLanguage } from "../context/LanguageContext";
import {
  IconTechBracket,
  IconTechScoring,
  IconTechAudit,
} from "./icons";

interface AuthHeroProps {
  title?: string;
  subtitle?: string;
}

export const AuthHero: FC<AuthHeroProps> = ({
  title,
  subtitle,
}) => {
  const { language } = useLanguage();
  const isEn = language === "en";

  const defaultTitle = isEn
    ? "Transparent, rubric-driven Hackathon evaluation."
    : "Chấm điểm hackathon minh bạch, theo từng tiêu chí.";
  const defaultSubtitle = isEn
    ? "Comprehensive digital system for SEAL Hackathon: multi-round management, independent rubric scoring, and immutable audit trails."
    : "Hệ thống số hoá toàn diện SEAL Hackathon: Quản lý vòng thi, chấm điểm đa tiêu chí độc lập và kiểm toán minh bạch.";

  const heroTitle = title || defaultTitle;
  const heroSubtitle = subtitle || defaultSubtitle;

  return (
    <div className="auth-hero">
      <div>
        <Link to="/" className="auth-hero-brand" style={{ textDecoration: "none" }}>
          <SealLogo size={42} showText={true} theme="dark" />
        </Link>

        <h2 className="auth-hero-title">
          {heroTitle.includes("Chấm điểm") || heroTitle.includes("rubric-driven") ? (
            isEn ? (
              <>
                Hackathon evaluation <br />
                <span style={{ color: "#e5a967" }}>transparent &amp; rigorous</span> rubric by rubric.
              </>
            ) : (
              <>
                Chấm điểm hackathon <br />
                <span style={{ color: "#e5a967" }}>minh bạch &amp; công bằng</span> theo tiêu chí.
              </>
            )
          ) : (
            heroTitle
          )}
        </h2>

        <p className="auth-hero-subtitle">{heroSubtitle}</p>

        {/* Competition Showcase Visual Card */}
        <div className="auth-hero-showcase">
          <div className="auth-showcase-img-wrap">
            <img
              src="/images/auth-hackathon.jpg"
              alt="SEAL Hackathon Competition Arena"
              className="auth-showcase-img"
              loading="eager"
            />
            <div className="auth-showcase-overlay" />
            <div className="auth-showcase-live-badge">
              <span className="auth-live-dot" />
              SEAL HACKATHON 2026 • ARENA
            </div>
            <div className="auth-showcase-caption">
              <div className="auth-showcase-caption-title">
                {isEn ? "Software Engineering Technology Arena" : "Đấu trường Công nghệ Kỹ thuật Phần mềm"}
              </div>
              <div className="auth-showcase-caption-desc">
                {isEn
                  ? "Over 50 teams competing to solve real-world industry problems"
                  : "Hơn 50 đội thi tranh tài giải quyết bài toán thực tế"}
              </div>
            </div>
          </div>
        </div>

        {/* Feature Highlights with tech icons */}
        <div className="auth-hero-features">
          <div className="auth-hero-feature">
            <span className="dot">
              <IconTechBracket width={15} height={15} />
            </span>
            <span>
              {isEn
                ? "3-Stage competition roadmap & automated advancement"
                : "Lộ trình thi đấu 3 vòng & thăng hạng tự động"}
            </span>
          </div>
          <div className="auth-hero-feature">
            <span className="dot">
              <IconTechScoring width={15} height={15} />
            </span>
            <span>
              {isEn
                ? "Independent multi-criteria scoring & RBL analysis"
                : "Chấm điểm đa tiêu chí độc lập & phân tích RBL"}
            </span>
          </div>
          <div className="auth-hero-feature">
            <span className="dot">
              <IconTechAudit width={15} height={15} />
            </span>
            <span>
              {isEn
                ? "Immutable audit logging ensuring absolute integrity"
                : "Nhật ký kiểm toán (Audit Log) ghi nhận bất biến"}
            </span>
          </div>
        </div>
      </div>

      <div className="auth-hero-footer">
        <Link to="/" className="auth-back-link">
          {isEn ? "← Back to SEAL Hackathon Home" : "← Quay lại trang chủ SEAL Hackathon"}
        </Link>
      </div>
    </div>
  );
};
