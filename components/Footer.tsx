"use client";
import React from "react";
import Link from "next/link";
import { useLang } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";
import Emblem from "./Emblem";

const PHONE = "+20 100 000 0000";
const EMAIL = "hello@orith.com";

interface FooterColumn {
  titleEn: string;
  titleAr: string;
  links: { labelEn: string; labelAr: string; url: string }[];
}

export default function Footer() {
  const { t, lang } = useLang();
  const s = useSiteSettings();

  const siteName = s.text("site_name", "ORITH");
  const footerLogo = s.image("footer_logo");

  // Social links — only render the ones that are configured.
  const socials = [
    { key: "footer_social_instagram", label: "IG" },
    { key: "footer_social_facebook", label: "FB" },
    { key: "footer_social_tiktok", label: "TT" },
    { key: "footer_social_whatsapp", label: "WA" },
  ]
    .map((x) => ({ label: x.label, href: s.get(x.key) }))
    .filter((x) => x.href);

  // Footer columns — dynamic, bilingual; fall back to the built-in quick links.
  const columns = s.json<FooterColumn[]>("footer_columns", []);
  const fallbackColumn: FooterColumn = {
    titleEn: "Quick Links",
    titleAr: "روابط سريعة",
    links: [
      { labelEn: "Home", labelAr: "الرئيسية", url: "/" },
      { labelEn: "Products", labelAr: "المنتجات", url: "/products" },
      { labelEn: "Offers", labelAr: "العروض", url: "/offers" },
      { labelEn: "Contact", labelAr: "اتصل بنا", url: "/contact" },
    ],
  };
  const footerColumns = columns.length > 0 ? columns : [fallbackColumn];

  const copyright = s.text(
    "footer_copyright",
    `© ${new Date().getFullYear()} ${siteName}. ${t.footer.rights}`
  );

  return (
    <footer className="bg-obsidian text-ivory relative overflow-hidden">
      {/* Giant wordmark band */}
      <div className="relative border-b border-ivory/10 overflow-hidden">
        <div className="max-w-[1500px] mx-auto px-6 lg:px-10 py-16 flex flex-col items-center text-center">
          {footerLogo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={footerLogo}
              alt={siteName}
              className="h-16 w-auto object-contain mb-2"
            />
          ) : (
            <>
              <Emblem size={40} className="text-crimson-light mb-7" />
              <h2 className="display text-[15vw] sm:text-[12vw] lg:text-[10rem] leading-none text-ivory" style={{ fontWeight: 700, letterSpacing: "0.05em" }}>
                {siteName}
              </h2>
            </>
          )}
          <p className="eyebrow text-ivory/50 mt-5">Maison de Parfum · Est. 1995</p>
        </div>
      </div>

      {/* Columns */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-10 py-20 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="lg:col-span-1">
          <p className="accent-serif text-ivory/55 text-lg leading-relaxed max-w-xs">
            {t.footer.tagline}.
          </p>
          {socials.length > 0 && (
            <div className="flex gap-4 mt-8">
              {socials.map((soc) => (
                <a
                  key={soc.label}
                  href={soc.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 border border-ivory/15 flex items-center justify-center eyebrow text-[9px] text-ivory/60 hover:bg-crimson hover:border-crimson hover:text-ivory transition-all duration-300"
                >
                  {soc.label}
                </a>
              ))}
            </div>
          )}
        </div>

        {/* Dynamic footer columns */}
        {footerColumns.map((col, i) => (
          <div key={i}>
            <h4 className="eyebrow text-ivory/40 mb-7">
              {lang === "ar" ? col.titleAr : col.titleEn}
            </h4>
            <ul className="flex flex-col gap-4">
              {col.links.map((l) => (
                <li key={l.url + l.labelEn}>
                  <Link
                    href={l.url}
                    className="font-body text-sm text-ivory/55 hover:text-crimson-light tracking-wide transition-colors"
                  >
                    {lang === "ar" ? l.labelAr : l.labelEn}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

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
            {copyright}
          </p>
          <p className="eyebrow text-[9px] text-ivory/30">Timeless by Design, Defined by Essence</p>
        </div>
      </div>
    </footer>
  );
}
