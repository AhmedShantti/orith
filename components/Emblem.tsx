import React from "react";

/**
 * ORITH brand emblem — the woven starburst of crossed, gently curved strokes
 * from the brand book. Uses `currentColor`, so set the color via `className`
 * (e.g. text-gold, text-white). `size` controls the square dimension in px.
 */
export default function Emblem({
  size = 28,
  className = "",
  strokeWidth = 1.4,
}: {
  size?: number;
  className?: string;
  strokeWidth?: number;
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden
    >
      <g
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        fill="none"
      >
        {/* vertical bowed ray */}
        <path d="M32 5 C 36 21, 28 43, 32 59" />
        {/* horizontal bowed ray */}
        <path d="M5 30 C 23 35, 41 27, 59 32" />
        {/* diagonal ray ↘ */}
        <path d="M13 16 C 27 26, 37 38, 51 49" />
        {/* diagonal ray ↙ */}
        <path d="M51 15 C 37 27, 27 37, 13 49" />
        {/* short accent rays for the denser center burst */}
        <path d="M32 16 C 33 24, 31 30, 32 36" />
        <path d="M22 32 C 28 33, 36 31, 42 32" />
      </g>
    </svg>
  );
}
