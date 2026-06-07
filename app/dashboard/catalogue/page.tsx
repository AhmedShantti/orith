"use client";
import React, { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import Emblem from "@/components/Emblem";
import type { Product } from "@/types";

const fmt = (n: number) => n.toLocaleString();

const badgeLabel: Record<string, string> = {
  bestseller: "Bestseller",
  new: "New",
  limited: "Limited",
  offer: "Offer",
};

export default function CataloguePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/products");
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

  const cats = useMemo(() => {
    const set = Array.from(new Set(products.map((p) => p.category)));
    return ["all", ...set];
  }, [products]);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const matchCat = activeCat === "all" || p.category === activeCat;
        const matchSearch =
          !search ||
          p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
          p.nameAr.includes(search);
        return matchCat && matchSearch;
      }),
    [products, activeCat, search]
  );

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <Emblem size={40} className="text-crimson animate-pulse" />
        <p className="eyebrow text-[10px] text-obsidian/40">Loading…</p>
      </div>
    );
  }

  return (
    <div className="page-transition px-6 lg:px-12 py-10 lg:py-14">
      {/* Header */}
      <div className="border-b border-obsidian/12 pb-8 mb-12">
        <p className="eyebrow text-crimson mb-4">Administration</p>
        <h1
          className="display text-4xl sm:text-5xl lg:text-6xl text-obsidian"
          style={{ fontWeight: 600 }}
        >
          Catalogue
        </h1>
      </div>

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs border-b border-obsidian/20 focus-within:border-crimson transition-colors">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            className="absolute top-1/2 -translate-y-1/2 start-0 text-obsidian/30"
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search fragrances…"
            className="w-full ps-7 pe-2 py-3 bg-transparent text-sm font-body text-obsidian placeholder-obsidian/30 focus:outline-none tracking-wide"
          />
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 items-center">
          {cats.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`eyebrow text-[10px] pb-1.5 border-b transition-colors capitalize ${
                activeCat === cat
                  ? "border-crimson text-crimson"
                  : "border-transparent text-obsidian/50 hover:text-obsidian"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <p className="eyebrow text-[9px] text-obsidian/40 mb-6">
        {String(filtered.length).padStart(2, "0")} — Fragrance
        {filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      <div className="border border-obsidian/10 overflow-x-auto">
        <table className="w-full min-w-[680px]">
          <thead>
            <tr className="bg-obsidian/[0.03] border-b border-obsidian/10">
              {["Fragrance", "Category", "Size", "Status", "Price"].map((h) => (
                <th
                  key={h}
                  className="eyebrow text-[9px] text-obsidian/40 text-start px-6 py-4 font-normal"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="border-b border-obsidian/8 hover:bg-crimson/[0.03] transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-10 h-12 shrink-0 bg-beige/60 overflow-hidden">
                      <Image
                        src={p.image}
                        alt={p.nameEn}
                        fill
                        sizes="40px"
                        className="object-contain"
                      />
                    </div>
                    <div>
                      <p className="product-name text-base text-obsidian leading-tight">
                        {p.nameEn}
                      </p>
                      <p className="font-body text-[11px] text-obsidian/40 mt-0.5">
                        #{p.id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="eyebrow text-[9px] text-obsidian/60 capitalize">
                    {p.category}
                  </span>
                </td>
                <td className="px-6 py-4 font-body text-xs text-obsidian/60">
                  {p.sizes.join(", ")}
                </td>
                <td className="px-6 py-4">
                  {p.badge ? (
                    <span className="inline-block eyebrow text-[8px] text-crimson border border-crimson/30 px-2 py-1">
                      {badgeLabel[p.badge] ?? p.badge}
                    </span>
                  ) : (
                    <span className="font-body text-xs text-obsidian/30">—</span>
                  )}
                </td>
                <td className="px-6 py-4 display text-base text-obsidian whitespace-nowrap" style={{ fontWeight: 500 }}>
                  {fmt(p.price)}
                  <span className="font-body text-[10px] text-obsidian/40 ms-1">
                    EGP
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <Emblem size={32} className="text-obsidian/20" />
            <p className="display text-xl text-obsidian/40">No fragrances found</p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCat("all");
              }}
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
