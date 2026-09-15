import type { FC } from "react";
import { Link } from "react-router-dom";
import { SealLogo } from "./SealLogo";
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
  title = "Chấm điểm hackathon minh bạch, theo từng tiêu chí.",
  subtitle = "Hệ thống số hoá toàn diện SEAL Hackathon: Quản lý vòng thi, chấm điểm đa tiêu chí độc lập và kiểm toán minh bạch.",
}) => {
  return (
    <div className="auth-hero">
      <div>
        <Link to="/" className="auth-hero-brand" style={{ textDecoration: "none" }}>
          <SealLogo size={42} showText={true} theme="dark" />
        </Link>

        <h2 className="auth-hero-title">
          {title.includes("Chấm điểm") ? (
            <>
              Chấm điểm hackathon <br />
              <span style={{ color: "#e5a967" }}>minh bạch &amp; công bằng</span> theo tiêu chí.
            </>
          ) : (
            title
          )}
        </h2>

        <p className="auth-hero-subtitle">{subtitle}</p>

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
                Đấu trường Công nghệ Kỹ thuật Phần mềm
              </div>
              <div className="auth-showcase-caption-desc">
                Hơn 50 đội thi tranh tài giải quyết bài toán thực tế
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
            <span>Lộ trình thi đấu 3 vòng &amp; thăng hạng tự động</span>
          </div>
          <div className="auth-hero-feature">
            <span className="dot">
              <IconTechScoring width={15} height={15} />
            </span>
            <span>Chấm điểm đa tiêu chí độc lập &amp; phân tích RBL</span>
          </div>
          <div className="auth-hero-feature">
            <span className="dot">
              <IconTechAudit width={15} height={15} />
            </span>
            <span>Nhật ký kiểm toán (Audit Log) ghi nhận bất biến</span>
          </div>
        </div>
      </div>

      <div className="auth-hero-footer">
        <Link to="/" className="auth-back-link">
          ← Quay lại trang chủ SEAL Hackathon
        </Link>
      </div>
    </div>
  );
};
