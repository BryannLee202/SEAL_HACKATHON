import { useEffect, useRef, useState } from "react";

export function CountUp({
  target,
  duration = 2,
  suffix = "",
  locale = "vi-VN",
}: {
  target: number;
  duration?: number;
  suffix?: string;
  locale?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(() => Math.floor(target).toLocaleString(locale));
  const prevTargetRef = useRef(target);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      setDisplay(Math.floor(target).toLocaleString(locale));
      return;
    }

    let isCancelled = false;
    const startVal = prevTargetRef.current;
    prevTargetRef.current = target;

    const startTime = performance.now();
    const durationMs = duration * 1000;

    const step = (now: number) => {
      if (isCancelled) return;
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / durationMs, 1);
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(startVal + easeOut * (target - startVal));
      setDisplay(current.toLocaleString(locale));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setDisplay(Math.floor(target).toLocaleString(locale));
      }
    };

    requestAnimationFrame(step);

    return () => {
      isCancelled = true;
    };
  }, [target, duration, locale]);

  return (
    <span ref={ref}>
      {display}
      {suffix}
    </span>
  );
}
