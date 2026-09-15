import type { FC } from "react";

interface SealLogoProps {
  size?: number;
  showText?: boolean;
  className?: string;
  theme?: "light" | "dark";
}

export const SealLogo: FC<SealLogoProps> = ({
  size = 38,
  showText = true,
  className = "",
  theme = "light",
}) => {
  const isDark = theme === "dark";
  return (
    <div
      className={`seal-brand-lockup ${className}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 10,
        textDecoration: "none",
        userSelect: "none",
      }}
    >
      <div
        className="seal-brand-emblem-wrap"
        style={{
          position: "relative",
          width: size,
          height: size,
          flexShrink: 0,
        }}
      >
        <img
          src="/seal-logo-mark.png"
          alt="SEAL Hackathon Emblem"
          width={size}
          height={size}
          style={{
            width: size,
            height: size,
            borderRadius: "50%",
            objectFit: "cover",
            display: "block",
            boxShadow: isDark
              ? "0 2px 14px rgba(229, 169, 103, 0.45)"
              : "0 2px 10px rgba(188, 113, 85, 0.35)",
            border: isDark
              ? "1.5px solid rgba(229, 169, 103, 0.65)"
              : "1.5px solid rgba(229, 169, 103, 0.45)",
          }}
        />
      </div>

      {showText && (
        <div
          className="seal-brand-typography"
          style={{
            display: "flex",
            flexDirection: "column",
            lineHeight: 1.1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
            <span
              className="seal-brand-name"
              style={{
                fontFamily: "var(--font-heading, inherit)",
                fontWeight: 900,
                fontSize: Math.round(size * 0.44),
                letterSpacing: "-0.6px",
                color: isDark ? "#FFFFFF" : "var(--color-text, var(--color-deep-ink, #000D10))",
              }}
            >
              SEAL
            </span>
            <span
              className="seal-brand-dot"
              style={{
                width: Math.max(4, Math.round(size * 0.14)),
                height: Math.max(4, Math.round(size * 0.14)),
                borderRadius: "50%",
                background: "linear-gradient(135deg, #bc7155, #e5a967)",
                display: "inline-block",
                boxShadow: "0 0 6px rgba(229, 169, 103, 0.6)",
              }}
            />
          </div>
          <span
            className="seal-brand-tag"
            style={{
              fontSize: Math.max(9, Math.round(size * 0.23)),
              fontWeight: 800,
              letterSpacing: "0.14em",
              textTransform: "uppercase",
              color: isDark ? "#e5a967" : "var(--color-clay-ember, #bc7155)",
            }}
          >
            HACKATHON
          </span>
        </div>
      )}
    </div>
  );
};
