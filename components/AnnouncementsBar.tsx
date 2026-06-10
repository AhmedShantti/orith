"use client";

import React, { useEffect } from "react";
import { useLang } from "@/context/LanguageContext";
import { useSiteSettings } from "@/context/SiteSettingsContext";

const BAR_HEIGHT = "2.25rem"; // h-9

export default function AnnouncementsBar() {
  const { lang } = useLang();
  const s = useSiteSettings();

  const enabled = s.bool("announcement_enabled", false);
  const text = s.text("announcement_text", "");
  const show = enabled && text.length > 0;

  // Offset the fixed navbar by the bar's height (via a CSS variable the Navbar
  // reads), so the two never overlap.
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--announce-h", show ? BAR_HEIGHT : "0px");
    return () => root.style.setProperty("--announce-h", "0px");
  }, [show]);

  if (!show) return null;

  const bg = s.get("announcement_bg_color", "#8E1B26");
  const color = s.get("announcement_text_color", "#F6F2EB");

  return (
    <div
      className="w-full h-9 flex items-center justify-center px-4 relative z-[60]"
      style={{ backgroundColor: bg, color }}
      dir={lang === "ar" ? "rtl" : "ltr"}
    >
      <p className="eyebrow text-[10px] truncate">{text}</p>
    </div>
  );
}
