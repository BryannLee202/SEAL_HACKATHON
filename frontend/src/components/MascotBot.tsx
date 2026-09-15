import { useState, useEffect } from "react";

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
  const src = isHero ? "/seal-mascot-hero.png" : "/seal-mascot-avatar.jpg";
  const [returned, setReturned] = useState(false);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setReturned(true);
        const timer = setTimeout(() => setReturned(false), 1400);
        return () => clearTimeout(timer);
      }
    };
    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, []);

  if (isHero) {
    return (
      <div
        className={`mascot-hero-stage ${returned ? "mascot-tab-return" : ""} ${className}`.trim()}
        style={{
          position: "relative",
          display: "inline-flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          width: size,
          maxWidth: "100%",
        }}
        role="img"
        aria-label="Mascot SEAL Hackathon"
      >
        <img
          src={src}
          alt="SEAL Hackathon Robotic Companion"
          className="mascot-hero-seamless"
          style={{
            width: "100%",
            height: "auto",
            objectFit: "contain",
            userSelect: "none",
            pointerEvents: "auto",
          }}
        />
        <div className="l-flight-shadow" />
      </div>
    );
  }

  return (
    <div
      className={`mascot-avatar-container ${className}`.trim()}
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        borderRadius: "50%",
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
          objectFit: "cover",
        }}
      />
    </div>
  );
}
