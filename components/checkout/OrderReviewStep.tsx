"use client";

import React, { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "./ui";
import { useCheckout } from "@/hooks/useCheckout";
import { usePaymob } from "@/hooks/usePaymob";
import { useLang } from "@/context/LanguageContext";
import { egpToPiastres, formatPiastres } from "@/lib/checkout/calculations";
import { maskWalletNumber } from "@/lib/checkout/orderHelpers";

function ReviewSection({
  title,
  onEdit,
  children,
}: {
  title: string;
  onEdit: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="border border-obsidian/12 bg-[#FBF8F2] p-5">
      <div className="flex items-center justify-between mb-3">
        <h3 className="eyebrow text-obsidian/60">{title}</h3>
        <button
          type="button"
          onClick={onEdit}
          className="text-[11px] tracking-[0.15em] uppercase text-crimson hover:underline"
        >
          Edit
        </button>
      </div>
      {children}
    </div>
  );
}

export default function OrderReviewStep() {
  const { state, store, totals, cartItems, createOrder } = useCheckout();
  const { initiate } = usePaymob();
  const { lang } = useLang();
  const router = useRouter();

  // Once an order is created we lock the button to prevent double submission.
  const [locked, setLocked] = useState(false);
  const [busy, setBusy] = useState(false);
  const [busyLabel, setBusyLabel] = useState("Processing…");
  const [applePayIframe, setApplePayIframe] = useState<string | null>(null);
  const orderIdRef = useRef<string | null>(state.order.id);

  const { customer, shipping, payment } = state;
  const fullName = `${customer.firstName} ${customer.lastName}`.trim();

  // Apple Pay: listen for Paymob's success/failure postMessage from the iframe.
  useEffect(() => {
    if (!applePayIframe) return;
    function onMessage(e: MessageEvent) {
      const data = e.data;
      const text = typeof data === "string" ? data : JSON.stringify(data ?? "");
      const txId =
        (data && (data.transaction_id || data.id)) ?? orderIdRef.current ?? "";
      if (/success|approved|true/i.test(text)) {
        router.push(`/payment/success?transaction_id=${txId}`);
      } else if (/fail|declined|error|false/i.test(text)) {
        router.push(`/payment/failure?transaction_id=${txId}`);
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [applePayIframe, router]);

  async function runPayment(orderId: string) {
    setBusyLabel("Redirecting to payment…");
    const result = await initiate(
      orderId,
      payment.method as "MOBILE_WALLET" | "APPLE_PAY",
      payment.walletPhone || undefined
    );
    if (!result.success) {
      store.setPaymentError(result.message ?? "Payment could not be started.");
      setBusy(false); // allow retry (re-initiate, NOT re-create)
      return;
    }
    store.setPaymentInitiated({
      redirectUrl: result.redirectUrl,
      iframeUrl: result.iframeUrl,
      paymentKey: result.paymentKey,
    });
    if (result.redirectUrl) {
      window.location.href = result.redirectUrl;
      return;
    }
    if (result.iframeUrl) {
      setApplePayIframe(result.iframeUrl);
      setBusy(false);
    }
  }

  async function handlePlaceOrder() {
    if (busy) return;
    setBusy(true);
    store.setOrderError(null);
    store.setPaymentError(null);

    // Reuse an already-created order (retry path) without recreating it.
    if (orderIdRef.current) {
      await runPayment(orderIdRef.current);
      return;
    }

    setBusyLabel("Creating your order…");
    const order = await createOrder();
    if (!order) {
      setBusy(false); // creation failed before any order existed → re-enable
      return;
    }
    orderIdRef.current = order.id;
    setLocked(true); // an order now exists; never allow a second create
    await runPayment(order.id);
  }

  const placeError = state.order.createError ?? state.paymentInitiation.error;

  if (applePayIframe) {
    return (
      <div>
        <h2 className="display text-2xl text-obsidian mb-4" style={{ fontWeight: 500 }}>
          Complete your payment
        </h2>
        <iframe
          title="Apple Pay"
          src={applePayIframe}
          className="w-full h-[520px] border border-obsidian/12"
        />
      </div>
    );
  }

  return (
    <section>
      <header className="mb-8">
        <p className="eyebrow text-crimson mb-3">Step 5 of 5</p>
        <h2 className="display text-3xl sm:text-4xl text-obsidian" style={{ fontWeight: 500 }}>
          Review &amp; Place Order
        </h2>
      </header>

      <div className="grid gap-4 mb-8">
        <ReviewSection title="Customer Details" onEdit={() => store.setCurrentStep(1)}>
          <p className="text-sm font-body text-obsidian/80">{fullName}</p>
          <p className="text-sm font-body text-obsidian/55">{customer.email}</p>
          <p className="text-sm font-body text-obsidian/55">{customer.phone}</p>
        </ReviewSection>

        <ReviewSection title="Shipping Address" onEdit={() => store.setCurrentStep(2)}>
          <p className="text-sm font-body text-obsidian/80">{shipping.address1}</p>
          {shipping.address2 && (
            <p className="text-sm font-body text-obsidian/55">{shipping.address2}</p>
          )}
          <p className="text-sm font-body text-obsidian/55">
            {shipping.city}, {shipping.governorate}
            {shipping.postalCode ? ` ${shipping.postalCode}` : ""}
          </p>
          {shipping.notes && (
            <p className="text-xs font-body text-obsidian/45 mt-1">
              Note: {shipping.notes}
            </p>
          )}
        </ReviewSection>

        <ReviewSection title="Payment Method" onEdit={() => store.setCurrentStep(4)}>
          <p className="text-sm font-body text-obsidian/80">
            {payment.method === "MOBILE_WALLET" ? "Mobile Wallet" : "Apple Pay"}
            {payment.method === "MOBILE_WALLET" && payment.walletPhone && (
              <span className="text-obsidian/55">
                {" "}
                · {maskWalletNumber(payment.walletPhone)}
              </span>
            )}
          </p>
        </ReviewSection>

        <ReviewSection title="Order Summary" onEdit={() => store.setCurrentStep(3)}>
          <ul className="space-y-1.5 mb-3">
            {cartItems.map((item) => {
              const name =
                lang === "ar" ? item.product.nameAr : item.product.nameEn;
              return (
                <li
                  key={`${item.product.id}-${item.selectedSize}`}
                  className="flex justify-between text-sm font-body text-obsidian/70"
                >
                  <span className="truncate me-3">
                    {name} ({item.selectedSize}) × {item.quantity}
                  </span>
                  <span className="whitespace-nowrap">
                    {formatPiastres(
                      egpToPiastres(item.product.price) * item.quantity,
                      false
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
          <div className="hairline my-2" />
          <Row label="Subtotal" value={formatPiastres(totals.subtotal)} />
          <Row
            label="Shipping"
            value={
              totals.shippingFee === 0
                ? "FREE"
                : formatPiastres(totals.shippingFee ?? 0)
            }
          />
          {state.coupon.appliedCoupon && (
            <Row
              label={`Discount (${state.coupon.appliedCoupon.code})`}
              value={`−${formatPiastres(totals.discountAmount)}`}
              accent
            />
          )}
          <div className="hairline my-2" />
          <div className="flex justify-between items-baseline">
            <span className="text-sm uppercase tracking-wider font-body text-obsidian">
              Total
            </span>
            <span
              className="text-2xl font-light text-obsidian"
              style={{ fontFamily: "var(--font-cinzel)" }}
            >
              {formatPiastres(totals.totalAmount)}
            </span>
          </div>
        </ReviewSection>
      </div>

      {placeError && (
        <div
          role="alert"
          className="mb-4 bg-crimson/5 border border-crimson/30 px-4 py-3 text-sm font-body text-crimson"
        >
          {placeError}
        </div>
      )}

      <div className="flex flex-col-reverse sm:flex-row items-center gap-3">
        {!locked && (
          <button
            type="button"
            onClick={() => store.setCurrentStep(4)}
            className="btn-ghost text-obsidian w-full sm:w-auto"
          >
            ← Back
          </button>
        )}
        <button
          type="button"
          onClick={handlePlaceOrder}
          disabled={busy}
          aria-disabled={busy ? "true" : undefined}
          className="btn-crimson w-full sm:flex-1 text-sm disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {busy ? (
            <>
              <Spinner />
              <span aria-live="polite">{busyLabel}</span>
            </>
          ) : placeError ? (
            "Try Payment Again"
          ) : (
            "Place Order & Pay"
          )}
        </button>
      </div>

      <p className="mt-4 text-xs font-body text-obsidian/45 text-center sm:text-start">
        By placing this order, you agree to our{" "}
        <a href="#" className="underline hover:text-obsidian/70">
          Terms &amp; Conditions
        </a>{" "}
        and{" "}
        <a href="#" className="underline hover:text-obsidian/70">
          Privacy Policy
        </a>
        .
      </p>
    </section>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex justify-between text-sm font-body ${
        accent ? "text-emerald-700" : "text-obsidian/70"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
