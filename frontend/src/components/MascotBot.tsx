interface MascotBotProps {
  size?: number;
  className?: string;
  variant?: "hero" | "avatar" | "auto";
}

/**
 * Official Mascot for SEAL Hackathon:
 * A high-end, futuristic robotic seal companion crafted from matte ceramic white,
 * obsidian visor, and brushed terracotta clay accents (#bc7155).
 * Matches the Hyer Aviation luxury editorial tech design system.
 */
export function MascotBot({
  size = 220,
  className = "",
  variant = "auto",
}: MascotBotProps) {
  const isHero = variant === "hero" || (variant === "auto" && size >= 150);
  const src = isHero ? "/seal-mascot-hero.jpg" : "/seal-mascot-avatar.jpg";

  return (
    <div
      className={`mascot-bot-container ${className}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: isHero ? "4px" : "50%",
        overflow: "hidden",
      }}
      role="img"
      aria-label="Mascot SEAL Hackathon"
    >
      <img
        src={src}
        alt="SEAL Hackathon Robotic Companion"
        style={{
          width: "100%",
          height: "100%",
          objectFit: "contain",
          filter: isHero
            ? "drop-shadow(0 12px 24px rgba(0, 13, 16, 0.08))"
            : "none",
          transition: "transform 0.25s ease",
        }}
      />
    </div>
  );
}
