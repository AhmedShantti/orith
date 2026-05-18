"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Offer } from "@/types";
import { useLang } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";

interface OfferCardProps {
  offer: Offer;
  delay?: number;
}

export default function OfferCard({ offer, delay = 0 }: OfferCardProps) {
  const { t, lang } = useLang();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const { product, discountPercent, badgeType } = offer;

  const name = lang === "ar" ? product.nameAr : product.nameEn;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, product.sizes[0]);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const badgeLabel =
    badgeType === "percent"
      ? `${discountPercent}% ${t.offers.off}`
      : badgeType === "limited"
      ? t.offers.limitedTime
      : t.offers.specialOffer;

  return (
    <div
      className="product-card group bg-white rounded-3xl overflow-hidden shadow-card relative"
      style={{ animationDelay: `${delay}ms` }}
    >
      {/* Offer badge */}
      <div className="absolute top-4 left-4 z-10 badge-pulse">
        <span className="inline-flex items-center gap-1 bg-gradient-to-r from-gold to-gold-dark text-white text-[10px] tracking-[0.12em] uppercase font-body font-medium px-3 py-1.5 rounded-full shadow-luxury">
          {badgeType === "limited" && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          )}
          {badgeLabel}
        </span>
      </div>

      <Link href={`/products/${product.id}`}>
        {/* Image */}
        <div className="relative overflow-hidden aspect-[4/3] bg-gradient-to-br from-champagne/40 via-ivory to-beige/60 flex items-center justify-center">
          <Image
            src={product.image}
            alt={name}
            fill
            className="card-img object-contain p-4"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-obsidian/10 to-transparent pointer-events-none" />

          {/* Discount circle */}
          <div className="absolute bottom-4 right-4 w-14 h-14 rounded-full bg-white/90 backdrop-blur-sm flex flex-col items-center justify-center shadow-luxury">
            <span className="text-gold font-body font-semibold text-base leading-none">
              -{discountPercent}%
            </span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="p-5">
        <Link href={`/products/${product.id}`}>
          <h3 className="product-name text-2xl text-obsidian mb-1 hover:text-gold transition-colors">
            {name}
          </h3>
        </Link>
        <p className="text-xs font-body text-obsidian/50 line-clamp-2 mb-4 leading-relaxed">
          {lang === "ar" ? product.descriptionAr : product.descriptionEn}
        </p>

        {/* Prices */}
        <div className="flex items-end gap-3 mb-4">
          <span
            className="font-display text-2xl font-light text-gold"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {product.price.toLocaleString()}
            <span className="text-sm text-gold/60 font-body ms-1">
              {t.details.inEgp}
            </span>
          </span>
          {product.originalPrice && (
            <span className="font-body text-sm text-obsidian/40 line-through mb-0.5">
              {product.originalPrice.toLocaleString()} {t.details.inEgp}
            </span>
          )}
        </div>

        {/* Savings chip */}
        {product.originalPrice && (
          <div className="mb-4">
            <span className="inline-block bg-gold/10 text-gold text-[10px] tracking-wider uppercase font-body font-medium px-3 py-1 rounded-full">
              Save{" "}
              {(product.originalPrice - product.price).toLocaleString()}{" "}
              {t.details.inEgp}
            </span>
          </div>
        )}

        {/* Add button */}
        <button
          onClick={handleAdd}
          className={`w-full py-3 rounded-full text-xs tracking-[0.15em] uppercase font-body font-medium transition-all duration-300 ${
            added ? "bg-green-500 text-white scale-95" : "btn-gold"
          }`}
        >
          {added ? "✓ Added!" : t.products.addToCart}
        </button>
      </div>
    </div>
  );
}
