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

  const badgeColors: Record<string, string> = {
    bestseller: "bg-gold text-white",
    new: "bg-obsidian text-white",
    limited: "bg-rose-deep text-white",
    offer: "bg-gold-dark text-white",
  };

  const badgeLabels: Record<string, string> = {
    bestseller: t.badges.bestseller,
    new: t.badges.new,
    limited: t.badges.limited,
    offer: t.badges.offer,
  };

  return (
    <div
      className="product-card group bg-white rounded-3xl overflow-hidden shadow-card cursor-pointer"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Link href={`/products/${product.id}`} className="block">
        {/* Image */}
        <div className="relative overflow-hidden aspect-[3/4] bg-gradient-to-br from-champagne/40 via-ivory to-beige/60 flex items-center justify-center p-6">
          <Image
            src={product.image}
            alt={name}
            fill
            className="card-img object-contain p-6"
          />
          {/* Overlay on hover */}
          <div className="absolute inset-0 bg-obsidian/0 group-hover:bg-obsidian/10 transition-colors duration-500" />

          {/* Badge */}
          {product.badge && (
            <div
              className={`absolute top-4 ${lang === "ar" ? "right-4" : "left-4"} px-3 py-1 rounded-full text-[10px] tracking-[0.1em] uppercase font-body font-medium ${badgeColors[product.badge]}`}
            >
              {badgeLabels[product.badge]}
            </div>
          )}

          {/* Quick view hint */}
          <div className="absolute bottom-4 left-4 right-4 flex justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
            <span className="bg-white/90 backdrop-blur-sm text-obsidian text-xs tracking-widest uppercase font-body px-4 py-2 rounded-full">
              {t.products.viewDetails}
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

        {/* Sizes */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {product.sizes.map((size) => (
            <button
              key={size}
              onClick={() => setSelectedSize(size)}
              className={`px-2.5 py-1 rounded-full text-[10px] tracking-wider uppercase font-body border transition-all duration-200 ${
                selectedSize === size
                  ? "border-gold bg-gold/10 text-gold"
                  : "border-obsidian/15 text-obsidian/50 hover:border-gold/40"
              }`}
            >
              {size}
            </button>
          ))}
        </div>

        {/* Price + Add */}
        <div className="flex items-center justify-between">
          <span
            className="font-display text-2xl font-light text-obsidian"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {product.price.toLocaleString()}
            <span className="text-sm text-obsidian/40 font-body ms-1">
              {t.details.inEgp}
            </span>
          </span>

          <button
            onClick={handleAdd}
            className={`px-5 py-2.5 rounded-full text-xs tracking-[0.1em] uppercase font-body font-medium transition-all duration-300 ${
              added
                ? "bg-green-500 text-white scale-95"
                : "btn-gold"
            }`}
          >
            {added ? "✓" : t.products.addToCart}
          </button>
        </div>
      </div>
    </div>
  );
}
