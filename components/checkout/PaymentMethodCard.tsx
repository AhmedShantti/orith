"use client";

import React from "react";

interface PaymentMethodCardProps {
  id: string;
  label: string;
  sublabel: string;
  icon: React.ReactNode;
  isSelected: boolean;
  isAvailable: boolean;
  onSelect: () => void;
  ariaLabel?: string;
}

export default function PaymentMethodCard({
  id,
  label,
  sublabel,
  icon,
  isSelected,
  isAvailable,
  onSelect,
  ariaLabel,
}: PaymentMethodCardProps) {
  if (!isAvailable) return null;

  return (
    <button
      type="button"
      role="radio"
      aria-checked={isSelected}
      aria-label={ariaLabel ?? `Pay with ${label}`}
      id={`pay-${id}`}
      onClick={onSelect}
      className={`w-full flex items-center gap-4 p-5 border text-start transition-all duration-300 ${
        isSelected
          ? "border-crimson bg-crimson/[0.04] shadow-[0_4px_20px_rgba(142,27,38,0.08)]"
          : "border-obsidian/15 bg-white hover:border-obsidian/30 hover:shadow-sm"
      }`}
    >
      {/* Radio dot */}
      <span
        className={`shrink-0 w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
          isSelected ? "border-crimson" : "border-obsidian/30"
        }`}
        aria-hidden="true"
      >
        {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-crimson" />}
      </span>

      {/* Icon */}
      <span className="shrink-0 text-obsidian/70" aria-hidden="true">
        {icon}
      </span>

      {/* Labels */}
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-body text-obsidian">{label}</span>
        <span className="block text-xs font-body text-obsidian/50 mt-0.5">
          {sublabel}
        </span>
      </span>
    </button>
  );
}
