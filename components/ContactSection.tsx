"use client";
import React from "react";
import { useLang } from "@/context/LanguageContext";

const WHATSAPP = "+201000000000";
const PHONE = "+20 100 000 0000";
const EMAIL = "hello@orith.com";

export default function ContactSection() {
  const { t } = useLang();

  const channels = [
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63 2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 6.91a16 16 0 006.93 6.93l1.28-1.28a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7a2 2 0 011.72 2.02z" />
        </svg>
      ),
      label: t.contact.phone,
      value: PHONE,
      href: `tel:${PHONE}`,
      color: "from-gold/20 to-champagne/50",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      ),
      label: t.contact.whatsapp,
      value: WHATSAPP,
      href: `https://wa.me/${WHATSAPP.replace("+", "")}`,
      color: "from-green-100 to-green-50",
    },
    {
      icon: (
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
          <polyline points="22,6 12,13 2,6" />
        </svg>
      ),
      label: t.contact.email,
      value: EMAIL,
      href: `mailto:${EMAIL}`,
      color: "from-blue-50 to-indigo-50",
    },
  ];

  return (
    <section className="py-24 bg-ivory">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="gold-line" />
            <span className="text-xs tracking-[0.4em] uppercase text-gold font-body font-light">
              Contact
            </span>
            <div className="gold-line" />
          </div>
          <h2
            className="font-display text-4xl sm:text-5xl font-light text-obsidian mb-4"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            {t.contact.title}
          </h2>
          <p className="font-body text-obsidian/50 text-sm sm:text-base">
            {t.contact.subtitle}
          </p>
        </div>

        {/* Channel cards */}
        <div className="grid sm:grid-cols-3 gap-6 mb-12">
          {channels.map((ch) => (
            <a
              key={ch.label}
              href={ch.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`group bg-gradient-to-br ${ch.color} rounded-3xl p-8 flex flex-col items-center gap-4 transition-all duration-300 hover:-translate-y-1 hover:shadow-luxury`}
            >
              <div className="w-14 h-14 rounded-full bg-white/70 flex items-center justify-center text-gold group-hover:scale-110 transition-transform duration-300">
                {ch.icon}
              </div>
              <div className="text-center">
                <p className="text-xs tracking-[0.3em] uppercase font-body text-obsidian/40 mb-1">
                  {ch.label}
                </p>
                <p className="font-body text-sm text-obsidian/80">{ch.value}</p>
              </div>
            </a>
          ))}
        </div>

        {/* Hours + Address */}
        <div className="grid sm:grid-cols-2 gap-6">
          <div className="glass-card rounded-3xl p-8">
            <h4
              className="font-display text-2xl font-light text-obsidian mb-3"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {t.contact.hours}
            </h4>
            <p className="font-body text-sm text-obsidian/60">
              {t.contact.hoursValue}
            </p>
            <p className="font-body text-xs text-obsidian/40 mt-1">
              Friday: Closed
            </p>
          </div>
          <div className="glass-card rounded-3xl p-8">
            <h4
              className="font-display text-2xl font-light text-obsidian mb-3"
              style={{ fontFamily: "var(--font-cormorant)" }}
            >
              {t.contact.address}
            </h4>
            <p className="font-body text-sm text-obsidian/60">
              {t.contact.addressValue}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
