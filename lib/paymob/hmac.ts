// SERVER-SIDE ONLY — never import in client components.
//
// Thin wrapper that injects the HMAC secret from the environment. The pure
// logic (field ordering, hashing, constant-time compare) lives in hmacCore.ts
// so it can be unit-tested without the server-only guard.

import "server-only";
import { paymobEnv } from "../env";
import { flattenForHmac, verifyHmac } from "./hmacCore";

export { flattenForHmac } from "./hmacCore";

/** Verify a flattened param map against the received hmac. */
export function verifyPaymobHMAC(
  params: Record<string, string>,
  receivedHmac: string | null | undefined
): boolean {
  return verifyHmac(params, receivedHmac, paymobEnv.hmacSecret);
}

/** Verify a callback given the raw transaction object and received hmac. */
export function verifyCallbackObject(
  obj: Record<string, unknown>,
  receivedHmac: string | null | undefined
): boolean {
  return verifyPaymobHMAC(flattenForHmac(obj), receivedHmac);
}
