"use client";

// Holds the site-settings map (fetched server-side in the root layout and
// passed in as `initial`) and exposes typed, language-aware getters to the
// client components that render the storefront chrome.

import React, { createContext, useContext, ReactNode } from "react";
import type { SiteSettingsMap } from "@/lib/siteSettings";
import { useLang } from "./LanguageContext";

interface SiteSettingsContextValue {
  /** Raw value for a key, or the fallback if missing/empty. */
  get: (key: string, fallback?: string) => string;
  /** Bilingual text: reads `${base}_${lang}` with a fallback. */
  text: (base: string, fallback?: string) => string;
  /** Boolean setting ("true"/"false"). */
  bool: (key: string, fallback?: boolean) => boolean;
  /** JSON setting, parsed; returns fallback on missing/parse error. */
  json: <T>(key: string, fallback: T) => T;
  /** Image/URL value, or fallback if empty. */
  image: (key: string, fallback?: string) => string;
}

const SiteSettingsContext = createContext<SiteSettingsContextValue | null>(null);

export function SiteSettingsProvider({
  initial,
  children,
}: {
  initial: SiteSettingsMap;
  children: ReactNode;
}) {
  const { lang } = useLang();
  const map = initial ?? {};

  const nonEmpty = (v: string | null | undefined): v is string =>
    typeof v === "string" && v.trim().length > 0;

  const value: SiteSettingsContextValue = {
    get: (key, fallback = "") => {
      const v = map[key];
      return nonEmpty(v) ? v : fallback;
    },
    text: (base, fallback = "") => {
      const v = map[`${base}_${lang}`];
      if (nonEmpty(v)) return v;
      const en = map[`${base}_en`];
      return nonEmpty(en) ? en : fallback;
    },
    bool: (key, fallback = false) => {
      const v = map[key];
      if (v === "true") return true;
      if (v === "false") return false;
      return fallback;
    },
    json: <T,>(key: string, fallback: T): T => {
      const v = map[key];
      if (!nonEmpty(v)) return fallback;
      try {
        return JSON.parse(v) as T;
      } catch {
        return fallback;
      }
    },
    image: (key, fallback = "") => {
      const v = map[key];
      return nonEmpty(v) ? v : fallback;
    },
  };

  return (
    <SiteSettingsContext.Provider value={value}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings(): SiteSettingsContextValue {
  const ctx = useContext(SiteSettingsContext);
  if (!ctx) {
    throw new Error(
      "useSiteSettings must be used within a SiteSettingsProvider"
    );
  }
  return ctx;
}
