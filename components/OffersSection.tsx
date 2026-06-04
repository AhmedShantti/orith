"use client";
import React from "react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { offers } from "@/data/products";
import OfferCard from "./OfferCard";
import Reveal from "./Reveal";

export default function OffersSection() {
  const { t } = useLang();

  return (
    <section className="py-28 sm:py-36 bg-beige">
      <div className="max-w-7xl mx-auto px-6 lg:px-10">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-8 mb-16">
          <div>
            <Reveal>
              <p className="eyebrow text-crimson mb-5">{t.offers.title}</p>
            </Reveal>
            <Reveal delay={1}>
              <h2 className="display text-4xl sm:text-5xl lg:text-6xl text-obsidian" style={{ fontWeight: 500 }}>
                Maison Selection
              </h2>
            </Reveal>
          </div>
          <Reveal delay={2} className="md:pb-2">
            <p className="accent-serif text-obsidian/55 text-lg max-w-xs">
              {t.offers.subtitle}
            </p>
          </Reveal>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-obsidian/10 border border-obsidian/10">
          {offers.map((offer, i) => (
            <Reveal key={offer.id} delay={(i % 4) as 0 | 1 | 2 | 3} className="bg-ivory">
              <OfferCard offer={offer} />
            </Reveal>
          ))}
        </div>

        <Reveal className="text-center mt-16">
          <Link href="/offers" className="btn-crimson">
            View All Offers
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
