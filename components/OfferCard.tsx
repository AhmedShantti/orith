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

export default function OfferCard({ offer }: OfferCardProps) {
  const { t, lang } = useLang();
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);
  const { product, discountPercent } = offer;

  const name = lang === "ar" ? product.nameAr : product.nameEn;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, product.sizes[0]);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  return (
    <div className="tile group flex flex-col">
      <Link href={`/products/${product.id}`} className="block relative">
        {/* Discount tag */}
        <span className="absolute top-0 left-0 z-10 bg-crimson text-ivory eyebrow text-[9px] px-3 py-2">
          −{discountPercent}%
        </span>

        <div className="relative overflow-hidden aspect-[3/4] bg-gradient-to-b from-[#FBF8F2] to-[#EFE7DB] flex items-center justify-center">
          <Image src={product.image} alt={name} fill className="tile-img object-contain p-8" />
          <div className="absolute inset-x-0 bottom-0 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-obsidian/85 backdrop-blur-sm py-3 text-center">
            <span className="eyebrow text-ivory/90 text-[9px]">{t.products.viewDetails}</span>
          </div>
        </div>
      </Link>

      <div className="flex flex-col flex-1 px-5 pt-5 pb-5">
        <p className="eyebrow text-crimson text-[9px] mb-2">{product.category}</p>
        <Link href={`/products/${product.id}`}>
          <h3 className="product-name text-2xl text-obsidian leading-tight hover:text-crimson transition-colors">
            {name}
          </h3>
        </Link>

        <div className="mt-3 flex items-baseline gap-3">
          <span className="display text-2xl text-crimson" style={{ fontWeight: 500 }}>
            {product.price.toLocaleString()}
            <span className="font-body text-[11px] text-crimson/60 ms-1.5 tracking-widest">
              {t.details.inEgp}
            </span>
          </span>
          {product.originalPrice && (
            <span className="font-body text-sm text-obsidian/35 line-through">
              {product.originalPrice.toLocaleString()}
            </span>
          )}
        </div>

        <button
          onClick={handleAdd}
          className={`mt-auto pt-5 w-full ${added ? "" : ""}`}
        >
          <span
            className={`block w-full py-3.5 text-center eyebrow text-[10px] border transition-all duration-300 ${
              added
                ? "bg-obsidian border-obsidian text-ivory"
                : "border-obsidian/25 text-obsidian group-hover:bg-crimson group-hover:border-crimson group-hover:text-ivory"
            }`}
          >
            {added ? "✓ " + t.products.addToCart : t.products.addToCart}
          </span>
        </button>
      </div>
    </div>
  );
}
