// Pure HMAC logic for Paymob callbacks — NO secret access, NO server-only
// guard, so it is unit-testable in plain Node. The server-only wrapper lives in
// hmac.ts and injects the secret from the environment.

import crypto from "crypto";
import { PAYMOB_HMAC_FIELDS } from "./constants";

/** Flatten a nested object into dotted keys (e.g. `source_data.pan`). */
export function flattenForHmac(
  obj: Record<string, unknown>
): Record<string, string> {
  const out: Record<string, string> = {};
  const walk = (node: unknown, prefix: string) => {
    if (node === null || node === undefined) return;
    if (typeof node === "object" && !Array.isArray(node)) {
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        walk(v, prefix ? `${prefix}.${k}` : k);
      }
    } else {
      out[prefix] = String(node);
    }
  };
  walk(obj, "");
  return out;
}

/** Paymob serialises booleans as lowercase in the HMAC source. */
function booleanToString(value: string): string {
  if (value === "True") return "true";
  if (value === "False") return "false";
  return value;
}

export function computeHmac(
  params: Record<string, string>,
  secret: string
): string {
  const concatenated = PAYMOB_HMAC_FIELDS.map((field) =>
    booleanToString(params[field] ?? "")
  ).join("");
  return crypto.createHmac("sha512", secret).update(concatenated).digest("hex");
}

/** Constant-time verification of a received HMAC against the computed one. */
export function verifyHmac(
  params: Record<string, string>,
  receivedHmac: string | null | undefined,
  secret: string
): boolean {
  if (!receivedHmac) return false;
  const computed = computeHmac(params, secret);
  const a = Buffer.from(computed, "utf8");
  const b = Buffer.from(receivedHmac, "utf8");
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
