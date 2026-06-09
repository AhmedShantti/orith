"use client";

import React, { useState } from "react";
import Image from "next/image";
import { ChevronDown, X } from "lucide-react";
import { useLang } from "@/context/LanguageContext";
import { formatPiastres } from "@/lib/checkout/calculations";
import { egpToPiastres } from "@/lib/checkout/calculations";
import type { CartItem } from "@/types";
import type { AppliedCoupon } from "@/types/coupon";
import type { CheckoutTotals } from "@/hooks/useCheckout";

interface OrderSummaryCardProps {
  items: CartItem[];
  totals: CheckoutTotals;
  appliedCoupon: AppliedCoupon | null;
  onRemoveCoupon?: () => void;
  collapsible?: boolean; // mobile accordion
}

function SummaryBody({
  items,
  totals,
  appliedCoupon,
  onRemoveCoupon,
}: Omit<OrderSummaryCardProps, "collapsible">) {
  const { lang } = useLang();

  return (
    <div>
      {/* Items */}
      <ul className="flex flex-col gap-4 mb-6">
        {items.map((item) => {
          const name = lang === "ar" ? item.product.nameAr : item.product.nameEn;
          const lineTotal = egpToPiastres(item.product.price) * item.quantity;
          return (
            <li
              key={`${item.product.id}-${item.selectedSize}`}
              className="flex items-center gap-3"
            >
              <div className="relative w-10 h-10 shrink-0 bg-ivory border border-obsidian/10">
                <Image
                  src={item.product.image}
                  alt={name}
                  width={40}
                  height={40}
                  quality={70}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-body text-obsidian/80 truncate">
                  {name}
                </p>
                <p className="text-[11px] font-body text-obsidian/45">
                  {item.selectedSize} · {item.quantity} ×{" "}
                  {formatPiastres(egpToPiastres(item.product.price), false)}
                </p>
              </div>
              <span className="text-xs font-body text-obsidian/80 whitespace-nowrap">
                {formatPiastres(lineTotal, false)}
              </span>
            </li>
          );
        })}
      </ul>

      <div className="hairline mb-4" />

      {/* Subtotal */}
      <Row label="Subtotal" value={formatPiastres(totals.subtotal)} />

      {/* Shipping */}
      <Row
        label="Shipping"
        value={
          totals.shippingFee === null
            ? "Calculating…"
            : totals.shippingFee === 0
            ? "FREE"
            : formatPiastres(totals.shippingFee)
        }
      />

      {/* Discount */}
      {appliedCoupon && (
        <div className="flex justify-between items-center mb-2.5">
          <span className="text-sm font-body text-emerald-700 flex items-center gap-2">
            Discount ({appliedCoupon.code})
            {onRemoveCoupon && (
              <button
                type="button"
                onClick={onRemoveCoupon}
                aria-label="Remove coupon"
                className="text-emerald-700/60 hover:text-emerald-700"
              >
                <X size={13} />
              </button>
            )}
          </span>
          <span className="text-sm font-body text-emerald-700">
            −{formatPiastres(totals.discountAmount)}
          </span>
        </div>
      )}

      <div className="hairline my-4" />

      {/* Total */}
      <div className="flex justify-between items-baseline">
        <span className="font-body text-sm uppercase tracking-wider text-obsidian">
          Total
        </span>
        <span
          className="text-2xl font-light text-obsidian"
          style={{ fontFamily: "var(--font-cinzel)" }}
        >
          {formatPiastres(totals.totalAmount, false)}
          <span className="text-xs font-body text-obsidian/50 ms-1.5">EGP</span>
        </span>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between items-center mb-2.5">
      <span className="text-sm font-body text-obsidian/55">{label}</span>
      <span className="text-sm font-body text-obsidian/90">{value}</span>
    </div>
  );
}

export default function OrderSummaryCard({
  items,
  totals,
  appliedCoupon,
  onRemoveCoupon,
  collapsible = false,
}: OrderSummaryCardProps) {
  const [open, setOpen] = useState(false);

  if (collapsible) {
    return (
      <div className="bg-[#FBF8F2] border border-obsidian/12">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="w-full flex items-center justify-between px-5 py-4"
        >
          <span className="flex items-center gap-2 text-sm font-body text-obsidian">
            {open ? "Hide order summary" : "Show order summary"}
            <ChevronDown
              size={16}
              className={`transition-transform ${open ? "rotate-180" : ""}`}
            />
          </span>
          <span
            className="text-lg font-light text-obsidian"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            {formatPiastres(totals.totalAmount)}
          </span>
        </button>
        {open && (
          <div className="px-5 pb-5">
            <SummaryBody
              items={items}
              totals={totals}
              appliedCoupon={appliedCoupon}
              onRemoveCoupon={onRemoveCoupon}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-[#FBF8F2] border border-obsidian/12 p-7 lg:sticky lg:top-24">
      <h2
        className="display text-xl text-obsidian mb-6"
        style={{ fontWeight: 500 }}
      >
        Order Summary
      </h2>
      <SummaryBody
        items={items}
        totals={totals}
        appliedCoupon={appliedCoupon}
        onRemoveCoupon={onRemoveCoupon}
      />
    </div>
  );
}
