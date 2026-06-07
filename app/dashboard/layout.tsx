"use client";
import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import Emblem from "@/components/Emblem";

const NAV = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/dashboard/orders", label: "Orders" },
  { href: "/dashboard/catalogue", label: "Catalogue" },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    href === "/dashboard" ? pathname === href : pathname.startsWith(href);

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-ivory" dir="ltr">
      {/* Sidebar */}
      <aside className="lg:w-64 lg:min-h-screen bg-obsidian text-ivory flex lg:flex-col lg:fixed lg:inset-y-0 lg:left-0 z-40">
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
                Administration
              </span>
            </div>
          </div>

          {/* Nav */}
          <nav className="flex lg:flex-col gap-1 px-3 py-4 lg:py-8 flex-1 overflow-x-auto">
            {NAV.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`eyebrow text-[10px] px-4 py-3 whitespace-nowrap border-l-2 transition-colors ${
                    active
                      ? "border-crimson-light text-ivory bg-ivory/[0.06]"
                      : "border-transparent text-ivory/50 hover:text-ivory hover:bg-ivory/[0.03]"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Footer of sidebar */}
          <div className="hidden lg:block px-6 py-6 border-t border-ivory/10">
            <p className="eyebrow text-[8px] text-ivory/35 leading-relaxed">
              Maison de Parfum
              <br />
              Internal · Staff only
            </p>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 lg:ml-64 min-w-0">{children}</div>
    </div>
  );
}
