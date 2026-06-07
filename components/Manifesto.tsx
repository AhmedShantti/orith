"use client";
import React from "react";
import { useLang } from "@/context/LanguageContext";
import Emblem from "./Emblem";
import Reveal from "./Reveal";

/**
 * Full-bleed crimson-silk manifesto — the brand statement at maximum scale.
 * Giant faded wordmark behind, the brand line in Cinzel, EST · 1995.
 */
export default function Manifesto() {
  const { lang } = useLang();

  return (
    <section className="bg-silk relative overflow-hidden text-ivory">
      {/* faded wordmark watermark */}
      <span
        className="section-watermark"
        style={{ color: "transparent", WebkitTextStroke: "1px rgba(246,242,235,0.07)" }}
        aria-hidden
      >
        ORITH
      </span>

      {/* film grain / vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-obsidian/70 via-transparent to-obsidian/40 pointer-events-none" />

      <div className="relative z-10 max-w-5xl mx-auto px-6 py-32 sm:py-40 text-center">
        <Reveal className="flex justify-center mb-10">
          <Emblem size={44} className="text-ivory/80" />
        </Reveal>

        <Reveal delay={1}>
          <p className="eyebrow text-ivory/55 mb-8">
            {lang === "ar" ? "بيت العطور" : "Maison de Parfum"}
          </p>
        </Reveal>

        <Reveal delay={1}>
          <h2
            className="display text-ivory text-[2.6rem] sm:text-6xl lg:text-7xl"
            style={{ fontWeight: 500 }}
          >
            {lang === "ar" ? (
              <>خالدٌ بالتصميم،<br /><span className="text-sand">مُعرّفٌ بالجوهر</span></>
            ) : (
              <>Timeless by Design,<br /><span className="text-sand">Defined by Essence</span></>
            )}
          </h2>
        </Reveal>

        <Reveal delay={2}>
          <p className="accent-serif text-ivory/65 text-xl sm:text-2xl leading-relaxed max-w-2xl mx-auto mt-10">
            {lang === "ar"
              ? "في أوريث، العطر أكثر من مجرد رائحة — إنه تعبير عن الأناقة الهادئة، مصنوع بدقة وذوق رفيع خالد."
              : "At ORITH, fragrance is more than a scent — it is a statement of quiet elegance, crafted with precision and a world of refinement."}
          </p>
        </Reveal>

        <Reveal delay={3} className="mt-14 flex items-center justify-center gap-5">
          <span className="eyebrow text-ivory/50">EST</span>
          <span className="w-12 h-px bg-ivory/30" />
          <span className="eyebrow text-ivory/50">1995</span>
        </Reveal>
      </div>
    </section>
  );
}
