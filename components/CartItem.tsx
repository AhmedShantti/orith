"use client";
import React from "react";
import Image from "next/image";
import { CartItem as CartItemType } from "@/types";
import { useLang } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";

interface CartItemProps {
  item: CartItemType;
}

export default function CartItem({ item }: CartItemProps) {
  const { t, lang } = useLang();
  const { removeItem, updateQty } = useCart();
  const name = lang === "ar" ? item.product.nameAr : item.product.nameEn;

  return (
    <div className="flex gap-4 p-4 bg-[#FBF8F2] border border-obsidian/12 group hover:border-crimson/40 transition-colors duration-300">
      {/* Image */}
      <div className="relative w-20 h-20 sm:w-24 sm:h-24 overflow-hidden flex-shrink-0 bg-gradient-to-b from-[#FBF8F2] to-[#EFE7DB] border border-obsidian/8 flex items-center justify-center">
        <Image
          src={item.product.image}
          alt={name}
          fill
          className="object-contain p-1.5"
        />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h4 className="product-name text-lg text-obsidian leading-tight">
              {name}
            </h4>
            <p className="text-xs font-body text-obsidian/40 mt-0.5 tracking-wider">
              {item.selectedSize}
            </p>
          </div>

          {/* Remove button */}
          <button
            onClick={() => removeItem(item.product.id, item.selectedSize)}
            className="text-obsidian/25 hover:text-rose-deep transition-colors p-1 flex-shrink-0"
            aria-label={t.cart.remove}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a1 1 0 011-1h4a1 1 0 011 1v2" />
            </svg>
          </button>
        </div>

        {/* Qty + Price */}
        <div className="flex items-center justify-between mt-3">
          {/* Qty controls */}
          <div className="flex items-center border border-obsidian/15">
            <button
              onClick={() => updateQty(item.product.id, item.selectedSize, -1)}
              className="w-8 h-8 flex items-center justify-center text-obsidian/50 hover:bg-crimson hover:text-ivory transition-all"
            >
              −
            </button>
            <span className="text-sm font-body w-8 text-center text-obsidian border-x border-obsidian/15 h-8 flex items-center justify-center">
              {item.quantity}
            </span>
            <button
              onClick={() => updateQty(item.product.id, item.selectedSize, 1)}
              className="w-8 h-8 flex items-center justify-center text-obsidian/50 hover:bg-crimson hover:text-ivory transition-all"
            >
              +
            </button>
          </div>

          {/* Price */}
          <span
            className="font-display text-xl font-light text-obsidian"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            {(item.product.price * item.quantity).toLocaleString()}
            <span className="text-sm font-body text-obsidian/40 ms-1">
              {t.details.inEgp}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

