"use client";
import React, { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useLang } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { products } from "@/data/products";

export default function ProductDetailsPage() {
  const params = useParams();
  const { t, lang } = useLang();
  const { addItem } = useCart();
  const product = products.find((p) => p.id === params.id);
  const [selectedSize, setSelectedSize] = useState(product?.sizes[0] || "");
  const [added, setAdded] = useState(false);

  if (!product) {
    return (
      <div className="pt-32 pb-24 min-h-screen bg-ivory flex items-center justify-center">
        <div className="text-center">
          <p className="font-display text-3xl font-light text-obsidian/40" style={{ fontFamily: "var(--font-cormorant)" }}>
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
            <div className="relative aspect-[3/4] rounded-3xl overflow-hidden bg-gradient-to-br from-champagne/40 via-ivory to-beige/60 shadow-luxury-lg flex items-center justify-center">
              <Image
                src={product.image}
                alt={name}
                fill
                className="object-contain p-10"
                priority
              />
              {/* Badge */}
              {product.badge && (
                <div className={`absolute top-6 ${lang === "ar" ? "right-6" : "left-6"} px-4 py-2 rounded-full text-xs tracking-[0.1em] uppercase font-body font-medium ${
                  product.badge === "bestseller" ? "bg-gold text-white" :
                  product.badge === "new" ? "bg-obsidian text-white" :
                  product.badge === "limited" ? "bg-rose-deep text-white" : "bg-gold text-white"
                }`}>
                  {product.badge === "bestseller" ? t.badges.bestseller :
                   product.badge === "new" ? t.badges.new :
                   product.badge === "limited" ? t.badges.limited : t.badges.offer}
                </div>
              )}
            </div>

            {/* Decorative accent */}
            <div className="absolute -z-10 -bottom-6 -right-6 w-64 h-64 rounded-full bg-gold/8 blur-2xl" />
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
                style={{ fontFamily: "var(--font-cormorant)" }}
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
                    className={`px-6 py-3 rounded-full text-sm tracking-wider uppercase font-body border-2 transition-all duration-300 ${
                      selectedSize === size
                        ? "border-gold bg-gold/10 text-gold font-medium"
                        : "border-obsidian/15 text-obsidian/60 hover:border-gold/40 hover:text-gold"
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
              className={`w-full py-5 rounded-full text-sm tracking-[0.2em] uppercase font-body font-medium mb-4 transition-all duration-300 ${
                added ? "bg-green-500 text-white scale-[0.99]" : "btn-gold"
              }`}
            >
              {added ? "✓ Added to Cart!" : t.products.addToCart}
            </button>

            <Link
              href="/cart"
              className="w-full py-4 rounded-full text-sm tracking-[0.2em] uppercase font-body font-medium border border-obsidian/20 text-obsidian/60 hover:border-gold hover:text-gold transition-all duration-300 flex items-center justify-center"
            >
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
                      className="bg-white rounded-2xl p-4 text-center shadow-card"
                    >
                      <div className="text-gold/60 text-lg mb-2">{group.icon}</div>
                      <p className="text-[10px] tracking-[0.3em] uppercase font-body text-obsidian/40 mb-3">
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
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {related.map((p) => (
                <Link key={p.id} href={`/products/${p.id}`} className="group product-card block bg-white rounded-3xl overflow-hidden shadow-card">
                  <div className="relative aspect-[3/4] bg-gradient-to-br from-champagne/40 via-ivory to-beige/60 overflow-hidden flex items-center justify-center">
                    <Image src={p.image} alt={lang === "ar" ? p.nameAr : p.nameEn} fill className="card-img object-contain p-6" />
                  </div>
                  <div className="p-5">
                    <h4 className="product-name text-xl text-obsidian group-hover:text-gold transition-colors">
                      {lang === "ar" ? p.nameAr : p.nameEn}
                    </h4>
                    <p className="font-display text-lg font-light text-obsidian/60 mt-1" style={{ fontFamily: "var(--font-cormorant)" }}>
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
