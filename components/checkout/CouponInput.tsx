"use client";

import { apiUrl } from "@/lib/api";
import React, { useState } from "react";
import { Check, X } from "lucide-react";
import { Spinner } from "./ui";
import { useCheckoutStore } from "@/store/checkoutStore";
import { formatPiastres } from "@/lib/checkout/calculations";

interface CouponInputProps {
  subtotal: number; // piastres
}

export default function CouponInput({ subtotal }: CouponInputProps) {
  const store = useCheckoutStore();
  const { coupon } = store.state;
  const [value, setValue] = useState(coupon.code);

  const applied = coupon.appliedCoupon;

  async function handleApply() {
    const code = value.trim().toUpperCase();
    if (!code) return;
    store.setCouponValidating(true);
    try {
      const res = await fetch(apiUrl("/api/checkout/validate-coupon"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, subtotal }),
      });
      const data = await res.json();
      if (data.success && data.coupon) {
        store.applyCoupon(data.coupon);
      } else {
        let message: string = data.message || "This coupon code is not valid.";
        if (data.error === "COUPON_MIN_ORDER" && data.requiredAmount != null) {
          message = `This coupon requires a minimum order of ${formatPiastres(
            data.requiredAmount
          )}.`;
        }
        store.setCouponError(message);
      }
    } catch {
      store.setCouponError(
        "Connection error. Please check your internet and try again."
      );
    }
  }

  function handleRemove() {
    store.removeCoupon();
    setValue("");
  }

  if (applied) {
    return (
      <div className="flex items-center justify-between bg-emerald-50 border border-emerald-200 px-4 py-3">
        <span className="flex items-center gap-2 text-sm font-body text-emerald-800">
          <Check size={16} className="text-emerald-600" />
          <strong className="font-medium">{applied.code}</strong> applied —{" "}
          {applied.description}
        </span>
        <button
          type="button"
          onClick={handleRemove}
          aria-label="Remove coupon"
          className="text-emerald-700/60 hover:text-emerald-700"
        >
          <X size={16} />
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => {
            setValue(e.target.value.toUpperCase());
            if (coupon.error) store.setCouponError(null);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              handleApply();
            }
          }}
          disabled={coupon.isValidating}
          placeholder="COUPON CODE"
          aria-label="Coupon code"
          aria-invalid={coupon.error ? "true" : undefined}
          className="flex-1 bg-white border border-obsidian/15 px-4 py-3 text-sm font-body uppercase tracking-wider text-obsidian placeholder:text-obsidian/30 placeholder:tracking-normal focus:outline-none focus:border-crimson disabled:opacity-60"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={coupon.isValidating || !value.trim()}
          className="px-6 bg-obsidian text-ivory text-[11px] tracking-[0.2em] uppercase font-body transition-colors hover:bg-crimson disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center min-w-[96px]"
        >
          {coupon.isValidating ? <Spinner /> : "Apply"}
        </button>
      </div>
      {coupon.error && (
        <p className="mt-2 text-xs text-crimson font-body" role="alert">
          {coupon.error}
        </p>
      )}
    </div>
  );
}
