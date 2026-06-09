"use client";

import React from "react";
import { Check } from "lucide-react";

export const CHECKOUT_STEPS = [
  "Customer",
  "Shipping",
  "Summary",
  "Payment",
  "Review",
] as const;

interface StepIndicatorProps {
  currentStep: number; // 1-based
  completedSteps: number[];
  onStepClick: (step: number) => void;
}

export default function StepIndicator({
  currentStep,
  completedSteps,
  onStepClick,
}: StepIndicatorProps) {
  return (
    <nav aria-label="Checkout progress" className="w-full">
      {/* Desktop: full labelled track */}
      <ol className="hidden md:flex items-center justify-between">
        {CHECKOUT_STEPS.map((label, idx) => {
          const step = idx + 1;
          const isCurrent = step === currentStep;
          const isCompleted = completedSteps.includes(step) && !isCurrent;
          const isClickable = isCompleted;
          return (
            <li key={label} className="flex items-center flex-1 last:flex-none">
              <button
                type="button"
                disabled={!isClickable}
                aria-current={isCurrent ? "step" : undefined}
                aria-disabled={!isClickable ? "true" : undefined}
                onClick={() => isClickable && onStepClick(step)}
                className={`flex items-center gap-3 ${
                  isClickable ? "cursor-pointer" : "cursor-default"
                }`}
              >
                <span
                  className={`flex items-center justify-center w-9 h-9 rounded-full border text-xs font-body transition-colors ${
                    isCurrent
                      ? "bg-crimson border-crimson text-ivory"
                      : isCompleted
                      ? "bg-crimson/10 border-crimson text-crimson"
                      : "border-obsidian/20 text-obsidian/35"
                  }`}
                >
                  {isCompleted ? <Check size={16} /> : step}
                </span>
                <span
                  className={`text-[11px] tracking-[0.2em] uppercase font-body ${
                    isCurrent
                      ? "text-obsidian"
                      : isCompleted
                      ? "text-obsidian/70"
                      : "text-obsidian/35"
                  }`}
                >
                  {label}
                </span>
              </button>
              {step < CHECKOUT_STEPS.length && (
                <span
                  className={`flex-1 h-px mx-4 ${
                    completedSteps.includes(step) ? "bg-crimson/40" : "bg-obsidian/15"
                  }`}
                  aria-hidden="true"
                />
              )}
            </li>
          );
        })}
      </ol>

      {/* Mobile: dots + current label */}
      <div className="md:hidden">
        <div className="flex items-center justify-center gap-2 mb-3">
          {CHECKOUT_STEPS.map((label, idx) => {
            const step = idx + 1;
            const isCurrent = step === currentStep;
            const isCompleted = completedSteps.includes(step);
            return (
              <button
                key={label}
                type="button"
                disabled={!isCompleted || isCurrent}
                aria-current={isCurrent ? "step" : undefined}
                aria-label={`Step ${step}: ${label}`}
                onClick={() => isCompleted && !isCurrent && onStepClick(step)}
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  isCurrent
                    ? "bg-crimson w-6"
                    : isCompleted
                    ? "bg-crimson/40"
                    : "bg-obsidian/15"
                }`}
              />
            );
          })}
        </div>
        <p className="text-center text-[11px] tracking-[0.2em] uppercase font-body text-obsidian/60">
          Step {currentStep} of {CHECKOUT_STEPS.length} —{" "}
          {CHECKOUT_STEPS[currentStep - 1]}
        </p>
      </div>
    </nav>
  );
}
