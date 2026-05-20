"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { Product } from "@/types";
import ProductCard from "./ProductCard";

export default function FeaturedProducts() {
  const { t } = useLang();
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    fetch("/api/products?limit=4")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setFeatured(
            res.data.map((p: Record<string, unknown>) => ({
              id: p.id,
              nameEn: p.nameEn,
              nameAr: p.nameAr,
              descriptionEn: p.descriptionEn,
              descriptionAr: p.descriptionAr,
              price: p.price,
              originalPrice: p.originalPrice,
              image: p.image,
              sizes: p.sizes,
              category: p.category,
              badge: p.badge,
            }))
          );
        }
      })
      .catch(console.error);
  }, []);

  return (
    <section className="py-24 bg-ivory">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="gold-line" />
            <span className="text-xs tracking-[0.4em] uppercase text-gold font-body font-light">
              Collection
            </span>
            <div className="gold-line" />
          </div>
          <h2
            className="font-display text-4xl sm:text-5xl font-light text-obsidian mb-4"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {t.products.title}
          </h2>
          <p className="font-body text-obsidian/50 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            {t.products.subtitle}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featured.map((product, i) => (
            <ProductCard key={product.id} product={product} delay={i * 100} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Link
            href="/products"
            className="inline-flex items-center gap-3 px-10 py-4 rounded-full border border-gold text-gold text-sm tracking-[0.15em] uppercase font-body font-medium hover:bg-gold hover:text-white transition-all duration-300"
          >
            View All Collection
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
