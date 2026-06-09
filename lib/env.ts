// SERVER-SIDE ONLY — centralised environment access + validation.
//
// Required secrets throw at access time if missing, with a clear [FATAL]
// message, so misconfiguration fails loudly instead of silently producing
// broken payments.

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(`[FATAL] Missing required environment variable: ${key}`);
  }
  return value;
}

function optionalEnv(key: string, fallback: string): string {
  const value = process.env[key];
  return value && value.length > 0 ? value : fallback;
}

function intEnv(key: string, fallback: number): number {
  const raw = process.env[key];
  if (!raw) return fallback;
  const parsed = parseInt(raw, 10);
  return Number.isFinite(parsed) ? parsed : fallback;
}

// --- Paymob secrets (server-side only, never exposed to the client) ---
export const paymobEnv = {
  get apiKey() {
    return requireEnv("PAYMOB_API_KEY");
  },
  get hmacSecret() {
    return requireEnv("PAYMOB_HMAC_SECRET");
  },
  get mobileWalletIntegrationId() {
    return requireEnv("PAYMOB_MOBILE_WALLET_INTEGRATION_ID");
  },
  get applePayIntegrationId() {
    // Optional: only required if Apple Pay is actually used.
    return optionalEnv("PAYMOB_APPLE_PAY_INTEGRATION_ID", "");
  },
  get applePayIframeId() {
    return optionalEnv("PAYMOB_APPLE_PAY_IFRAME_ID", "");
  },
};

// --- Shipping / commerce config ---
export const commerceEnv = {
  get shippingFeeCairoGiza() {
    return intEnv("SHIPPING_FEE_CAIRO_GIZA", 5000);
  },
  get shippingFeeOther() {
    return intEnv("SHIPPING_FEE_OTHER", 8000);
  },
  get freeShippingThreshold() {
    // NEXT_PUBLIC_ so the client can mirror the messaging; the authoritative
    // calculation still happens server-side.
    return intEnv("NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD", 150000);
  },
  get taxRate() {
    // Reserved for future use; defaults to 0.
    const raw = process.env.TAX_RATE;
    if (!raw) return 0;
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  },
};

export const appEnv = {
  get appUrl() {
    const url = optionalEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    if (process.env.NODE_ENV === "production" && url.startsWith("http://")) {
      throw new Error(
        "[FATAL] NEXT_PUBLIC_APP_URL must use HTTPS in production"
      );
    }
    return url.replace(/\/$/, "");
  },
  get storeName() {
    return optionalEnv("NEXT_PUBLIC_STORE_NAME", "ORITH");
  },
  get isProd() {
    return process.env.NODE_ENV === "production";
  },
};

/**
 * Validate that the critical Paymob env vars are present. Call this from a
 * server entrypoint (e.g. an API route or instrumentation) to fail fast.
 */
export function assertPaymobConfigured(): void {
  paymobEnv.apiKey;
  paymobEnv.hmacSecret;
  paymobEnv.mobileWalletIntegrationId;
}
