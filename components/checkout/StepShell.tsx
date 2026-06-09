"use client";

import React from "react";
import { Spinner } from "./ui";

interface StepShellProps {
  eyebrow: string;
  title: string;
  children: React.ReactNode;
  showBack?: boolean;
  onBack?: () => void;
  continueLabel: string;
  onContinue: () => void;
  continueDisabled?: boolean;
  continueLoading?: boolean;
  loadingLabel?: string;
}

export default function StepShell({
  eyebrow,
  title,
  children,
  showBack = true,
  onBack,
  continueLabel,
  onContinue,
  continueDisabled = false,
  continueLoading = false,
  loadingLabel,
}: StepShellProps) {
  return (
    <section>
      <header className="mb-8">
        <p className="eyebrow text-crimson mb-3">{eyebrow}</p>
        <h2 className="display text-3xl sm:text-4xl text-obsidian" style={{ fontWeight: 500 }}>
          {title}
        </h2>
      </header>

      <div className="mb-10">{children}</div>

      <div className="flex flex-col-reverse sm:flex-row items-center gap-3 sm:gap-4">
        {showBack && (
          <button
            type="button"
            onClick={onBack}
            className="btn-ghost text-obsidian w-full sm:w-auto"
          >
            ← Back
          </button>
        )}
        <button
          type="button"
          onClick={onContinue}
          disabled={continueDisabled || continueLoading}
          aria-disabled={continueDisabled || continueLoading ? "true" : undefined}
          className="btn-crimson w-full sm:flex-1 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {continueLoading ? (
            <>
              <Spinner />
              <span aria-live="polite">{loadingLabel ?? "Processing…"}</span>
            </>
          ) : (
            continueLabel
          )}
        </button>
      </div>
    </section>
  );
}
