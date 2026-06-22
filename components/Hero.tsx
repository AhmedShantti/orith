"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import { products } from "@/data/products";
import Emblem from "./Emblem";
import { ArrowDown } from "lucide-react";
import i18n from "i18next";


// Hero spotlights the first 8 of the catalog. Full 31-item collection lives at /products.
const HERO_BOTTLES = products.slice(0, 8);
const dir = i18n.dir();

export default function Hero() {
  const { t, lang } = useLang();
  const s = useSiteSettings();
  const [selected, setSelected] = useState(0);

  const selectedProduct = HERO_BOTTLES[selected];
  const selectedName =
    lang === "ar" ? selectedProduct.nameAr : selectedProduct.nameEn;
  const selectedDesc =
    lang === "ar" ? selectedProduct.descriptionAr : selectedProduct.descriptionEn;

  // Editable hero content (falls back to the built-in copy).
  const siteName = s.text("site_name", "ORITH");
  const heroHeadline = s.text("hero_headline", t.hero.headline);
  const heroSub = s.text("hero_subheadline", "");
  const ctaLabel = s.text("hero_cta_label", t.hero.cta);
  const ctaUrl = s.get("hero_cta_url") || `/products/${selectedProduct.id}`;
  const bgImage = s.image("hero_background_image");
  const overlayColor = s.get("hero_overlay_color", "#0C0B0A");
  const overlayOpacity = Math.min(
    1,
    Math.max(0, parseFloat(s.get("hero_overlay_opacity", "0.5")) || 0.5)
  );

  return (
    <section className="hero-dark relative min-h-screen flex flex-col items-center overflow-hidden text-ivory">
      {/* Optional background image + overlay */}
      {bgImage && (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={bgImage}
            alt=""
            aria-hidden
            className="absolute inset-0 w-full h-full object-cover z-0"
          />
          <div
            className="absolute inset-0 z-0 pointer-events-none"
            style={{ backgroundColor: overlayColor, opacity: overlayOpacity }}
            aria-hidden
          />
        </>
      )}

      {/* Light beam from above */}
      <div className="hero-light-beam" aria-hidden />

      {/* Soft horizontal mist band where light meets bottles */}
      <div
        className="absolute left-0 right-0 top-[36%] h-[180px] pointer-events-none z-[1]"
        style={{
          background:
            "radial-gradient(ellipse at center, rgba(220,200,160,0.18) 0%, rgba(220,200,160,0.06) 35%, transparent 70%)",
          filter: "blur(20px)",
        }}
        aria-hidden
      />

      {/* Vignette top + bottom */}
      <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-black to-transparent pointer-events-none z-[2]" />
      <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-black to-transparent pointer-events-none z-[2]" />

      {/* Giant faded wordmark behind the lineup */}
      <span
        className="section-watermark"
        style={{ color: "transparent", WebkitTextStroke: "1px rgba(178,58,68,0.13)", top: "6%" }}
        aria-hidden
      >
        ORITH
      </span>

      {/* Brand title block */}
      <div className="relative z-10 flex flex-col items-center pt-28 sm:pt-32 mb-2">
        <Emblem size={34} className="text-gold/70 mb-5" />
        <h1
          className="font-display text-3xl sm:text-4xl tracking-[0.4em] text-ivory"
          style={{ fontFamily: "var(--font-cinzel)", fontWeight: 600 }}
        >
          {siteName}
        </h1>
        <p className="text-[9px] sm:text-[10px] tracking-[0.5em] uppercase text-ivory/45 font-body font-light mt-3">
          Maison de Parfum
        </p>
        {heroHeadline && (
          <h2
            className="display text-xl sm:text-2xl text-ivory/90 text-center mt-6 max-w-2xl whitespace-pre-line px-6"
            style={{ fontWeight: 500 }}
          >
            {heroHeadline}
          </h2>
        )}
        {heroSub && (
          <p className="accent-serif text-ivory/55 text-base sm:text-lg text-center mt-4 max-w-xl px-6 leading-relaxed">
            {heroSub}
          </p>
        )}
        {/* tiny gold divider */}
        <div className="mt-6 flex items-center gap-3 text-ivory/40">
          <span className="w-8 h-px bg-gold/30" />
          <ArrowDown />
          <span className="w-8 h-px bg-gold/30" />
        </div>

        {/* Featured bottle — large, centered, grounded; cap overlaps the letters */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 z-10 h-[74vh] sm:h-[78vh] w-[min(400px,80vw)]">
          <div className="bottle-glow relative w-full h-full flex items-end justify-center">
            <Image
              key={selectedProduct.id}
              src={selectedProduct.image}
              alt={selectedName}
              fill
              priority
              sizes="(max-width: 640px) 80vw, 400px"
              className="object-contain relative z-10 drop-shadow-[0_40px_70px_rgba(0,0,0,0.75)] animate-[fadeIn_0.6s_ease]"
            />
          </div>
        </div>

      {/* Bottom CTA block */}
      <div className="relative z-10 flex flex-col items-center pb-24 sm:pb-28">
        <p className="text-[9px] sm:text-[10px] tracking-[0.4em] uppercase text-ivory/40 font-body font-light mb-4">
          Find your signature fragrance
        </p>
        <Link
          href={ctaUrl}
          className="group inline-flex items-center gap-3 text-[11px] tracking-[0.45em] uppercase text-ivory font-body font-light pb-2 border-b border-gold/40 hover:border-gold hover:text-gold transition-colors duration-500"
        >
          <span>{ctaLabel}</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            {lang === "ar" ? "←" : "→"}
          </span>
        </Link>
      </div>

        {/* Emblem badge bottom-start (ZORVYN circular logo cue) */}
        <div className="absolute bottom-6 start-6 z-20 w-12 h-12 rounded-full border border-ivory/15 items-center justify-center hidden lg:flex">
          <Emblem size={22} className="text-crimson-light" />
        </div>

        {/* Prev / next + dot indicators bottom-center (replaces thumbnail rail) */}
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
          <button
            onClick={() => setSelected((s) => (s - 1 + HERO_BOTTLES.length) % HERO_BOTTLES.length)}
            className="text-ivory/40 hover:text-crimson-light transition-colors"
            aria-label="Previous bottle"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d={dir === "rtl" ? "M5 12h14M12 5l7 7-7 7" : "M19 12H5M12 19l-7-7 7-7"} />
            </svg>
          </button>
          <div className="flex items-center gap-1.5">
            {HERO_BOTTLES.map((_, i) => (
              <button
                key={i}
                onClick={() => setSelected(i)}
                aria-label={`Select bottle ${i + 1}`}
                className={`h-px transition-all duration-500 ${
                  i === selected ? "w-7 bg-crimson-light" : "w-3 bg-ivory/20 hover:bg-ivory/40"
                }`}
              />
            ))}
          </div>
          <button
            onClick={() => setSelected((s) => (s + 1) % HERO_BOTTLES.length)}
            className="text-ivory/40 hover:text-crimson-light transition-colors"
            aria-label="Next bottle"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4">
              <path d={dir === "rtl" ? "M19 12H5M12 19l-7-7 7-7" : "M5 12h14M12 5l7 7-7 7"} />
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile + tablet copy (stacked, below the stage) */}
      <div className="relative z-20 lg:hidden flex flex-col items-center text-center px-6 mb-6">
        <p className="product-name text-2xl text-ivory mb-2" lang={lang}>{selectedName}</p>
        <p className="font-body text-xs text-ivory/55 leading-relaxed max-w-xs mb-5">
          {selectedDesc.length > 120 ? selectedDesc.slice(0, 117) + "…" : selectedDesc}
        </p>
        <Link href={`/products/${selectedProduct.id}`} className="btn-pill">
          {lang === "ar" ? "تسوق الآن" : "Shop Now"}
        </Link>
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}
