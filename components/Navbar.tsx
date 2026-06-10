"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLang } from "@/context/LanguageContext";
import { useCart } from "@/context/CartContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import Emblem from "./Emblem";

interface NavLinkSetting {
  labelEn: string;
  labelAr: string;
  url: string;
  visible?: boolean;
}

export default function Navbar() {
  const { t, lang, setLang, dir } = useLang();
  const { totalItems } = useCart();
  const s = useSiteSettings();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  // Nav links come from site settings (bilingual + visibility), falling back to
  // the built-in links if the setting is missing.
  const fallbackLinks = [
    { href: "/", label: t.nav.home },
    { href: "/products", label: t.nav.products },
    { href: "/offers", label: t.nav.offers },
    { href: "/contact", label: t.nav.contact },
  ];
  const linkSettings = s.json<NavLinkSetting[]>("navbar_links", []);
  const links =
    linkSettings.length > 0
      ? linkSettings
          .filter((l) => l.visible !== false)
          .map((l) => ({
            href: l.url,
            label: lang === "ar" ? l.labelAr : l.labelEn,
          }))
      : fallbackLinks;

  const showLinks = s.bool("navbar_show_links", true);
  const navbarLogo = s.image("navbar_logo");
  const siteName = s.text("site_name", "ORITH");

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  // Over the dark hero (home, not scrolled) → light chrome. Otherwise dark.
  const onHero = pathname === "/" && !scrolled;
  const fg = onHero ? "text-ivory" : "text-obsidian";
  const fgDim = onHero ? "text-ivory/65" : "text-obsidian/60";

  return (
    <>
      <header
        style={{ top: "var(--announce-h, 0px)" }}
        className={`fixed left-0 right-0 z-50 transition-all duration-500 ${
          scrolled
            ? "bg-ivory/92 navbar-blur border-b border-obsidian/10"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-[1500px] mx-auto px-6 lg:px-10">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              {navbarLogo ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={navbarLogo}
                  alt={siteName}
                  className="h-9 w-auto object-contain"
                />
              ) : (
                <>
                  <Emblem size={26} className={`${onHero ? "text-ivory" : "text-crimson"} transition-colors duration-500 flex-shrink-0`} />
                  <span className="flex flex-col items-start leading-none">
                    <span
                      className={`display text-xl sm:text-2xl tracking-[0.28em] ${fg} transition-colors duration-500`}
                      style={{ fontWeight: 600 }}
                    >
                      {siteName}
                    </span>
                    <span className={`eyebrow text-[7px] mt-1 ${fgDim} transition-colors duration-500`}>
                      Maison de Parfum
                    </span>
                  </span>
                </>
              )}
            </Link>

            {/* Desktop Nav */}
            {showLinks && (
            <nav className="hidden md:flex items-center gap-10">
              {links.map((link) => {
                const active = isActive(link.href);
                const linkColor = active
                  ? onHero ? "text-ivory" : "text-crimson"
                  : onHero ? "text-ivory/65 hover:text-ivory" : "text-obsidian/60 hover:text-crimson";
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`eyebrow text-[10px] relative group transition-colors duration-300 ${linkColor}`}
                  >
                    {link.label}
                    <span
                      className={`absolute -bottom-2 left-0 h-px ${onHero ? "bg-ivory" : "bg-crimson"} transition-all duration-300 ${
                        active ? "w-full" : "w-0 group-hover:w-full"
                      }`}
                    />
                  </Link>
                );
              })}
            </nav>
            )}

            {/* Right side */}
            <div className="flex items-center gap-5">
              <button
                onClick={() => setLang(lang === "en" ? "ar" : "en")}
                className={`hidden md:inline-flex eyebrow text-[10px] px-3 py-2 border transition-all duration-300 ${
                  onHero
                    ? "border-ivory/30 text-ivory hover:bg-ivory hover:text-obsidian"
                    : "border-obsidian/25 text-obsidian hover:bg-crimson hover:border-crimson hover:text-ivory"
                }`}
              >
                {lang === "en" ? "عربي" : "EN"}
              </button>

              <Link href="/cart" className={`relative flex items-center justify-center w-9 h-9 ${fg} transition-colors duration-500 hover:text-crimson`}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.3">
                  <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <path d="M16 10a4 4 0 01-8 0" />
                </svg>
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-crimson text-ivory text-[10px] font-body flex items-center justify-center">
                    {totalItems > 9 ? "9+" : totalItems}
                  </span>
                )}
              </Link>

              <button
                className="md:hidden flex flex-col gap-1.5 p-1"
                onClick={() => setMenuOpen(true)}
                aria-label="Open menu"
              >
                <span className={`w-6 h-px ${onHero ? "bg-ivory" : "bg-obsidian"} transition-colors`} />
                <span className={`w-6 h-px ${onHero ? "bg-ivory" : "bg-obsidian"} transition-colors`} />
                <span className={`w-4 h-px ${onHero ? "bg-ivory" : "bg-obsidian"} transition-colors`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 mobile-overlay md:hidden">
          <div className="absolute inset-0 bg-obsidian/50" onClick={() => setMenuOpen(false)} />
          <div
            className={`absolute top-0 bottom-0 w-[84vw] max-w-sm bg-ivory flex flex-col ${dir === "rtl" ? "right-0" : "left-0"}`}
            style={{ animation: "slideDown 0.4s ease" }}
          >
            <div className="flex items-center justify-between px-6 py-6 border-b border-obsidian/10">
              <span className="flex items-center gap-3">
                <Emblem size={22} className="text-crimson" />
                <span className="display text-2xl tracking-[0.22em] text-obsidian" style={{ fontWeight: 600 }}>ORITH</span>
              </span>
              <button onClick={() => setMenuOpen(false)} className="text-obsidian/60 hover:text-crimson">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            <nav className="flex flex-col px-6 py-8 flex-1">
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMenuOpen(false)}
                  className={`display text-2xl py-4 border-b border-obsidian/8 transition-colors ${
                    isActive(link.href) ? "text-crimson" : "text-obsidian hover:text-crimson"
                  }`}
                  style={{ fontWeight: 500 }}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                href="/cart"
                onClick={() => setMenuOpen(false)}
                className="display text-2xl py-4 border-b border-obsidian/8 text-obsidian hover:text-crimson flex items-center gap-3"
                style={{ fontWeight: 500 }}
              >
                {t.nav.cart}
                {totalItems > 0 && (
                  <span className="min-w-[20px] h-5 px-1 bg-crimson text-ivory text-[10px] font-body flex items-center justify-center">{totalItems}</span>
                )}
              </Link>
            </nav>

            <div className="px-6 py-6 border-t border-obsidian/10">
              <button
                onClick={() => { setLang(lang === "en" ? "ar" : "en"); setMenuOpen(false); }}
                className="btn-ghost text-obsidian w-full"
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
