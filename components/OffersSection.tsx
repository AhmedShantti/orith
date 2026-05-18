"use client";
import React from "react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { offers } from "@/data/products";
import OfferCard from "./OfferCard";

export default function OffersSection() {
  const { t } = useLang();

  return (
    <section className="py-24 bg-gradient-to-b from-beige/60 to-champagne/30 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-gold/5 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-rose/10 blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="gold-line" />
            <span className="text-xs tracking-[0.4em] uppercase text-gold font-body font-light">
              Deals
            </span>
            <div className="gold-line" />
          </div>
          <h2
            className="font-display text-4xl sm:text-5xl font-light text-obsidian mb-4"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {t.offers.title}
          </h2>
          <p className="font-body text-obsidian/50 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
            {t.offers.subtitle}
          </p>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {offers.map((offer, i) => (
            <OfferCard key={offer.id} offer={offer} delay={i * 100} />
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-14">
          <Link
            href="/offers"
            className="inline-flex items-center gap-3 btn-gold px-10 py-4 rounded-full text-sm tracking-[0.15em] uppercase font-body font-medium"
          >
            View All Offers
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
