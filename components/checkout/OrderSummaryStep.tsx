"use client";

import React from "react";
import Image from "next/image";
import StepShell from "./StepShell";
import CouponInput from "./CouponInput";
import { useCheckout } from "@/hooks/useCheckout";
import { useLang } from "@/context/LanguageContext";
import { egpToPiastres, formatPiastres } from "@/lib/checkout/calculations";

export default function OrderSummaryStep() {
  const { state, store, totals, cartItems, next, back } = useCheckout();
  const { lang } = useLang();

  return (
    <StepShell
      eyebrow="Step 3 of 5"
      title="Order Summary"
      onBack={back}
      continueLabel="Continue to Payment"
      onContinue={next}
    >
      {/* Items */}
      <ul className="flex flex-col divide-y divide-obsidian/10 border-y border-obsidian/10">
        {cartItems.map((item) => {
          const name = lang === "ar" ? item.product.nameAr : item.product.nameEn;
          const unit = egpToPiastres(item.product.price);
          return (
            <li
              key={`${item.product.id}-${item.selectedSize}`}
              className="flex items-center gap-4 py-4"
            >
              <div className="relative w-14 h-14 shrink-0 bg-ivory border border-obsidian/10">
                <Image
                  src={item.product.image}
                  alt={name}
                  width={56}
                  height={56}
                  quality={75}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body text-obsidian truncate">{name}</p>
                <p className="text-xs font-body text-obsidian/50 mt-0.5">
                  {item.selectedSize} · Qty {item.quantity} ·{" "}
                  {formatPiastres(unit)}
                </p>
              </div>
              <span className="text-sm font-body text-obsidian whitespace-nowrap">
                {formatPiastres(unit * item.quantity, false)}
              </span>
            </li>
          );
        })}
      </ul>

      {/* Coupon */}
      <div className="mt-8">
        <p className="eyebrow text-obsidian/50 mb-3">Have a coupon?</p>
        <CouponInput subtotal={totals.subtotal} />
      </div>

      {/* Totals */}
      <div className="mt-8 space-y-2.5">
        <div className="flex justify-between text-sm font-body text-obsidian/70">
          <span>Subtotal</span>
          <span>{formatPiastres(totals.subtotal)}</span>
        </div>
        <div className="flex justify-between text-sm font-body text-obsidian/70">
          <span>Shipping</span>
          <span>
            {totals.shippingFee === null
              ? "Calculated at next step"
              : totals.shippingFee === 0
              ? "FREE"
              : formatPiastres(totals.shippingFee)}
          </span>
        </div>
        {state.coupon.appliedCoupon && (
          <div className="flex justify-between text-sm font-body text-emerald-700">
            <span>Discount ({state.coupon.appliedCoupon.code})</span>
            <span>−{formatPiastres(totals.discountAmount)}</span>
          </div>
        )}
        <div className="hairline my-3" />
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
      </div>
    </StepShell>
  );
}
