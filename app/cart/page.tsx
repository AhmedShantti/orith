"use client";
import React from "react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import CartItem from "@/components/CartItem";

const WHATSAPP_NUMBER = "201000000000";

export default function CartPage() {
  const { t, lang } = useLang();
  const { items, totalPrice, clearCart } = useCart();

  const buildWhatsAppMessage = () => {
    let msg = t.cart.orderMessage;
    items.forEach((item) => {
      const name = lang === "ar" ? item.product.nameAr : item.product.nameEn;
      msg += `• ${name} (${item.selectedSize}) x${item.quantity} = ${(item.product.price * item.quantity).toLocaleString()} ${t.details.inEgp}\n`;
    });
    msg += `\n${t.cart.total}: ${totalPrice.toLocaleString()} ${t.details.inEgp}`;
    return encodeURIComponent(msg);
  };

  const handleWhatsAppOrder = () => {
    const message = buildWhatsAppMessage();
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
  };

  if (items.length === 0) {
    return (
      <div className="page-transition pt-32 pb-24 min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center max-w-sm mx-auto px-4">
          {/* Empty state illustration */}
          <div className="w-32 h-32 rounded-full bg-beige mx-auto flex items-center justify-center mb-8">
            <svg
              width="48"
              height="48"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-obsidian/20"
            >
              <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <path d="M16 10a4 4 0 01-8 0" />
            </svg>
          </div>

          <h1
            className="font-display text-4xl font-light text-obsidian mb-4"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {t.cart.empty}
          </h1>
          <p className="font-body text-obsidian/50 text-sm leading-relaxed mb-10">
            {t.cart.emptyDesc}
          </p>
          <Link
            href="/products"
            className="inline-block btn-gold px-10 py-4 rounded-full text-sm tracking-[0.15em] uppercase font-body font-medium"
          >
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
        <div className="mb-12 mt-8">
          <div className="flex items-center gap-4 mb-2">
            <div className="gold-line" />
            <span className="text-xs tracking-[0.4em] uppercase text-gold font-body font-light">
              Your Order
            </span>
          </div>
          <h1
            className="font-display text-4xl sm:text-5xl font-light text-obsidian"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
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
            <div className="bg-white rounded-3xl p-8 shadow-card sticky top-28">
              <h3
                className="font-display text-2xl font-light text-obsidian mb-6"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
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
                  style={{ fontFamily: "var(--font-cormorant)" }}
                >
                  {totalPrice.toLocaleString()}
                  <span className="text-sm font-body text-obsidian/50 ms-1">
                    {t.details.inEgp}
                  </span>
                </span>
              </div>

              {/* WhatsApp order button */}
              <button
                onClick={handleWhatsAppOrder}
                className="w-full py-4 rounded-full bg-[#25D366] hover:bg-[#20bd5c] text-white text-sm tracking-[0.1em] uppercase font-body font-medium transition-all duration-300 flex items-center justify-center gap-3 hover:shadow-[0_8px_24px_rgba(37,211,102,0.3)] hover:-translate-y-0.5"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                </svg>
                {t.cart.orderWhatsApp}
              </button>

              {/* Continue shopping */}
              <Link
                href="/products"
                className="w-full mt-3 py-3 rounded-full border border-obsidian/10 text-obsidian/50 text-xs tracking-widest uppercase font-body hover:border-gold hover:text-gold transition-all duration-300 flex items-center justify-center"
              >
                ← Continue Shopping
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
