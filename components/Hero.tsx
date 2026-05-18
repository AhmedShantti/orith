"use client";
import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useLang } from "@/context/LanguageContext";
import { products } from "@/data/products";

export default function Hero() {
  const { t, lang } = useLang();
  const [selected, setSelected] = useState(0);

  const selectedProduct = products[selected];
  const selectedName =
    lang === "ar" ? selectedProduct.nameAr : selectedProduct.nameEn;

  return (
    <section className="hero-dark relative min-h-screen flex flex-col items-center overflow-hidden text-ivory">
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

      {/* Brand title block */}
      <div className="relative z-10 flex flex-col items-center pt-28 sm:pt-32 mb-2">
        <h1
          className="font-display text-2xl sm:text-3xl tracking-[0.45em] uppercase text-ivory"
          style={{ fontFamily: "var(--font-cormorant)", fontWeight: 400 }}
        >
          Orith
        </h1>
        <p className="text-[9px] sm:text-[10px] tracking-[0.5em] uppercase text-ivory/45 font-body font-light mt-3">
          Signature Collection
        </p>
        {/* tiny gold divider */}
        <div className="mt-6 flex items-center gap-3 text-ivory/40">
          <span className="w-8 h-px bg-gold/30" />
          <ArrowDown />
          <span className="w-8 h-px bg-gold/30" />
        </div>
        <p className="text-[9px] tracking-[0.35em] uppercase text-ivory/35 font-body mt-2">
          Discover
        </p>
      </div>

      {/* Bottle lineup */}
      <div className="relative z-10 flex-1 w-full flex items-center justify-center px-4">
        <div
          className="flex items-end gap-3 sm:gap-5 lg:gap-7 overflow-x-auto sm:overflow-visible w-full max-w-[1300px] px-6 py-12 scrollbar-hide"
          style={{ scrollbarWidth: "none" }}
        >
          {products.map((p, i) => {
            const isSelected = selected === i;
            const name = lang === "ar" ? p.nameAr : p.nameEn;
            return (
              <button
                key={p.id}
                onClick={() => setSelected(i)}
                className="group relative flex-shrink-0 transition-all duration-700 outline-none"
                aria-label={name}
              >
                {/* Label above selected */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 transition-all duration-500 whitespace-nowrap text-center ${
                    isSelected
                      ? "opacity-100 -top-14"
                      : "opacity-0 -top-10"
                  }`}
                >
                  <p
                    className="font-display text-xs sm:text-sm text-ivory tracking-[0.15em]"
                    style={{
                      fontFamily: "var(--font-cormorant)",
                      fontStyle: lang === "en" ? "italic" : "normal",
                      fontWeight: 400,
                    }}
                  >
                    {name}
                  </p>
                  <p className="text-[7px] sm:text-[8px] tracking-[0.4em] uppercase text-ivory/35 font-body mt-1">
                    Eau de Parfum
                  </p>
                </div>

                {/* Bottle frame */}
                <div
                  className={`relative transition-all duration-700 ease-out ${
                    isSelected
                      ? "w-[120px] h-[180px] sm:w-[140px] sm:h-[210px] lg:w-[160px] lg:h-[240px] p-4 bg-black/40 backdrop-blur-sm"
                      : "w-[90px] h-[160px] sm:w-[105px] sm:h-[185px] lg:w-[120px] lg:h-[210px] p-3 opacity-55 hover:opacity-85"
                  }`}
                  style={
                    isSelected
                      ? {
                          border: "1px solid rgba(212, 175, 55, 0.7)",
                          boxShadow:
                            "0 0 0 1px rgba(212,175,55,0.15), 0 30px 60px rgba(212,175,55,0.18), inset 0 0 30px rgba(212,175,55,0.06)",
                        }
                      : {}
                  }
                >
                  <Image
                    src={p.image}
                    alt={name}
                    fill
                    className="object-contain p-2"
                    sizes="160px"
                  />
                  {/* Corner accents on selected */}
                  {isSelected && (
                    <>
                      <CornerTick className="absolute -top-px -left-px" rotate={0} />
                      <CornerTick className="absolute -top-px -right-px" rotate={90} />
                      <CornerTick className="absolute -bottom-px -right-px" rotate={180} />
                      <CornerTick className="absolute -bottom-px -left-px" rotate={270} />
                    </>
                  )}
                </div>

                {/* Reflection / shelf glow under bottle */}
                <div
                  className={`absolute left-1/2 -translate-x-1/2 -bottom-3 transition-opacity duration-500 ${
                    isSelected ? "opacity-100" : "opacity-30"
                  }`}
                  style={{
                    width: isSelected ? "120%" : "90%",
                    height: "10px",
                    background:
                      "radial-gradient(ellipse at center, rgba(212,175,55,0.4) 0%, transparent 70%)",
                    filter: "blur(4px)",
                  }}
                />
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom CTA block */}
      <div className="relative z-10 flex flex-col items-center pb-24 sm:pb-28">
        <p className="text-[9px] sm:text-[10px] tracking-[0.4em] uppercase text-ivory/40 font-body font-light mb-4">
          Find your signature fragrance
        </p>
        <Link
          href={`/products/${selectedProduct.id}`}
          className="group inline-flex items-center gap-3 text-[11px] tracking-[0.45em] uppercase text-ivory font-body font-light pb-2 border-b border-gold/40 hover:border-gold hover:text-gold transition-colors duration-500"
        >
          <span>{t.hero.cta}</span>
          <span className="transition-transform duration-300 group-hover:translate-x-1">
            {lang === "ar" ? "←" : "→"}
          </span>
        </Link>
      </div>

      {/* Position indicator dots (faint) */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
        {products.map((_, i) => (
          <button
            key={i}
            onClick={() => setSelected(i)}
            className={`h-px transition-all duration-500 ${
              i === selected
                ? "w-6 bg-gold"
                : "w-3 bg-ivory/20 hover:bg-ivory/40"
            }`}
            aria-label={`Select bottle ${i + 1}`}
          />
        ))}
      </div>

      {/* Lang chip bottom-right (matches reference) */}
      <div className="absolute bottom-6 right-6 text-[9px] tracking-[0.4em] uppercase text-ivory/40 font-body z-10">
        {lang}
      </div>

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

function ArrowDown() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="12" y1="5" x2="12" y2="19" />
      <polyline points="6 13 12 19 18 13" />
    </svg>
  );
}

function CornerTick({
  className = "",
  rotate = 0,
}: {
  className?: string;
  rotate?: number;
}) {
  return (
    <div
      className={className}
      style={{ width: 10, height: 10, transform: `rotate(${rotate}deg)` }}
    >
      <svg viewBox="0 0 10 10" fill="none">
        <path
          d="M0 0 L4 0 M0 0 L0 4"
          stroke="#d4af37"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
}
