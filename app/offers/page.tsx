"use client";
import React from "react";
import { useLang } from "@/context/LanguageContext";
import { offers } from "@/data/products";
import OfferCard from "@/components/OfferCard";

export default function OffersPage() {
  const { t } = useLang();

  return (
    <div className="page-transition pt-24 pb-24 min-h-screen bg-gradient-to-b from-champagne/30 to-ivory">
      {/* Header */}
      <div className="bg-gradient-to-b from-beige/80 to-transparent py-16 mb-12 relative overflow-hidden">
        {/* Decorative */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gold/10 blur-3xl pointer-events-none" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="gold-line" />
            <span className="text-xs tracking-[0.4em] uppercase text-gold font-body font-light">
              Deals
            </span>
            <div className="gold-line" />
          </div>
          <h1
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-light text-obsidian"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {t.offers.title}
          </h1>
          <p className="font-body text-obsidian/50 mt-3 text-sm sm:text-base max-w-md mx-auto">
            {t.offers.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Offers banner */}
        <div className="bg-gradient-to-r from-obsidian via-[#1a1610] to-obsidian rounded-3xl p-8 sm:p-12 mb-12 relative overflow-hidden">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-64 h-64 rounded-full bg-gold/10 blur-3xl" />
            <div className="absolute top-1/2 right-1/4 -translate-y-1/2 w-48 h-48 rounded-full bg-gold/5 blur-2xl" />
          </div>
          <div className="relative z-10 text-center">
            <span className="inline-block bg-gold/20 text-gold text-xs tracking-[0.4em] uppercase font-body px-4 py-2 rounded-full mb-4">
              Limited Time
            </span>
            <h2
              className="font-display text-4xl sm:text-5xl font-light text-white mb-4"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              Up to <span className="text-gold">30% Off</span>
            </h2>
            <p className="font-body text-white/40 text-sm sm:text-base">
              Don't miss these exclusive deals on our finest fragrances
            </p>
          </div>
        </div>

        {/* Offer cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {offers.map((offer, i) => (
            <OfferCard key={offer.id} offer={offer} delay={i * 100} />
          ))}
        </div>

        {/* Info cards */}
        <div className="grid sm:grid-cols-3 gap-6">
          {[
            {
              icon: "🚚",
              titleEn: "Free Delivery",
              titleAr: "توصيل مجاني",
              descEn: "On orders above 2,000 EGP in Cairo",
              descAr: "على الطلبات فوق ٢٠٠٠ جنيه في القاهرة",
            },
            {
              icon: "🎁",
              titleEn: "Gift Wrapping",
              titleAr: "تغليف هدية",
              descEn: "Complimentary luxury gift wrapping",
              descAr: "تغليف هدية فاخر مجاناً",
            },
            {
              icon: "↩️",
              titleEn: "Easy Returns",
              titleAr: "إرجاع سهل",
              descEn: "7-day return policy on sealed items",
              descAr: "سياسة إرجاع ٧ أيام للمنتجات المغلقة",
            },
          ].map((card, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl p-8 shadow-card text-center hover:shadow-card-hover transition-shadow duration-300"
            >
              <div className="text-4xl mb-4">{card.icon}</div>
              <h4
                className="font-display text-xl font-light text-obsidian mb-2"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                {card.titleEn}
              </h4>
              <p className="font-body text-xs text-obsidian/50 leading-relaxed">
                {card.descEn}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
