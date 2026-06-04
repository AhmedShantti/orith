"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { products } from "@/data/products";
import Emblem from "./Emblem";
import Reveal from "./Reveal";

// Spotlight the signature flacon. L'Amour Rouge — the deep crimson of the house.
const SIGNATURE = products.find((p) => p.id === "28") ?? products[0];

export default function EssenceSection() {
  const { t, lang } = useLang();
  const name = lang === "ar" ? SIGNATURE.nameAr : SIGNATURE.nameEn;
  const desc = lang === "ar" ? SIGNATURE.descriptionAr : SIGNATURE.descriptionEn;

  return (
    <section className="bg-obsidian-field relative overflow-hidden text-ivory">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 py-28 sm:py-36 grid lg:grid-cols-2 gap-16 items-center">
        {/* Flacon */}
        <Reveal className="relative order-2 lg:order-1">
          <div className="relative aspect-[4/5] flex items-center justify-center">
            {/* crimson floor glow */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] rounded-full blur-3xl"
              style={{ background: "radial-gradient(circle, rgba(178,58,68,0.45) 0%, transparent 65%)" }}
            />
            {/* hairline frame */}
            <div className="absolute inset-6 border border-ivory/10" />
            <Image
              src={SIGNATURE.image}
              alt={name}
              fill
              className="object-contain p-12 relative z-10 drop-shadow-[0_30px_60px_rgba(0,0,0,0.6)]"
              sizes="(max-width: 1024px) 80vw, 40vw"
            />
            {/* corner emblem */}
            <Emblem size={26} className="absolute top-6 right-6 text-ivory/40 z-10" />
          </div>
        </Reveal>

        {/* Copy */}
        <div className="order-1 lg:order-2">
          <Reveal>
            <p className="eyebrow text-crimson-light mb-7">
              {lang === "ar" ? "العطر المميّز" : "The Signature"}
            </p>
          </Reveal>
          <Reveal delay={1}>
            <h2 className="display text-5xl sm:text-6xl lg:text-7xl mb-6" style={{ fontWeight: 500 }}>
              {name}
            </h2>
          </Reveal>
          <Reveal delay={1}>
            <p className="accent-serif text-ivory/60 text-xl sm:text-2xl leading-relaxed max-w-xl mb-10">
              {desc}
            </p>
          </Reveal>

          {/* Spec lines — brand-book language */}
          <Reveal delay={2}>
            <div className="space-y-0 max-w-md mb-12">
              {[
                ["Concentration", "Extrait de Parfum"],
                ["Format", "100 ML · 3.4 FL.OZ."],
                ["Application", "Vaporisateur Natural Spray"],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between py-4 border-t border-ivory/10 last:border-b">
                  <span className="eyebrow text-ivory/40">{k}</span>
                  <span className="font-body text-sm text-ivory/80 tracking-wide">{v}</span>
                </div>
              ))}
            </div>
          </Reveal>

          <Reveal delay={3} className="flex flex-wrap items-center gap-6">
            <Link href={`/products/${SIGNATURE.id}`} className="btn-ghost text-ivory">
              {t.products.viewDetails}
            </Link>
            <span className="display text-3xl text-sand">
              {SIGNATURE.price.toLocaleString()}
              <span className="font-body text-sm text-ivory/40 ms-2 tracking-widest">{t.details.inEgp}</span>
            </span>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
