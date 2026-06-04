"use client";
import React, { useEffect, useRef, useState } from "react";

/**
 * Scroll-reveal wrapper. Children fade/slide in once they enter the viewport.
 * Pure CSS classes (.reveal / .is-in) do the animating — see globals.css.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  once = true,
}: {
  children: React.ReactNode;
  className?: string;
  /** stagger index 1–4 → maps to .reveal-d1..d4 */
  delay?: 0 | 1 | 2 | 3 | 4;
  once?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [shown, setShown] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setShown(true);
            if (once) obs.unobserve(e.target);
          } else if (!once) {
            setShown(false);
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -8% 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [once]);

  const delayClass = delay ? ` reveal-d${delay}` : "";

  return (
    <div
      ref={ref}
      className={`reveal${delayClass}${shown ? " is-in" : ""} ${className}`}
    >
      {children}
    </div>
  );
}
