// Server-side fetch for frontend site settings. Cached via Next's fetch cache
// (`revalidate`) so the storefront doesn't hit the backend on every render and
// auto-refreshes without a redeploy. Never throws — on any failure it returns
// empty data so the store falls back to hardcoded defaults.

export type SiteSettingsMap = Record<string, string | null>;

export interface SiteSettingRecord {
  key: string;
  value: string | null;
  type: string;
  section: string | null;
  label: string | null;
}

export interface SiteSettingsData {
  map: SiteSettingsMap;
  sections: Record<string, SiteSettingRecord[]>;
}

import { cache } from "react";

const EMPTY: SiteSettingsData = { map: {}, sections: {} };

// Revalidate window (seconds) for the cached settings fetch.
const REVALIDATE = 60;

// `cache` dedupes the call within a single render (root layout +
// generateMetadata both call it).
export const getSiteSettings = cache(async function getSiteSettings(): Promise<SiteSettingsData> {
  const base = process.env.NEXT_PUBLIC_API_URL || "";
  if (!base) return EMPTY;

  // Hard timeout so an unreachable/slow backend can never hang a build or a
  // request — we just fall back to defaults. (A hanging fetch here would time
  // out static page generation on Vercel.)
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 4000);

  try {
    const res = await fetch(`${base}/api/site-settings`, {
      next: { revalidate: REVALIDATE, tags: ["site-settings"] },
      signal: controller.signal,
    });
    if (!res.ok) return EMPTY;
    const json = (await res.json()) as {
      success?: boolean;
      data?: SiteSettingsData;
    };
    if (!json?.success || !json.data) return EMPTY;
    return {
      map: json.data.map ?? {},
      sections: json.data.sections ?? {},
    };
  } catch {
    return EMPTY;
  } finally {
    clearTimeout(timer);
  }
});

