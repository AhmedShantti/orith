"use client";

import React, { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { XCircle } from "lucide-react";
import { usePaymentVerification } from "@/hooks/usePaymob";
import { Spinner } from "@/components/checkout/ui";

function FailureContent() {
  const params = useSearchParams();
  const router = useRouter();
  const { verifyOnce } = usePaymentVerification();
  const transactionId =
    params.get("transaction_id") || params.get("id") || "";
  const [loading, setLoading] = useState(true);
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!transactionId) {
      setLoading(false);
      return;
    }
    verifyOnce(transactionId).then((res) => {
      // If the payment actually succeeded (race), forward to success.
      if (res.status === "PAID") {
        router.replace(
          `/payment/success?transaction_id=${encodeURIComponent(transactionId)}`
        );
        return;
      }
      setLoading(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  if (loading) {
    return (
      <Centered>
        <Spinner className="text-crimson w-8 h-8" />
      </Centered>
    );
  }

  return (
    <Centered>
      <XCircle size={64} className="text-crimson mb-6" strokeWidth={1.2} />
      <h1 className="display text-4xl text-obsidian mb-4" style={{ fontWeight: 600 }}>
        Payment Failed
      </h1>
      <p className="accent-serif text-obsidian/65 text-lg mb-10 max-w-md">
        Your payment could not be processed. Your order has not been charged.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        {/* Reuses the existing order from the persisted checkout state — no new
            order is created. */}
        <button
          type="button"
          onClick={() => router.push("/checkout")}
          className="btn-crimson"
        >
          Try Again
        </button>
        <Link href="/contact" className="btn-ghost text-obsidian">
          Contact Support
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

export default function PaymentFailurePage() {
  return (
    <Suspense
      fallback={
        <Centered>
          <Spinner className="text-crimson w-8 h-8" />
        </Centered>
      }
    >
      <FailureContent />
    </Suspense>
  );
}
