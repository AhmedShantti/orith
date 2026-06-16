"use client";
import React from "react";
import { MAX_RATING } from "@/lib/product";

interface StarRatingProps {
  /** Rating value, 0–5. Half values render half-filled stars. */
  value: number;
  /** Visual size of each star in px. */
  size?: number;
  /** Accessible label, e.g. "Rated 4.5 out of 5". */
  label?: string;
  className?: string;
}

/**
 * Presentational star rating. Renders `MAX_RATING` stars, filling each one
 * fully, half, or not at all based on `value`. Uses a per-star clipped overlay
 * so half stars are pixel-accurate. Purely decorative markup is hidden from
 * assistive tech; a single `aria-label` conveys the value.
 */
function StarRating({ value, size = 13, label, className = "" }: StarRatingProps) {
  const clamped = Math.min(MAX_RATING, Math.max(0, value));

  return (
    <div
      className={`inline-flex items-center gap-1 ${className}`}
      role="img"
      aria-label={label ?? `Rated ${clamped} out of ${MAX_RATING}`}
    >
      {Array.from({ length: MAX_RATING }, (_, i) => {
        const fill = Math.min(1, Math.max(0, clamped - i)); // 0, 0.5-ish, or 1
        return <Star key={i} size={size} fill={fill} />;
      })}
    </div>
  );
}

function Star({ size, fill }: { size: number; fill: number }) {
  const path =
    "M12 2.2l2.95 5.98 6.6.96-4.78 4.66 1.13 6.57L12 17.27l-5.9 3.1 1.13-6.57L2.45 9.14l6.6-.96L12 2.2z";
  const pct = `${Math.round(fill * 100)}%`;

  return (
    <span
      className="relative inline-block leading-none"
      style={{ width: size, height: size }}
      aria-hidden="true"
    >
      {/* Empty outline */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        className="absolute inset-0 text-sand-dark/45"
      >
        <path d={path} />
      </svg>
      {/* Filled portion, clipped to the rating fraction */}
      <span
        className="absolute inset-0 overflow-hidden"
        style={{ width: pct }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 24 24"
          fill="currentColor"
          className="text-sand-dark"
        >
          <path d={path} />
        </svg>
      </span>
    </span>
  );
}

export default React.memo(StarRating);
