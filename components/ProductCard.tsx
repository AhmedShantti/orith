"use client";
import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Product } from "@/types";
import { useLang } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import StarRating from "./StarRating";
import FragranceNotes from "./FragranceNotes";
import {
  getDisplayNotes,
  getProductBrand,
  getProductDescription,
  getProductName,
  normalizeRating,
} from "@/lib/product";

interface ProductCardProps {
  product: Product;
  /** Optional stagger index (kept for API compatibility with callers). */
  delay?: number;
}

const PLACEHOLDER_IMAGE = "/products/bottle-1.png";

type BadgeKey = "bestseller" | "new" | "limited" | "offer";
const BADGE_KEYS: Record<string, BadgeKey> = {
  bestseller: "bestseller",
  new: "new",
  limited: "limited",
  offer: "offer",
};

/**
 * ORITH luxury product card — a vertical, centred, editorial perfume-boutique
 * card. Every enriched section (brand, rating, fragrance notes, description)
 * renders only when data exists and degrades gracefully otherwise. Business
 * logic is untouched: it still links to `/products/[id]`, keeps the existing
 * size selection, and adds to the cart via the shared cart context.
 */
function ProductCard({ product }: ProductCardProps) {
  const { t, lang } = useLang();
  const { addItem } = useCart();
  const settings = useSiteSettings();

  const [selectedSize, setSelectedSize] = useState(product.sizes[0] ?? "");
  const [added, setAdded] = useState(false);

  const name = getProductName(product, lang);
  const storeName = settings.text("site_name", "ORITH");
  const brand = getProductBrand(product, storeName);
  const description = getProductDescription(product, lang);
  const rating = normalizeRating(product.rating);
  const notes = useMemo(() => getDisplayNotes(product), [product]);

  const href = `/products/${product.id}`;
  const hasSizes = product.sizes.length > 1;
  const imageSrc = product.image || PLACEHOLDER_IMAGE;

  const handleAdd = (e: React.MouseEvent) => {
    e.preventDefault();
    addItem(product, selectedSize);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const badgeKey = product.badge ? BADGE_KEYS[product.badge] : undefined;
  const badgeLabel = badgeKey ? t.badges[badgeKey] : null;

  return (
    <article className="lux-card group p-6 sm:p-8 text-center">
      {/* ---- Floating bottle ---- */}
      <Link
        href={href}
        aria-label={name}
        className="relative block focus:outline-none focus-visible:ring-2 focus-visible:ring-crimson/60"
      >
        {badgeLabel && (
          <span
            className={`absolute top-0 z-10 eyebrow text-[8px] px-2.5 py-1 bg-obsidian text-ivory ${
              lang === "ar" ? "right-0" : "left-0"
            }`}
          >
            {badgeLabel}
          </span>
        )}
        <div className="relative mx-auto flex aspect-square w-full max-w-[230px] items-center justify-center">
          <Image
            src={imageSrc}
            alt={name}
            fill
            loading="lazy"
            sizes="(max-width: 640px) 60vw, (max-width: 1024px) 30vw, 230px"
            className="lux-card-img object-contain p-2"
            unoptimized={imageSrc.startsWith("/products/upload-")}
          />
        </div>
      </Link>

      {/* ---- Brand (gold) ---- */}
      <p className="mt-7 font-body text-[10px] font-bold uppercase leading-none text-sand-dark [letter-spacing:0.25em] line-clamp-1">
        {brand}
      </p>

      {/* ---- Product name ---- */}
      <Link href={href} className="mt-3 block">
        <h3 className="product-name text-2xl leading-tight text-obsidian transition-colors hover:text-crimson line-clamp-2">
          {name}
        </h3>
      </Link>

      {/* ---- Rating ---- */}
      {rating !== null && (
        <StarRating
          value={rating}
          className="mt-3 justify-center"
          label={`${name} — rated ${rating} out of 5`}
        />
      )}

      {/* ---- Fragrance notes ---- */}
      {notes.length > 0 && (
        <FragranceNotes
          notes={notes}
          heading={t.details.fragrance}
          className="mt-7 w-full"
        />
      )}

      {/* ---- Description preview ---- */}
      {/* {description && (
        <p className="mt-6 font-body text-[13px] leading-relaxed text-obsidian/55 line-clamp-3">
          {description}
        </p>
      )}

      {/* ---- Size selector (only when more than one) ---- */}
      {hasSizes && (
        <div className="mt-6 flex flex-wrap justify-center gap-x-4 gap-y-2">
          {product.sizes.map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => setSelectedSize(size)}
              aria-pressed={selectedSize === size}
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

      {/* ---- Price ---- */}
      <p className="mt-7 display text-2xl text-obsidian" style={{ fontWeight: 500 }}>
        {product.price.toLocaleString()}
        <span className="ms-1.5 font-body text-[11px] tracking-widest text-obsidian/40">
          {t.details.inEgp}
        </span>
      </p>

      {/* ---- CTA — pinned to the bottom for consistent card heights ---- */}
      <div className="mt-auto pt-7">
        <button
          type="button"
          onClick={handleAdd}
          className="lux-card-cta"
          aria-label={`${t.products.addToCart} — ${name}`}
        >
          {added ? (
            <>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <polyline points="20 6 9 17 4 12" />
              </svg>
              {t.products.addToCart}
            </>
          ) : (
            t.products.addToCart
          )}
        </button>
      </div>
    </article>
  );
}

export default React.memo(ProductCard);
