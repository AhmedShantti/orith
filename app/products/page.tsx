"use client";
import React, { useState, useMemo, useEffect } from "react";
import { useLang } from "@/context/LanguageContext";
import { categories } from "@/data/products";
import { Product } from "@/types";
import ProductCard from "@/components/ProductCard";

export default function ProductsPage() {
  const { t, lang } = useLang();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/products?limit=100")
      .then((res) => res.json())
      .then((res) => {
        if (res.success && res.data) {
          setProducts(
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
              notes:
                (p.notesTop as string[])?.length ||
                (p.notesHeart as string[])?.length ||
                (p.notesBase as string[])?.length
                  ? {
                      top: p.notesTop as string[],
                      heart: p.notesHeart as string[],
                      base: p.notesBase as string[],
                    }
                  : undefined,
            }))
          );
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      const name = lang === "ar" ? p.nameAr : p.nameEn;
      const desc = lang === "ar" ? p.descriptionAr : p.descriptionEn;
      const matchSearch =
        !search ||
        name.toLowerCase().includes(search.toLowerCase()) ||
        desc.toLowerCase().includes(search.toLowerCase());
      const matchCat =
        activeCategory === "all" || p.category === activeCategory;
      return matchSearch && matchCat;
    });
  }, [search, activeCategory, lang, products]);

  return (
    <div className="page-transition pt-24 pb-24 min-h-screen bg-ivory">
      {/* Page header */}
      <div className="bg-gradient-to-b from-beige/80 to-ivory py-16 mb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="gold-line" />
            <span className="text-xs tracking-[0.4em] uppercase text-gold font-body font-light">
              Collection
            </span>
            <div className="gold-line" />
          </div>
          <h1
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-light text-obsidian"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {t.products.title}
          </h1>
          <p className="font-body text-obsidian/50 mt-3 text-sm sm:text-base">
            {t.products.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-10 items-start sm:items-center">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="absolute top-1/2 -translate-y-1/2 start-4 text-obsidian/30"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.products.search}
              className="w-full ps-10 pe-4 py-3 rounded-full border border-obsidian/10 bg-white text-sm font-body text-obsidian placeholder-obsidian/30 focus:outline-none focus:border-gold transition-colors"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs tracking-widest uppercase font-body transition-all duration-300 ${
                  activeCategory === cat.id
                    ? "bg-obsidian text-white"
                    : "border border-obsidian/15 text-obsidian/60 hover:border-gold hover:text-gold"
                }`}
              >
                {lang === "ar" ? cat.labelAr : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="text-xs font-body text-obsidian/40 mb-6 tracking-wider">
          {filtered.length} fragrance{filtered.length !== 1 ? "s" : ""} found
        </p>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-card animate-pulse">
                <div className="aspect-[3/4] bg-beige/40" />
                <div className="p-5 space-y-3">
                  <div className="h-5 bg-beige/40 rounded w-3/4" />
                  <div className="h-4 bg-beige/40 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        ) : filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filtered.map((product, i) => (
              <ProductCard key={product.id} product={product} delay={i * 80} />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 flex flex-col items-center gap-4">
            <div className="w-20 h-20 rounded-full bg-beige flex items-center justify-center text-obsidian/20">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <p className="font-display text-2xl font-light text-obsidian/40" style={{ fontFamily: "var(--font-cormorant)" }}>
              {t.products.noResults}
            </p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("all"); }}
              className="text-xs tracking-widest uppercase text-gold font-body hover:underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
