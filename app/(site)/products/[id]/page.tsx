"use client";
import { apiUrl } from "@/lib/api";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLang } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/types";
import Emblem from "@/components/Emblem";

export default function ProductDetailsPage() {
  const params = useParams();
  const { t, lang } = useLang();
  const { addItem } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSize, setSelectedSize] = useState("");
  const [added, setAdded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(apiUrl("/api/products"));
        const json = (await res.json()) as { products: Product[] };
        if (!cancelled) setProducts(json.products);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const product = products.find((p) => p.id === params.id);

  useEffect(() => {
    if (product) setSelectedSize(product.sizes[0] || "");
  }, [product]);

  if (loading) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-ivory flex flex-col items-center justify-center gap-5">
        <Emblem size={40} className="text-crimson animate-pulse" />
        <p className="eyebrow text-[10px] text-obsidian/40">Loading…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-3xl font-light text-obsidian/40" style={{ fontFamily: "var(--font-cinzel)" }}>
            Product not found
          </p>
          <Link href="/products" className="mt-6 inline-block text-gold text-sm tracking-widest uppercase font-body hover:underline">
            ← Back to Collection
          </Link>
        </div>
      </div>
    );
  }

  const name = lang === "ar" ? product.nameAr : product.nameEn;
  const desc = lang === "ar" ? product.descriptionAr : product.descriptionEn;

  const handleAdd = () => {
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1800);
  };

  const related = products.filter(
    (p) => p.id !== product.id && p.category === product.category
  ).slice(0, 3);

  return (
    <div className="page-transition pt-24 pb-24 min-h-screen bg-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back */}
        <Link
          href="/products"
          className="inline-flex items-center gap-2 text-xs tracking-widest uppercase font-body text-obsidian/50 hover:text-gold transition-colors mb-12 mt-8"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          {t.details.back}
        </Link>

        {/* Main grid */}
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          {/* Image */}
          <div className="relative">
            <div className="relative aspect-[3/4] overflow-hidden bg-gradient-to-b from-[#FBF8F2] to-[#EFE7DB] border border-obsidian/10 flex items-center justify-center">
              <div className="absolute inset-5 border border-obsidian/10 pointer-events-none" />
              <Image
                src={product.image}
                alt={name}
                fill
                className="object-contain p-12"
                priority
              />
              {/* Badge */}
              {product.badge && (
                <div className={`absolute top-5 ${lang === "ar" ? "right-5" : "left-5"} eyebrow text-[9px] px-3 py-1.5 ${
                  product.badge === "limited" ? "bg-crimson text-ivory" : "bg-obsidian text-ivory"
                }`}>
                  {product.badge === "bestseller" ? t.badges.bestseller :
                   product.badge === "new" ? t.badges.new :
                   product.badge === "limited" ? t.badges.limited : t.badges.offer}
                </div>
              )}
              <Emblem size={22} className="absolute bottom-5 right-5 text-obsidian/25" />
            </div>
          </div>

          {/* Content */}
          <div className="pt-4">
            {/* Category */}
            <p className="text-xs tracking-[0.4em] uppercase text-gold font-body mb-4">
              {product.category}
            </p>

            {/* Name */}
            <h1 className="product-name text-4xl sm:text-5xl lg:text-6xl text-obsidian leading-tight mb-6">
              {name}
            </h1>

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-8">
              <span
                className="font-display text-4xl font-light text-obsidian"
                style={{ fontFamily: "var(--font-cinzel)" }}
              >
                {product.price.toLocaleString()}
              </span>
              <span className="font-body text-lg text-obsidian/50">
                {t.details.inEgp}
              </span>
              {product.originalPrice && (
                <span className="font-body text-xl text-obsidian/30 line-through">
                  {product.originalPrice.toLocaleString()}
                </span>
              )}
            </div>

            {/* Divider */}
            <div className="w-full h-px bg-gradient-to-r from-gold/20 to-transparent mb-8" />

            {/* Description */}
            <p className="font-body text-obsidian/65 leading-relaxed text-base mb-10">
              {desc}
            </p>

            {/* Size selector */}
            <div className="mb-8">
              <p className="text-xs tracking-[0.3em] uppercase font-body text-obsidian/50 mb-3">
                {t.products.size}
              </p>
              <div className="flex gap-3 flex-wrap">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    onClick={() => setSelectedSize(size)}
                    className={`px-7 py-3.5 eyebrow text-[10px] border transition-all duration-300 ${
                      selectedSize === size
                        ? "border-crimson bg-crimson text-ivory"
                        : "border-obsidian/20 text-obsidian/60 hover:border-crimson hover:text-crimson"
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Add to cart */}
            <button
              onClick={handleAdd}
              className={`w-full mb-4 transition-all duration-300 ${added ? "" : ""}`}
            >
              <span className={`block w-full py-5 text-center eyebrow text-[11px] border transition-all duration-300 ${
                added ? "bg-obsidian border-obsidian text-ivory" : "bg-crimson border-crimson text-ivory hover:bg-crimson-dark hover:border-crimson-dark"
              }`}>
                {added ? "✓ Added to Cart" : t.products.addToCart}
              </span>
            </button>

            <Link href="/cart" className="btn-ghost text-obsidian w-full">
              {t.nav.cart} →
            </Link>

            {/* Fragrance notes */}
            {product.notes && (
              <div className="mt-12">
                <div className="flex items-center gap-3 mb-6">
                  <div className="gold-line" />
                  <h3 className="text-xs tracking-[0.4em] uppercase font-body text-gold">
                    {t.details.fragrance}
                  </h3>
                  <div className="gold-line" />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  {[
                    { label: t.details.topNotes, notes: product.notes.top, icon: "◇" },
                    { label: t.details.heartNotes, notes: product.notes.heart, icon: "♡" },
                    { label: t.details.baseNotes, notes: product.notes.base, icon: "○" },
                  ].map((group) => (
                    <div
                      key={group.label}
                      className="bg-[#FBF8F2] border border-obsidian/10 p-5 text-center"
                    >
                      <div className="text-crimson/60 text-lg mb-2">{group.icon}</div>
                      <p className="eyebrow text-[9px] text-obsidian/40 mb-3">
                        {group.label}
                      </p>
                      <div className="flex flex-col gap-1">
                        {group.notes.map((n) => (
                          <span key={n} className="text-xs font-body text-obsidian/70">
                            {n}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-24">
            <div className="text-center mb-12">
              <div className="flex items-center justify-center gap-4 mb-3">
                <div className="gold-line" />
                <span className="text-xs tracking-[0.4em] uppercase text-gold font-body">
                  You May Also Like
                </span>
                <div className="gold-line" />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-px bg-obsidian/10 border border-obsidian/10">
              {related.map((p) => (
                <Link key={p.id} href={`/products/${p.id}`} className="group tile block bg-ivory">
                  <div className="relative aspect-[3/4] bg-gradient-to-b from-[#FBF8F2] to-[#EFE7DB] overflow-hidden flex items-center justify-center">
                    <Image src={p.image} alt={lang === "ar" ? p.nameAr : p.nameEn} fill className="tile-img object-contain p-8" />
                  </div>
                  <div className="p-5">
                    <h4 className="product-name text-xl text-obsidian group-hover:text-crimson transition-colors">
                      {lang === "ar" ? p.nameAr : p.nameEn}
                    </h4>
                    <p className="display text-lg text-obsidian/60 mt-1" style={{ fontWeight: 500 }}>
                      {p.price.toLocaleString()} {t.details.inEgp}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
