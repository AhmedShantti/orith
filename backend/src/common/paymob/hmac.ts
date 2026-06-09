// HMAC verification for Paymob callbacks. Injects the secret from the
// environment; pure logic lives in hmacCore.ts.

import { paymobEnv } from "../env";
import { flattenForHmac, verifyHmac } from "./hmacCore";

export { flattenForHmac } from "./hmacCore";

export function verifyPaymobHMAC(
  params: Record<string, string>,
  receivedHmac: string | null | undefined
): boolean {
  return verifyHmac(params, receivedHmac, paymobEnv.hmacSecret);
}

export function verifyCallbackObject(
  obj: Record<string, unknown>,
  receivedHmac: string | null | undefined
): boolean {
  return verifyPaymobHMAC(flattenForHmac(obj), receivedHmac);
}
