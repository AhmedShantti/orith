"use client";
import React, { useState } from "react";
import { useLang } from "@/context/LanguageContext";
import Emblem from "@/components/Emblem";

const WHATSAPP = "+201000000000";
const PHONE = "+20 100 000 0000";
const EMAIL = "hello@orith.com";
const INSTAGRAM = "https://instagram.com/orith";
const FACEBOOK = "https://facebook.com/orith";
const TIKTOK = "https://tiktok.com/@orith";

export default function ContactPage() {
  const { t } = useLang();
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  const socials = [
    {
      name: "Instagram",
      href: INSTAGRAM,
      color: "from-pink-500 to-purple-600",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1112.63 8 4 4 0 0116 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
    },
    {
      name: "Facebook",
      href: FACEBOOK,
      color: "from-blue-600 to-blue-700",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M18 2h-3a5 5 0 00-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 011-1h3z" />
        </svg>
      ),
    },
    {
      name: "TikTok",
      href: TIKTOK,
      color: "from-black to-gray-800",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M9 12a4 4 0 104 4V4a5 5 0 005 5" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      href: `https://wa.me/${WHATSAPP.replace("+", "")}`,
      color: "from-[#25D366] to-[#128C7E]",
      icon: (
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="page-transition pt-32 pb-28 min-h-screen bg-ivory">
      {/* Header */}
      <div className="max-w-[1500px] mx-auto px-6 lg:px-10 mb-16">
        <div className="text-center border-b border-obsidian/12 pb-12">
          <div className="flex justify-center mb-6"><Emblem size={34} className="text-crimson" /></div>
          <p className="eyebrow text-crimson mb-5">Contact</p>
          <h1 className="display text-5xl sm:text-6xl lg:text-7xl text-obsidian" style={{ fontWeight: 600 }}>
            {t.contact.title}
          </h1>
          <p className="accent-serif text-obsidian/55 text-lg mt-4">
            {t.contact.subtitle}
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-start">
          {/* Left: info */}
          <div>
            {/* Contact channels */}
            <div className="flex flex-col gap-4 mb-10">
              {[
                { label: t.contact.phone, value: PHONE, href: `tel:${PHONE}` },
                { label: t.contact.email, value: EMAIL, href: `mailto:${EMAIL}` },
                { label: t.contact.whatsapp, value: WHATSAPP, href: `https://wa.me/${WHATSAPP.replace("+", "")}` },
                { label: t.contact.address, value: t.contact.addressValue, href: "#" },
                { label: t.contact.hours, value: t.contact.hoursValue, href: "#" },
              ].map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target={item.href.startsWith("http") ? "_blank" : undefined}
                  rel="noopener noreferrer"
                  className="flex items-center gap-5 p-5 bg-[#FBF8F2] border border-obsidian/12 hover:border-crimson/40 transition-all duration-300 group"
                >
                  <div className="w-11 h-11 bg-crimson/8 flex items-center justify-center text-crimson group-hover:bg-crimson group-hover:text-ivory transition-all duration-300 flex-shrink-0">
                    <Emblem size={18} />
                  </div>
                  <div>
                    <p className="text-[10px] tracking-[0.3em] uppercase font-body text-obsidian/40 mb-0.5">
                      {item.label}
                    </p>
                    <p className="font-body text-sm text-obsidian/80">{item.value}</p>
                  </div>
                </a>
              ))}
            </div>

            {/* Social media */}
            <div>
              <h3 className="text-xs tracking-[0.3em] uppercase font-body text-obsidian/40 mb-5">
                {t.contact.followUs}
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {socials.map((s) => (
                  <a
                    key={s.name}
                    href={s.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`flex items-center gap-3 px-5 py-4 bg-gradient-to-r ${s.color} text-white hover:-translate-y-0.5 hover:shadow-lg transition-all duration-300`}
                  >
                    {s.icon}
                    <span className="text-sm font-body tracking-wider">{s.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: WhatsApp CTA + quick message */}
          <div>
            <div className="bg-silk rounded-none p-10 text-white mb-6 relative overflow-hidden">
              <span className="section-watermark" style={{ color: "transparent", WebkitTextStroke: "1px rgba(246,242,235,0.05)" }} aria-hidden>ORITH</span>
              <div className="relative z-10">
                <div className="w-16 h-16 rounded-full bg-[#25D366] flex items-center justify-center mb-6">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                  </svg>
                </div>
                <h3
                  className="font-display text-3xl font-light text-white mb-4"
                  style={{ fontFamily: "var(--font-cinzel)" }}
                >
                  Order via WhatsApp
                </h3>
                <p className="font-body text-white/50 text-sm leading-relaxed mb-8">
                  Chat with us directly for personalized perfume recommendations, custom orders, or any questions.
                </p>
                <a
                  href={`https://wa.me/${WHATSAPP.replace("+", "")}?text=${encodeURIComponent("Hello! I'm interested in your fragrances.")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-[#25D366] hover:bg-[#20bd5c] text-white px-8 py-4 eyebrow text-[10px] transition-all duration-300 hover:shadow-[0_8px_24px_rgba(37,211,102,0.3)]"
                >
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <path d="M21 11.5a8.38 8.38 0 01-.9 3.8 8.5 8.5 0 01-7.6 4.7 8.38 8.38 0 01-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 01-.9-3.8 8.5 8.5 0 014.7-7.6 8.38 8.38 0 013.8-.9h.5a8.48 8.48 0 018 8v.5z" />
                  </svg>
                  {t.contact.whatsapp}
                </a>
              </div>
            </div>

            {/* Working hours card */}
            <div className="bg-[#FBF8F2] border border-obsidian/12 p-8">
              <h4 className="display text-2xl text-obsidian mb-6" style={{ fontWeight: 500 }}>
                {t.contact.hours}
              </h4>
              {[
                { day: "Saturday – Thursday", hours: "10:00 AM – 10:00 PM" },
                { day: "Friday", hours: "Closed" },
              ].map((row) => (
                <div key={row.day} className="flex justify-between items-center py-3 border-b border-gold/10 last:border-0">
                  <span className="text-sm font-body text-obsidian/60">{row.day}</span>
                  <span className={`text-sm font-body ${row.hours === "Closed" ? "text-rose-deep" : "text-gold"}`}>
                    {row.hours}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
