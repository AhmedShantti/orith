"use client";
import React from "react";
import { useLang } from "@/context/LanguageContext";
import { offers } from "@/data/products";
import OfferCard from "@/components/OfferCard";

export default function OffersPage() {
  const { t } = useLang();

  return (
    <div className="page-transition pt-32 pb-28 min-h-screen bg-ivory">
      {/* Header */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-10 mb-12">
        <div className="border-b border-obsidian/12 pb-10">
          <p className="eyebrow text-crimson mb-5">Maison Selection</p>
          <h1 className="display text-5xl sm:text-6xl lg:text-7xl text-obsidian" style={{ fontWeight: 600 }}>
            {t.offers.title}
          </h1>
          <p className="accent-serif text-obsidian/55 text-lg mt-4 max-w-md">
            {t.offers.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-[1500px] mx-auto px-6 lg:px-10">
        {/* Offers banner — crimson silk */}
        <div className="bg-silk text-ivory p-10 sm:p-16 mb-14 relative overflow-hidden">
          <span className="section-watermark" style={{ color: "transparent", WebkitTextStroke: "1px rgba(246,242,235,0.06)" }} aria-hidden>SALE</span>
          <div className="relative z-10 text-center">
            <p className="eyebrow text-ivory/60 mb-5">Limited Time</p>
            <h2 className="display text-4xl sm:text-6xl text-ivory" style={{ fontWeight: 600 }}>
              Up to <span className="text-sand">30% Off</span>
            </h2>
            <p className="accent-serif text-ivory/65 text-lg sm:text-xl mt-5">
              The house's finest, for a fleeting moment.
            </p>
          </div>
        </div>

        {/* Offer cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px bg-obsidian/10 border border-obsidian/10 mb-16">
          {offers.map((offer) => (
            <div key={offer.id} className="bg-ivory">
              <OfferCard offer={offer} />
            </div>
          ))}
        </div>

        {/* Info cards */}
        <div className="grid sm:grid-cols-3 border-t border-obsidian/12">
          {[
            { n: "01", titleEn: "Complimentary Delivery", descEn: "On orders above 2,000 EGP in Cairo" },
            { n: "02", titleEn: "Maison Gift Wrapping", descEn: "Every order, hand-finished and sealed" },
            { n: "03", titleEn: "Considered Returns", descEn: "7-day return policy on sealed items" },
          ].map((card) => (
            <div key={card.n} className="p-10 border-b sm:border-b-0 sm:border-r last:border-r-0 border-obsidian/12">
              <p className="display text-3xl text-crimson/30 mb-4">{card.n}</p>
              <h4 className="display text-xl text-obsidian mb-3" style={{ fontWeight: 500 }}>{card.titleEn}</h4>
              <p className="font-body text-sm text-obsidian/50 leading-relaxed">{card.descEn}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
