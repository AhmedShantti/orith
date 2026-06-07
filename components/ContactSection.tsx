"use client";
import React from "react";
import { useLang } from "@/context/LanguageContext";
import Emblem from "./Emblem";
import Reveal from "./Reveal";

const WHATSAPP = "+201000000000";
const PHONE = "+20 100 000 0000";
const EMAIL = "hello@orith.com";

export default function ContactSection() {
  const { t } = useLang();

  const rows = [
    { label: t.contact.phone, value: PHONE, href: `tel:${PHONE}` },
    { label: t.contact.whatsapp, value: WHATSAPP, href: `https://wa.me/${WHATSAPP.replace("+", "")}` },
    { label: t.contact.email, value: EMAIL, href: `mailto:${EMAIL}` },
    { label: t.contact.address, value: t.contact.addressValue, href: "#" },
    { label: t.contact.hours, value: t.contact.hoursValue, href: "#" },
  ];

  return (
    <section className="py-28 sm:py-36 bg-ivory">
      <div className="max-w-5xl mx-auto px-6 lg:px-10">
        <div className="text-center mb-16">
          <Reveal className="flex justify-center mb-7"><Emblem size={32} className="text-crimson" /></Reveal>
          <Reveal><p className="eyebrow text-crimson mb-5">{t.contact.title}</p></Reveal>
          <Reveal delay={1}>
            <h2 className="display text-4xl sm:text-5xl lg:text-6xl text-obsidian" style={{ fontWeight: 500 }}>
              {t.contact.subtitle}
            </h2>
          </Reveal>
        </div>

        <Reveal delay={1} className="border-t border-obsidian/12">
          {rows.map((r) => (
            <a
              key={r.label}
              href={r.href}
              target={r.href.startsWith("http") ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="group flex items-center justify-between gap-6 py-6 border-b border-obsidian/12 hover:px-4 transition-all duration-300"
            >
              <span className="eyebrow text-obsidian/40 group-hover:text-crimson transition-colors">{r.label}</span>
              <span className="font-body text-sm sm:text-base text-obsidian/80 tracking-wide text-right">{r.value}</span>
            </a>
          ))}
        </Reveal>

        <Reveal className="text-center mt-14">
          <a
            href={`https://wa.me/${WHATSAPP.replace("+", "")}?text=${encodeURIComponent("Hello! I'm interested in your fragrances.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-crimson"
          >
            {t.cart.orderWhatsApp}
          </a>
        </Reveal>
      </div>
    </section>
  );
}
