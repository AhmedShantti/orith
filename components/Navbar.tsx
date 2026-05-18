"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";

export default function Navbar() {
  const { t, lang, setLang, dir } = useLang();
  const { totalItems } = useCart();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (menuOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  const links = [
    { href: "/", label: t.nav.home },
    { href: "/products", label: t.nav.products },
    { href: "/offers", label: t.nav.offers },
    { href: "/contact", label: t.nav.contact },
  ];

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-ivory/95 navbar-blur shadow-[0_2px_20px_rgba(0,0,0,0.06)]"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-18 py-4">
            {/* Logo */}
            <Link href="/" className="flex flex-col items-start group">
              <span
                className="font-display text-2xl sm:text-3xl font-light tracking-[0.2em] text-obsidian group-hover:text-gold transition-colors duration-300"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                ORITH
              </span>
              <span className="text-[9px] tracking-[0.35em] text-gold/80 uppercase font-body font-light -mt-1">
                Luxury Perfumery
              </span>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-8">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`text-sm tracking-widest uppercase font-body font-light transition-all duration-300 relative group ${
                    isActive(link.href)
                      ? "text-gold"
                      : "text-obsidian/70 hover:text-gold"
                  }`}
                >
                  {link.label}
                  <span
                    className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${
                      isActive(link.href) ? "w-full" : "w-0 group-hover:w-full"
                    }`}
                  />
                </Link>
              ))}
            </nav>

            {/* Right side */}
            <div className="flex items-center gap-4">
              {/* Language Switcher */}
              <button
                onClick={() => setLang(lang === "en" ? "ar" : "en")}
                className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-gold/30 text-xs tracking-widest uppercase font-body text-gold hover:bg-gold hover:text-white transition-all duration-300"
              >
                {lang === "en" ? "عربي" : "EN"}
              </button>

              {/* Cart */}
              <Link
                href="/cart"
                className="relative flex items-center justify-center w-10 h-10 rounded-full hover:bg-gold/10 transition-colors duration-300 group"
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  className="text-obsidian/70 group-hover:text-gold transition-colors"
                >
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-gold text-white text-[10px] font-body font-medium flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>

              {/* Burger */}
              <button
                className="md:hidden flex flex-col gap-1.5 p-2 group"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
              >
                <span className="w-5 h-px bg-obsidian/70 group-hover:bg-gold transition-colors" />
                <span className="w-4 h-px bg-obsidian/70 group-hover:bg-gold transition-colors" />
                <span className="w-5 h-px bg-obsidian/70 group-hover:bg-gold transition-colors" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 mobile-overlay">
          <div
            className="absolute inset-0 bg-obsidian/40"
            onClick={() => setMenuOpen(false)}
          />
          <div
            className={`absolute top-0 bottom-0 w-[80vw] max-w-sm bg-ivory flex flex-col shadow-2xl transition-transform duration-400 ${
              dir === "rtl" ? "right-0" : "left-0"
            }`}
            style={{ animation: "slideDown 0.4s ease" }}
          >
            {/* Mobile header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-gold/20">
              <span
                className="font-display text-2xl font-light tracking-[0.2em] text-obsidian"
                style={{ fontFamily: "var(--font-cormorant)" }}
              >
                ORITH
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gold/10 transition-colors"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Links */}
            <nav className="flex flex-col px-6 py-8 gap-2 flex-1">
              {links.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`text-lg font-body font-light tracking-wider uppercase py-3 border-b border-gold/10 transition-colors duration-300 ${
                    isActive(link.href)
                      ? "text-gold"
                      : "text-obsidian/70 hover:text-gold"
                  }`}
                  style={{ animationDelay: `${i * 0.05}s` }}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/cart"
                onClick={() => setMenuOpen(false)}
                className="text-lg font-body font-light tracking-wider uppercase py-3 border-b border-gold/10 text-obsidian/70 hover:text-gold transition-colors flex items-center gap-2"
              >
                {t.nav.cart}
                {totalItems > 0 && (
                  <span className="w-5 h-5 rounded-full bg-gold text-white text-[10px] flex items-center justify-center">
                    {totalItems}
                  </span>
                )}
              </Link>
            </nav>

            {/* Language + social */}
            <div className="px-6 py-6 border-t border-gold/20">
              <button
                onClick={() => { setLang(lang === "en" ? "ar" : "en"); setMenuOpen(false); }}
                className="w-full py-3 rounded-full border border-gold text-gold text-sm tracking-widest uppercase font-body hover:bg-gold hover:text-white transition-all duration-300"
              >
                {lang === "en" ? "العربية" : "English"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
