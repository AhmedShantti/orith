"use client";
import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useLang } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import CartItem from "@/components/CartItem";
import Emblem from "@/components/Emblem";

export default function CartPage() {
  const { t, lang } = useLang();
  const { items, totalPrice } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="page-transition pt-32 pb-24 min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          <div className="flex justify-center mb-8">
            <Emblem size={48} className="text-obsidian/20" />
          </div>

          <h1 className="display text-4xl sm:text-5xl text-obsidian mb-5" style={{ fontWeight: 500 }}>
            {t.cart.empty}
          </h1>
          <p className="accent-serif text-obsidian/55 text-lg leading-relaxed mb-10">
            {t.cart.emptyDesc}
          </p>
          <Link href="/products" className="btn-crimson">
            {t.cart.shopNow}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-transition pt-24 pb-24 min-h-screen bg-ivory">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12 mt-4 border-b border-obsidian/12 pb-8">
          <p className="eyebrow text-crimson mb-4">Your Order</p>
          <h1 className="display text-5xl sm:text-6xl text-obsidian" style={{ fontWeight: 600 }}>
            {t.cart.title}
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 items-start">
          {/* Items */}
          <div className="lg:col-span-2 flex flex-col gap-4">
            {items.map((item) => (
              <CartItem
                key={`${item.product.id}-${item.selectedSize}`}
                item={item}
              />
            ))}
          </div>

          {/* Summary */}
          <div className="lg:col-span-1">
            <div className="bg-[#FBF8F2] border border-obsidian/12 p-8 sticky top-28">
              <h3 className="display text-2xl text-obsidian mb-6" style={{ fontWeight: 500 }}>
                Order Summary
              </h3>

              {/* Item list */}
              <div className="flex flex-col gap-3 mb-6">
                {items.map((item) => {
                  const name =
                    lang === "ar" ? item.product.nameAr : item.product.nameEn;
                  return (
                    <div
                      key={`${item.product.id}-${item.selectedSize}`}
                      className="flex justify-between items-center"
                    >
                      <span className="text-xs font-body text-obsidian/60 flex-1 truncate">
                        {name} ({item.selectedSize}) x{item.quantity}
                      </span>
                      <span className="text-xs font-body text-obsidian/80 ms-2">
                        {(item.product.price * item.quantity).toLocaleString()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-gold/20 mb-6" />

              {/* Subtotal */}
              <div className="flex justify-between items-center mb-3">
                <span className="text-sm font-body text-obsidian/50 tracking-wider">
                  {t.cart.subtotal}
                </span>
                <span className="font-body text-sm text-obsidian">
                  {totalPrice.toLocaleString()} {t.details.inEgp}
                </span>
              </div>

              {/* Total */}
              <div className="flex justify-between items-center mb-8">
                <span className="font-body font-medium text-obsidian tracking-wider text-sm uppercase">
                  {t.cart.total}
                </span>
                <span
                  className="font-display text-3xl font-light text-obsidian"
                  style={{ fontFamily: "var(--font-cinzel)" }}
                >
                  {totalPrice.toLocaleString()}
                  <span className="text-sm font-body text-obsidian/50 ms-1">
                    {t.details.inEgp}
                  </span>
                </span>
              </div>

              {/* Proceed to checkout */}
              <button
                onClick={() => router.push("/checkout")}
                disabled={items.length === 0}
                className="btn-crimson w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Proceed to Checkout
              </button>

              {/* Continue shopping */}
              <Link href="/products" className="btn-ghost text-obsidian w-full mt-3">
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
