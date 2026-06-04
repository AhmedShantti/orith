"use client";
import React, { useState, useMemo } from "react";
import { useLang } from "@/context/LanguageContext";
import { products, categories } from "@/data/products";
import ProductCard from "@/components/ProductCard";
import Emblem from "@/components/Emblem";

export default function ProductsPage() {
  const { t, lang } = useLang();
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

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
  }, [search, activeCategory, lang]);

  return (
    <div className="page-transition pt-32 pb-28 min-h-screen bg-ivory">
      {/* Page header */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-10 mb-14">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-obsidian/12 pb-10">
          <div>
            <p className="eyebrow text-crimson mb-5">Maison de Parfum · Collection</p>
            <h1 className="display text-5xl sm:text-6xl lg:text-7xl text-obsidian" style={{ fontWeight: 600 }}>
              {t.products.title}
            </h1>
          </div>
          <p className="accent-serif text-obsidian/55 text-lg max-w-xs md:pb-2">
            {t.products.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-6 lg:px-10">
        {/* Search + Filter */}
        <div className="flex flex-col lg:flex-row gap-6 mb-12 items-start lg:items-center lg:justify-between">
          {/* Search */}
          <div className="relative w-full max-w-sm border-b border-obsidian/20 focus-within:border-crimson transition-colors">
            <svg
              width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"
              className="absolute top-1/2 -translate-y-1/2 start-0 text-obsidian/30"
            >
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.products.search}
              className="w-full ps-7 pe-2 py-3 bg-transparent text-sm font-body text-obsidian placeholder-obsidian/30 focus:outline-none tracking-wide"
            />
          </div>

          {/* Categories */}
          <div className="flex flex-wrap gap-x-6 gap-y-3">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`eyebrow text-[10px] pb-1.5 border-b transition-colors ${
                  activeCategory === cat.id
                    ? "border-crimson text-crimson"
                    : "border-transparent text-obsidian/50 hover:text-obsidian"
                }`}
              >
                {lang === "ar" ? cat.labelAr : cat.labelEn}
              </button>
            ))}
          </div>
        </div>

        {/* Results count */}
        <p className="eyebrow text-[9px] text-obsidian/40 mb-8">
          {String(filtered.length).padStart(2, "0")} — Fragrance{filtered.length !== 1 ? "s" : ""}
        </p>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-px bg-obsidian/10 border border-obsidian/10">
            {filtered.map((product) => (
              <div key={product.id} className="bg-ivory">
                <ProductCard product={product} />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-24 flex flex-col items-center gap-5">
            <Emblem size={40} className="text-obsidian/20" />
            <p className="display text-2xl text-obsidian/40">{t.products.noResults}</p>
            <button
              onClick={() => { setSearch(""); setActiveCategory("all"); }}
              className="eyebrow text-[10px] text-crimson link-underline"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
