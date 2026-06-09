"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { usePaymentVerification } from "@/hooks/usePaymob";
import { Spinner } from "@/components/checkout/ui";
import { CHECKOUT_STATE_KEY } from "@/lib/checkout/constants";
import type { PaymentVerifyResult } from "@/types/payment";

function SuccessContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { clearCart } = useCart();
  const { verifyWithPolling } = usePaymentVerification();

  const transactionId =
    params.get("transaction_id") || params.get("id") || "";
  const [phase, setPhase] = useState<"verifying" | "paid" | "pending">(
    "verifying"
  );
  const [result, setResult] = useState<PaymentVerifyResult | null>(null);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;

    if (!transactionId) {
      router.replace("/");
      return;
    }

    verifyWithPolling(transactionId).then((res) => {
      setResult(res);
      if (res.status === "PAID") {
        clearCart();
        try {
          sessionStorage.removeItem(CHECKOUT_STATE_KEY);
        } catch {
          /* ignore */
        }
        setPhase("paid");
      } else if (res.status === "PENDING") {
        setPhase("pending");
      } else {
        router.replace(
          `/payment/failure?transaction_id=${encodeURIComponent(transactionId)}`
        );
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  // Auto-forward to the full confirmation a few seconds after success.
  useEffect(() => {
    if (phase !== "paid" || !result?.orderId) return;
    const t = setTimeout(() => {
      router.push(`/order/${result.orderId}/confirmation`);
    }, 3000);
    return () => clearTimeout(t);
  }, [phase, result, router]);

  if (phase === "verifying") {
    return (
      <Centered>
        <Spinner className="text-crimson w-8 h-8" />
        <p className="mt-5 accent-serif text-obsidian/60 text-lg">
          Verifying your payment…
        </p>
      </Centered>
    );
  }

  if (phase === "pending") {
    return (
      <Centered>
        <h1 className="display text-3xl text-obsidian mb-4" style={{ fontWeight: 500 }}>
          Payment Processing
        </h1>
        <p className="accent-serif text-obsidian/60 text-lg max-w-md">
          Your payment is being processed. You&apos;ll receive a confirmation
          shortly
          {result?.orderNumber ? ` for order ${result.orderNumber}` : ""}.
        </p>
        <p className="text-sm font-body text-obsidian/45 mt-6 max-w-md">
          This is taking longer than expected. Please check your email for a
          confirmation, or{" "}
          <Link href="/contact" className="underline hover:text-obsidian/70">
            contact support
          </Link>
          .
        </p>
      </Centered>
    );
  }

  // Paid
  return (
    <Centered>
      <CheckCircle size={64} className="text-emerald-600 mb-6" strokeWidth={1.2} />
      <h1 className="display text-4xl text-obsidian mb-4" style={{ fontWeight: 600 }}>
        Payment Successful!
      </h1>
      <p className="accent-serif text-obsidian/65 text-lg mb-2">
        Your order {result?.orderNumber ?? ""} has been placed.
      </p>
      <p className="text-sm font-body text-obsidian/45 mb-10">
        A confirmation will be sent to your email shortly.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {result?.orderId && (
          <Link href={`/order/${result.orderId}/confirmation`} className="btn-crimson">
            View Order Details
          </Link>
        )}
        <Link href="/" className="btn-ghost text-obsidian">
          Continue Shopping
        </Link>
      </div>
    </Centered>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="page-transition min-h-[70vh] flex flex-col items-center justify-center text-center px-4 py-20">
      {children}
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <Centered>
          <Spinner className="text-crimson w-8 h-8" />
        </Centered>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
