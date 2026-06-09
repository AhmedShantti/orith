"use client";

// Shared, light-themed form primitives for the checkout flow. Styled to match
// the storefront design system (ivory surfaces, crimson accent, Jost body,
// hairline borders). Fully accessible: labels, aria-describedby, aria-invalid.

import React from "react";

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      role="status"
      aria-live="polite"
      className={`inline-block w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin ${className}`}
    />
  );
}

const labelClass =
  "block text-[11px] tracking-[0.18em] uppercase text-obsidian/55 font-body mb-2";
const baseInputClass =
  "w-full bg-white border border-obsidian/15 px-4 py-3 text-sm font-body text-obsidian placeholder:text-obsidian/30 transition-colors focus:outline-none focus:border-crimson";
const errorInputClass = "border-crimson/70";

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} className="mt-1.5 text-xs text-crimson font-body" role="alert">
      {message}
    </p>
  );
}

interface BaseFieldProps {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  hint?: string;
}

interface TextFieldProps
  extends BaseFieldProps,
    Omit<React.InputHTMLAttributes<HTMLInputElement>, "id"> {}

export function TextField({
  id,
  label,
  error,
  required,
  hint,
  className = "",
  ...rest
}: TextFieldProps) {
  const errorId = `${id}-error`;
  const hintId = `${id}-hint`;
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="text-crimson ms-1">*</span>}
      </label>
      <input
        id={id}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={
          [error ? errorId : null, hint ? hintId : null]
            .filter(Boolean)
            .join(" ") || undefined
        }
        className={`${baseInputClass} ${error ? errorInputClass : ""}`}
        {...rest}
      />
      {hint && !error && (
        <p id={hintId} className="mt-1.5 text-xs text-obsidian/40 font-body">
          {hint}
        </p>
      )}
      <FieldError id={errorId} message={error} />
    </div>
  );
}

interface SelectFieldProps
  extends BaseFieldProps,
    Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "id"> {
  options: ReadonlyArray<string>;
  placeholder?: string;
}

export function SelectField({
  id,
  label,
  error,
  required,
  options,
  placeholder,
  className = "",
  ...rest
}: SelectFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="text-crimson ms-1">*</span>}
      </label>
      <select
        id={id}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${baseInputClass} ${error ? errorInputClass : ""} appearance-none bg-white`}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((opt) => (
          <option key={opt} value={opt}>
            {opt}
          </option>
        ))}
      </select>
      <FieldError id={errorId} message={error} />
    </div>
  );
}

interface TextAreaFieldProps
  extends BaseFieldProps,
    Omit<React.TextareaHTMLAttributes<HTMLTextAreaElement>, "id"> {}

export function TextAreaField({
  id,
  label,
  error,
  required,
  className = "",
  ...rest
}: TextAreaFieldProps) {
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <label htmlFor={id} className={labelClass}>
        {label}
        {required && <span className="text-crimson ms-1">*</span>}
      </label>
      <textarea
        id={id}
        aria-invalid={error ? "true" : undefined}
        aria-describedby={error ? errorId : undefined}
        className={`${baseInputClass} ${error ? errorInputClass : ""} resize-none`}
        {...rest}
      />
      <FieldError id={errorId} message={error} />
    </div>
  );
}
