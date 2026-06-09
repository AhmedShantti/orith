// Centralised environment access + validation for the backend. Required secrets
// throw a clear [FATAL] error the first time they're read.

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
    return optionalEnv("PAYMOB_APPLE_PAY_INTEGRATION_ID", "");
  },
  get applePayIframeId() {
    return optionalEnv("PAYMOB_APPLE_PAY_IFRAME_ID", "");
  },
};

export const commerceEnv = {
  get shippingFeeCairoGiza() {
    return intEnv("SHIPPING_FEE_CAIRO_GIZA", 5000);
  },
  get shippingFeeOther() {
    return intEnv("SHIPPING_FEE_OTHER", 8000);
  },
  get freeShippingThreshold() {
    return intEnv("NEXT_PUBLIC_FREE_SHIPPING_THRESHOLD", 150000);
  },
  get taxRate() {
    const raw = process.env.TAX_RATE;
    if (!raw) return 0;
    const parsed = parseFloat(raw);
    return Number.isFinite(parsed) ? parsed : 0;
  },
};

export const appEnv = {
  get appUrl() {
    const url = optionalEnv("NEXT_PUBLIC_APP_URL", "http://localhost:3000");
    return url.replace(/\/$/, "");
  },
  get storeName() {
    return optionalEnv("NEXT_PUBLIC_STORE_NAME", "ORITH");
  },
  get isProd() {
    return process.env.NODE_ENV === "production";
  },
};

export function assertPaymobConfigured(): void {
  paymobEnv.apiKey;
  paymobEnv.hmacSecret;
  paymobEnv.mobileWalletIntegrationId;
}
