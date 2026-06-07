"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Emblem from "@/components/Emblem";
import { useLang } from "@/context/LanguageContext";
import { dict } from "./dict";
import { GridIcon, OrdersIcon, BottleIcon, GlobeIcon } from "./icons";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const { lang, setLang, dir } = useLang();
  const d = dict[lang];

  const NAV = [
    { href: "/dashboard", label: d.nav.dashboard, Icon: GridIcon },
    { href: "/dashboard/orders", label: d.nav.orders, Icon: OrdersIcon },
    { href: "/dashboard/catalogue", label: d.nav.catalogue, Icon: BottleIcon },
  ];

  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-ivory" dir={dir}>
      {/* Sidebar */}
      <aside className="lg:w-64 lg:min-h-screen bg-obsidian text-ivory flex lg:flex-col lg:fixed lg:inset-y-0 lg:start-0 z-40">
        <div className="flex lg:flex-col w-full">
          {/* Brand */}
          <div className="flex items-center gap-3 px-6 py-7 border-b border-ivory/10 shrink-0">
            <Emblem size={24} className="text-crimson-light" />
            <div className="hidden sm:flex flex-col leading-none">
              <span
                className="display text-lg tracking-[0.28em] text-ivory"
                style={{ fontWeight: 600 }}
              >
                ORITH
              </span>
              <span className="eyebrow text-[7px] mt-1 text-ivory/45">
                {d.administration}
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex lg:flex-col gap-1 px-3 py-4 lg:py-8 flex-1 overflow-x-auto">
            {NAV.map(({ href, label, Icon }) => {
              const active = isActive(href);
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 eyebrow text-[10px] px-4 py-3 whitespace-nowrap border-s-2 transition-colors ${
                    active
                      ? "border-crimson-light text-ivory bg-ivory/[0.06]"
                      : "border-transparent text-ivory/50 hover:text-ivory hover:bg-ivory/[0.03]"
                  }`}
                >
                  <Icon size={16} className="shrink-0" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </nav>

          {/* Footer: language toggle + note */}
          <div className="px-3 lg:px-6 py-4 lg:py-6 lg:border-t border-ivory/10 flex items-center lg:block">
            <button
              onClick={() => setLang(lang === "en" ? "ar" : "en")}
              className="flex items-center gap-2 eyebrow text-[10px] text-ivory/60 hover:text-ivory border border-ivory/20 hover:border-ivory/40 px-3 py-2 transition-colors w-full justify-center lg:mb-5"
            >
              <GlobeIcon size={14} className="shrink-0" />
              <span>{lang === "en" ? "العربية" : "English"}</span>
            </button>
            <p className="hidden lg:block eyebrow text-[8px] text-ivory/35 leading-relaxed">
              ORITH
              <br />
              {d.staffOnly}
            </p>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 lg:ms-64 min-w-0">{children}</div>
    </div>
  );
}
