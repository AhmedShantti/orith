// Paymob integration constants. No secrets here — integration IDs and keys
// live in environment variables (see lib/env.ts).

export const PAYMOB_BASE_URL = "https://accept.paymob.com/api";

export const PAYMOB_ENDPOINTS = {
  authTokens: `${PAYMOB_BASE_URL}/auth/tokens`,
  ecommerceOrders: `${PAYMOB_BASE_URL}/ecommerce/orders`,
  paymentKeys: `${PAYMOB_BASE_URL}/acceptance/payment_keys`,
  pay: `${PAYMOB_BASE_URL}/acceptance/payments/pay`,
} as const;

export function applePayIframeUrl(iframeId: string, paymentKey: string): string {
  return `${PAYMOB_BASE_URL}/acceptance/iframes/${iframeId}?payment_token=${paymentKey}`;
}

// Auth token lives for 1 hour; cache with a 5-minute safety buffer.
export const PAYMOB_TOKEN_TTL_MS = 55 * 60 * 1000;

// Order field list, in the exact order Paymob expects, used to build the HMAC.
export const PAYMOB_HMAC_FIELDS = [
  "amount_cents",
  "created_at",
  "currency",
  "error_occured",
  "has_parent_transaction",
  "id",
  "integration_id",
  "is_3d_secure",
  "is_auth",
  "is_capture",
  "is_refunded",
  "is_standalone_payment",
  "is_voided",
  "order",
  "owner",
  "pending",
  "source_data.pan",
  "source_data.sub_type",
  "source_data.type",
  "success",
] as const;
