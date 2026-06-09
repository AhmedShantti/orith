// Order-number generation, phone normalisation, status transitions, and small
// request helpers (Express variant).

import type { Request } from "express";

export function normalizeEgyptPhone(input: string): string {
  let digits = input.trim().replace(/\s+/g, "");
  if (digits.startsWith("+20")) digits = digits.slice(3);
  else if (digits.startsWith("0020")) digits = digits.slice(4);
  else if (digits.startsWith("20") && digits.length === 12) digits = digits.slice(2);
  if (!digits.startsWith("0")) digits = `0${digits}`;
  return digits;
}

export function generateOrderNumber(year: number, seq: number): string {
  const suffix = String(seq % 1_000_000).padStart(6, "0");
  return `ORD-${year}-${suffix}`;
}

export function getClientIp(req: Request): string | null {
  const fwd = req.headers["x-forwarded-for"];
  if (typeof fwd === "string" && fwd.length) return fwd.split(",")[0].trim();
  if (Array.isArray(fwd) && fwd.length) return fwd[0];
  const real = req.headers["x-real-ip"];
  if (typeof real === "string") return real;
  return req.ip ?? null;
}

export function maskWalletNumber(phone: string): string {
  return `****${phone.slice(-4)}`;
}

export const RETRYABLE_ORDER_STATUSES = ["PAYMENT_FAILED", "PENDING_PAYMENT"];

export function isRetryableStatus(status: string): boolean {
  return RETRYABLE_ORDER_STATUSES.includes(status);
}

/** Parse cookies from the raw Cookie header (avoids a cookie-parser dep). */
export function parseCookies(req: Request): Record<string, string> {
  const header = req.headers["cookie"];
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const idx = part.indexOf("=");
    if (idx === -1) continue;
    const k = part.slice(0, idx).trim();
    const v = part.slice(idx + 1).trim();
    if (k) out[k] = decodeURIComponent(v);
  }
  return out;
}
