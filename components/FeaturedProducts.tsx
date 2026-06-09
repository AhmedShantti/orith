"use client";
import { apiUrl } from "@/lib/api";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { Product } from "@/types";
import ProductCard from "./ProductCard";
import Reveal from "./Reveal";

export default function FeaturedProducts() {
  const { t } = useLang();
  const [featured, setFeatured] = useState<Product[]>([]);

  useEffect(() => {
    fetch(apiUrl("/api/products?limit=4"))
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
    <section className="py-28 sm:py-36 bg-ivory">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header — editorial split */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <div>
            <Reveal>
              <p className="eyebrow text-crimson mb-5">{t.products.title}</p>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="display text-4xl sm:text-5xl lg:text-6xl text-obsidian" style={{ fontWeight: 500 }}>
                The Collection
              </h2>
            </Reveal>
          </div>
          <Reveal delay={2} className="md:pb-2">
            <p className="accent-serif text-obsidian/55 text-lg max-w-xs">
              {t.products.subtitle}
            </p>
          </Reveal>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-obsidian/10 border border-obsidian/10">
          {featured.map((product, i) => (
            <Reveal key={product.id} delay={(i % 4) as 0 | 1 | 2 | 3} className="bg-ivory">
              <ProductCard product={product} />
            </Reveal>
          ))}
        </div>

        {/* CTA */}
        <Reveal className="text-center mt-16">
          <Link href="/products" className="btn-ghost text-obsidian">
            View All Fragrances
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
