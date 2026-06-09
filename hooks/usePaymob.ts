"use client";

// Payment initiation + verification hook. Talks to /api/payments/* and drives
// the redirect / iframe flow. Server-side only modules (Paymob client) are
// never imported here — this is purely the client orchestration.

import { apiUrl } from "@/lib/api";
import { useCallback, useRef, useState } from "react";
import type { PaymentMethod } from "@/types/order";
import type { PaymentVerifyResult } from "@/types/payment";

export interface InitiateResult {
  success: boolean;
  redirectUrl?: string;
  iframeUrl?: string;
  paymentKey?: string;
  orderId?: string;
  message?: string;
}

export function usePaymob() {
  const [isInitiating, setIsInitiating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const initiate = useCallback(
    async (
      orderId: string,
      paymentMethod: PaymentMethod,
      walletPhone?: string
    ): Promise<InitiateResult> => {
      setIsInitiating(true);
      setError(null);
      try {
        const res = await fetch(apiUrl("/api/payments/initiate"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId, paymentMethod, walletPhone }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          const message =
            data?.message ||
            "We couldn't connect to the payment provider. Please try again in a few moments.";
          setError(message);
          return { success: false, message };
        }
        return {
          success: true,
          redirectUrl: data.redirectUrl,
          iframeUrl: data.iframeUrl,
          paymentKey: data.paymentKey,
          orderId: data.orderId,
        };
      } catch {
        const message =
          "Connection error. Please check your internet and try again.";
        setError(message);
        return { success: false, message };
      } finally {
        setIsInitiating(false);
      }
    },
    []
  );

  return { initiate, isInitiating, error };
}

/**
 * Verify a transaction's final status, polling while PENDING.
 * Polls every `intervalMs` up to `maxAttempts` times.
 */
export function usePaymentVerification() {
  const cancelled = useRef(false);

  const verifyOnce = useCallback(
    async (transactionId: string): Promise<PaymentVerifyResult> => {
      try {
        const res = await fetch(
          apiUrl(`/api/payments/verify/${encodeURIComponent(transactionId)}`),
          { cache: "no-store" }
        );
        return (await res.json()) as PaymentVerifyResult;
      } catch {
        return { status: "NOT_FOUND" };
      }
    },
    []
  );

  const verifyWithPolling = useCallback(
    async (
      transactionId: string,
      opts: { intervalMs?: number; maxAttempts?: number } = {}
    ): Promise<PaymentVerifyResult> => {
      const intervalMs = opts.intervalMs ?? 3000;
      const maxAttempts = opts.maxAttempts ?? 5;
      cancelled.current = false;

      let last: PaymentVerifyResult = { status: "PENDING" };
      for (let attempt = 0; attempt < maxAttempts; attempt++) {
        if (cancelled.current) break;
        last = await verifyOnce(transactionId);
        if (last.status !== "PENDING") return last;
        if (attempt < maxAttempts - 1) {
          await new Promise((r) => setTimeout(r, intervalMs));
        }
      }
      return last;
    },
    [verifyOnce]
  );

  const cancel = useCallback(() => {
    cancelled.current = true;
  }, []);

  return { verifyOnce, verifyWithPolling, cancel };
}
