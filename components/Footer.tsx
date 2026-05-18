"use client";
import React from "react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";

const WHATSAPP = "+201000000000";
const PHONE = "+20 100 000 0000";
const EMAIL = "hello@orith.com";
const INSTAGRAM = "https://instagram.com/orith";
const FACEBOOK = "https://facebook.com/orith";
const TIKTOK = "https://tiktok.com/@orith";

export default function Footer() {
  const { t } = useLang();

  return (
    <footer className="bg-obsidian text-white/70 relative overflow-hidden">
      {/* Decorative */}
      <div className="absolute top-0 right-0 w-64 h-64 rounded-full bg-gold/5 blur-3xl pointer-events-none" />

      {/* Top section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
        {/* Brand */}
        <div className="lg:col-span-1">
          <span
            className="font-display text-3xl font-light tracking-[0.25em] text-white block mb-2"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            ORITH
          </span>
          <span className="text-[10px] tracking-[0.4em] uppercase text-gold/80 font-body">
            Luxury Perfumery
          </span>
          <p className="text-xs font-body leading-relaxed text-white/40 mt-4 max-w-xs">
            {t.footer.tagline}. Handcrafted fragrances for the discerning soul.
          </p>

          {/* Social icons */}
          <div className="flex gap-3 mt-6">
            {[
              {
                href: INSTAGRAM,
                label: "Instagram",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                    <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
                  </svg>
                ),
              },
              {
                href: FACEBOOK,
                label: "Facebook",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
                  </svg>
                ),
              },
              {
                href: TIKTOK,
                label: "TikTok",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M9 12a4 4 0 104 4V4a5 5 0 005 5" />
                  </svg>
                ),
              },
              {
                href: `https://wa.me/${WHATSAPP.replace("+", "")}`,
                label: "WhatsApp",
                icon: (
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                  </svg>
                ),
              },
            ].map((s) => (
              <a
                key={s.label}
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={s.label}
                className="w-9 h-9 rounded-full border border-white/10 flex items-center justify-center text-white/50 hover:border-gold hover:text-gold transition-all duration-300"
              >
                {s.icon}
              </a>
            ))}
          </div>
        </div>

        {/* Quick Links */}
        <div>
          <h4 className="text-white text-xs tracking-[0.3em] uppercase font-body mb-6">
            {t.footer.quickLinks}
          </h4>
          <ul className="flex flex-col gap-3">
            {[
              { href: "/", label: t.nav.home },
              { href: "/products", label: t.nav.products },
              { href: "/offers", label: t.nav.offers },
              { href: "/cart", label: t.nav.cart },
              { href: "/contact", label: t.nav.contact },
            ].map((l) => (
              <li key={l.href}>
                <Link
                  href={l.href}
                  className="text-sm font-body text-white/40 hover:text-gold transition-colors duration-300"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white text-xs tracking-[0.3em] uppercase font-body mb-6">
            {t.contact.title}
          </h4>
          <ul className="flex flex-col gap-4">
            <li className="flex items-center gap-3">
              <span className="text-gold">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81a19.79 19.79 0 01-3.07-8.63 2 2 0 012-2.18h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 6.91a16 16 0 006.93 6.93l1.28-1.28a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7a2 2 0 011.72 2.02z" />
                </svg>
              </span>
              <span className="text-sm font-body text-white/40">{PHONE}</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-gold">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <a
                href={`mailto:${EMAIL}`}
                className="text-sm font-body text-white/40 hover:text-gold transition-colors"
              >
                {EMAIL}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-gold">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
              </span>
              <span className="text-sm font-body text-white/40">
                {t.contact.addressValue}
              </span>
            </li>
          </ul>
        </div>

        {/* Newsletter */}
        <div>
          <h4 className="text-white text-xs tracking-[0.3em] uppercase font-body mb-6">
            {t.footer.newsletter}
          </h4>
          <p className="text-xs font-body text-white/30 mb-5 leading-relaxed">
            Subscribe for exclusive offers and new arrivals.
          </p>
          <div className="flex rounded-full overflow-hidden border border-white/10">
            <input
              type="email"
              placeholder={t.footer.newsletterPlaceholder}
              className="flex-1 bg-transparent text-xs font-body text-white/60 px-4 py-3 placeholder-white/20 focus:outline-none"
            />
            <button className="btn-gold px-5 text-xs font-body tracking-wider">
              →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-white/8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[11px] font-body text-white/25 tracking-wider">
            © {new Date().getFullYear()} Orith. {t.footer.rights}
          </p>
          <p className="text-[11px] font-body text-white/20 tracking-widest uppercase">
            Made with ♥ in Egypt
          </p>
        </div>
      </div>
    </footer>
  );
}
