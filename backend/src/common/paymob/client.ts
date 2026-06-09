// SERVER-SIDE ONLY — never import in client components.
//
// Thin, typed wrapper around the Paymob Accept API. Handles auth-token caching,
// order creation, payment-key generation, and wallet pay requests.

import { paymobEnv } from "../env";
import {
  PAYMOB_ENDPOINTS,
  PAYMOB_TOKEN_TTL_MS,
} from "./constants";
import {
  PaymobOrderParams,
  PaymobOrderResponse,
  PaymobPaymentKeyParams,
  PaymobWalletResponse,
} from "./types";

export class PaymobAPIError extends Error {
  readonly statusCode: number;
  readonly detail: unknown;
  constructor(message: string, statusCode: number, detail?: unknown) {
    super(message);
    this.name = "PaymobAPIError";
    this.statusCode = statusCode;
    this.detail = detail;
  }
}

function logError(context: string, message: string): void {
  // Never log API keys / tokens.
  console.error(
    `[${new Date().toISOString()}] [ERROR] [Paymob:${context}]: ${message}`
  );
}

// TODO: Replace in-memory token cache with Redis in multi-instance deployment.
let cachedToken: { value: string; expiresAt: number } | null = null;

export class PaymobClient {
  private get apiKey(): string {
    return paymobEnv.apiKey;
  }

  private async post<T>(
    url: string,
    body: Record<string, unknown>,
    context: string
  ): Promise<T> {
    let res: Response;
    try {
      res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
        cache: "no-store",
      });
    } catch (err) {
      logError(context, err instanceof Error ? err.message : "network error");
      throw new PaymobAPIError("Paymob request failed", 502);
    }

    if (!res.ok) {
      let detail: unknown = undefined;
      try {
        detail = await res.json();
      } catch {
        /* ignore body parse errors */
      }
      logError(context, `HTTP ${res.status}`);
      throw new PaymobAPIError(
        `Paymob ${context} returned ${res.status}`,
        res.status === 401 ? 502 : res.status,
        detail
      );
    }

    return (await res.json()) as T;
  }

  /** Step 1 — auth token (cached for ~55 min). */
  async getAuthToken(): Promise<string> {
    const now = Date.now();
    if (cachedToken && cachedToken.expiresAt > now) {
      return cachedToken.value;
    }
    const data = await this.post<{ token: string }>(
      PAYMOB_ENDPOINTS.authTokens,
      { api_key: this.apiKey },
      "getAuthToken"
    );
    if (!data.token) {
      throw new PaymobAPIError("No token in auth response", 502);
    }
    cachedToken = { value: data.token, expiresAt: now + PAYMOB_TOKEN_TTL_MS };
    return data.token;
  }

  /** Step 2 — register an order with Paymob. */
  async createOrder(
    authToken: string,
    params: PaymobOrderParams
  ): Promise<PaymobOrderResponse> {
    return this.post<PaymobOrderResponse>(
      PAYMOB_ENDPOINTS.ecommerceOrders,
      {
        auth_token: authToken,
        delivery_needed: false,
        amount_cents: params.amountCents,
        currency: params.currency,
        merchant_order_id: params.merchantOrderId,
        items: params.items,
        shipping_data: params.shippingData,
      },
      "createOrder"
    );
  }

  /** Step 3 — payment key for a registered order. */
  async getPaymentKey(params: PaymobPaymentKeyParams): Promise<string> {
    const data = await this.post<{ token: string }>(
      PAYMOB_ENDPOINTS.paymentKeys,
      {
        auth_token: params.authToken,
        amount_cents: params.amountCents,
        expiration: params.expiration ?? 3600,
        order_id: params.orderId,
        billing_data: params.billingData,
        currency: params.currency,
        integration_id: params.integrationId,
      },
      "getPaymentKey"
    );
    if (!data.token) {
      throw new PaymobAPIError("No payment key in response", 502);
    }
    return data.token;
  }

  /** Step 4 (mobile wallet) — pay request, returns a redirect URL for OTP. */
  async initiateWalletPayment(
    paymentToken: string,
    walletPhone: string
  ): Promise<PaymobWalletResponse> {
    return this.post<PaymobWalletResponse>(
      PAYMOB_ENDPOINTS.pay,
      {
        source: { identifier: walletPhone, subtype: "WALLET" },
        payment_token: paymentToken,
      },
      "initiateWalletPayment"
    );
  }
}

export const paymobClient = new PaymobClient();
