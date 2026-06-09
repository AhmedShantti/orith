// Order-number generation, phone normalisation, status transitions, and small
// request helpers. Server-side.

import type { NextRequest } from "next/server";

/**
 * Normalise an Egyptian mobile number to the local 11-digit `01XXXXXXXXX`
 * format Paymob's wallet endpoint expects.
 */
export function normalizeEgyptPhone(input: string): string {
  let digits = input.trim().replace(/\s+/g, "");
  if (digits.startsWith("+20")) digits = digits.slice(3);
  else if (digits.startsWith("0020")) digits = digits.slice(4);
  else if (digits.startsWith("20") && digits.length === 12) digits = digits.slice(2);
  if (!digits.startsWith("0")) digits = `0${digits}`;
  return digits;
}

/**
 * Human-readable order number: ORD-YYYY-NNNNNN. The 6-digit suffix is derived
 * from a provided sequence/seed so the caller controls uniqueness (e.g. a DB
 * count or atomic counter). Pass the current order count as `seq`.
 */
export function generateOrderNumber(year: number, seq: number): string {
  const suffix = String(seq % 1_000_000).padStart(6, "0");
  return `ORD-${year}-${suffix}`;
}

/** Extract the best-guess client IP from proxy headers. */
export function getClientIp(request: NextRequest): string | null {
  const fwd = request.headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return request.headers.get("x-real-ip");
}

/** Mask all but the last 4 chars of a wallet number, e.g. "****6789". */
export function maskWalletNumber(phone: string): string {
  const last4 = phone.slice(-4);
  return `****${last4}`;
}

// Statuses from which a payment re-attempt is permitted.
export const RETRYABLE_ORDER_STATUSES = ["PAYMENT_FAILED", "PENDING_PAYMENT"];

export function isRetryableStatus(status: string): boolean {
  return RETRYABLE_ORDER_STATUSES.includes(status);
}
