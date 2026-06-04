"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useLang } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";

interface ProductCardProps {
  product: Product;
  delay?: number;
}

export default function ProductCard({ product, delay = 0 }: ProductCardProps) {
  const { t, lang } = useLang();
  const { addItem } = useCart();
  const [selectedSize, setSelectedSize] = useState(product.sizes[0]);
  const [added, setAdded] = useState(false);

  const name = lang === "ar" ? product.nameAr : product.nameEn;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const badgeLabels: Record<string, string> = {
    bestseller: t.badges.bestseller,
    new: t.badges.new,
    limited: t.badges.limited,
    offer: t.badges.offer,
  };

  return (
    <div className="tile group flex flex-col">
      <Link href={`/products/${product.id}`} className="block relative">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[3/4] bg-gradient-to-b from-[#FBF8F2] to-[#EFE7DB] flex items-center justify-center">
          <Image
            src={product.image}
            alt={name}
            fill
            className="tile-img object-contain p-8"
          />

          {/* Badge — minimal editorial tag */}
          {product.badge && (
            <span
              className={`absolute top-4 ${lang === "ar" ? "right-4" : "left-4"} eyebrow text-[8px] px-2.5 py-1 bg-obsidian text-ivory`}
            >
              {badgeLabels[product.badge]}
            </span>
          )}

          {/* View overlay bar */}
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-obsidian/85 backdrop-blur-sm py-3 text-center">
            <span className="eyebrow text-ivory/90 text-[9px]">{t.products.viewDetails}</span>
          </div>
        </div>
      </Link>

      {/* Content */}
      <div className="flex flex-col flex-1 px-5 pt-5 pb-5">
        <p className="eyebrow text-crimson text-[9px] mb-2">{product.category}</p>
        <Link href={`/products/${product.id}`}>
          <h3 className="product-name text-2xl text-obsidian leading-tight hover:text-crimson transition-colors">
            {name}
          </h3>
        </Link>

        {/* Sizes (only when more than one) */}
        {product.sizes.length > 1 && (
          <div className="flex gap-3 mt-3">
            {product.sizes.map((size) => (
              <button
                key={size}
                onClick={() => setSelectedSize(size)}
                className={`eyebrow text-[9px] pb-1 border-b transition-colors ${
                  selectedSize === size
                    ? "border-crimson text-crimson"
                    : "border-transparent text-obsidian/40 hover:text-obsidian"
                }`}
              >
                {size}
              </button>
            ))}
          </div>
        )}

        {/* Price + add */}
        <div className="mt-auto pt-5 flex items-end justify-between">
          <span className="display text-2xl text-obsidian" style={{ fontWeight: 500 }}>
            {product.price.toLocaleString()}
            <span className="font-body text-[11px] text-obsidian/40 ms-1.5 tracking-widest">
              {t.details.inEgp}
            </span>
          </span>

          <button
            onClick={handleAdd}
            aria-label={t.products.addToCart}
            className={`w-10 h-10 flex items-center justify-center border transition-all duration-300 ${
              added
                ? "bg-obsidian border-obsidian text-ivory"
                : "border-obsidian/25 text-obsidian hover:bg-crimson hover:border-crimson hover:text-ivory"
            }`}
          >
            {added ? (
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
