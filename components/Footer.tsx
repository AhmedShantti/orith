"use client";
import React from "react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import Emblem from "./Emblem";

const WHATSAPP = "+201000000000";
const PHONE = "+20 100 000 0000";
const EMAIL = "hello@orith.com";
const INSTAGRAM = "https://instagram.com/orith";
const FACEBOOK = "https://facebook.com/orith";
const TIKTOK = "https://tiktok.com/@orith";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="bg-obsidian text-ivory relative overflow-hidden">
      {/* Giant wordmark band */}
      <div className="relative border-b border-ivory/10 overflow-hidden">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-10 py-16 flex flex-col items-center text-center">
          <Emblem size={40} className="text-crimson-light mb-7" />
          <h2 className="display text-[15vw] sm:text-[12vw] lg:text-[10rem] leading-none text-ivory" style={{ fontWeight: 700, letterSpacing: "0.05em" }}>
            ORITH
          </h2>
          <p className="eyebrow text-ivory/50 mt-5">Maison de Parfum · Est. 1995</p>
        </div>
      </div>

      {/* Columns */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-10 py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1">
          <p className="accent-serif text-ivory/55 text-lg leading-relaxed max-w-xs">
            {t.footer.tagline}.
          </p>
          <div className="flex gap-4 mt-8">
            {[
              { href: INSTAGRAM, label: "IG" },
              { href: FACEBOOK, label: "FB" },
              { href: TIKTOK, label: "TT" },
              { href: `https://wa.me/${WHATSAPP.replace("+", "")}`, label: "WA" },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                className="w-10 h-10 border border-ivory/15 flex items-center justify-center eyebrow text-[9px] text-ivory/60 hover:bg-crimson hover:border-crimson hover:text-ivory transition-all duration-300"
              >
                {s.label}
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="eyebrow text-ivory/40 mb-7">{t.footer.quickLinks}</h4>
          <ul className="flex flex-col gap-4">
            {[
              { href: "/", label: t.nav.home },
              { href: "/products", label: t.nav.products },
              { href: "/offers", label: t.nav.offers },
              { href: "/cart", label: t.nav.cart },
              { href: "/contact", label: t.nav.contact },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="font-body text-sm text-ivory/55 hover:text-crimson-light tracking-wide transition-colors">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-ivory/40 mb-7">{t.contact.title}</h4>
          <ul className="flex flex-col gap-4 font-body text-sm text-ivory/55">
            <li>{PHONE}</li>
            <li><a href={`mailto:${EMAIL}`} className="hover:text-crimson-light transition-colors">{EMAIL}</a></li>
            <li>{t.contact.addressValue}</li>
          </ul>
        </div>

        <div>
          <h4 className="eyebrow text-ivory/40 mb-7">{t.footer.newsletter}</h4>
          <p className="font-body text-sm text-ivory/40 mb-5 leading-relaxed">
            Subscribe for private launches and the house journal.
          </p>
          <div className="flex border-b border-ivory/25 focus-within:border-crimson-light transition-colors">
            <input
              type="email"
              placeholder={t.footer.newsletterPlaceholder}
              className="flex-1 bg-transparent text-sm font-body text-ivory/80 py-3 placeholder-ivory/25 focus:outline-none"
            />
            <button className="eyebrow text-[10px] text-crimson-light hover:text-ivory transition-colors px-2" aria-label={t.footer.subscribe}>
              →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-ivory/10">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-10 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="font-body text-[11px] text-ivory/35 tracking-wider">
            © {new Date().getFullYear()} ORITH. {t.footer.rights}
          </p>
          <p className="eyebrow text-[9px] text-ivory/30">Timeless by Design, Defined by Essence</p>
        </div>
      </div>
    </footer>
  );
}
