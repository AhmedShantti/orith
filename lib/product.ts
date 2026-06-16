// Pure, framework-free helpers that derive the presentational data the luxury
// product card needs from the existing `Product` shape. Keeping the logic here
// (instead of inside the component) makes it reusable, unit-testable, and keeps
// the card focused on layout. Everything degrades gracefully: missing data
// yields empty results so callers can hide a section rather than crash.

import type { FragranceNote, Product } from "@/types";
import type { Language } from "@/context/LanguageContext";

/** How many fragrance notes the card displays in its horizontal row. */
export const CARD_NOTE_COUNT = 4;

/** Highest possible rating value (5 stars). */
export const MAX_RATING = 5;

/**
 * Language-aware product name with a safe fallback to the other locale so a
 * card never renders an empty title.
 */
export function getProductName(product: Product, lang: Language): string {
  const primary = lang === "ar" ? product.nameAr : product.nameEn;
  return (primary || product.nameEn || product.nameAr || "").trim();
}

/**
 * Language-aware description, trimmed. Returns an empty string when the
 * product has no description so the card can hide the preview.
 */
export function getProductDescription(product: Product, lang: Language): string {
  const primary = lang === "ar" ? product.descriptionAr : product.descriptionEn;
  return (primary || "").trim();
}

/**
 * The brand/house line. Uses the product's own brand when present, otherwise
 * falls back to the store name (e.g. the maison itself).
 */
export function getProductBrand(product: Product, storeName: string): string {
  const brand = product.brand?.trim();
  return brand && brand.length > 0 ? brand : storeName;
}

/**
 * Clamp a raw rating into the displayable 0–5 range, or return null when no
 * usable rating exists. Half-step values are preserved.
 */
export function normalizeRating(rating: number | null | undefined): number | null {
  if (typeof rating !== "number" || !Number.isFinite(rating) || rating <= 0) {
    return null;
  }
  return Math.min(MAX_RATING, Math.max(0, rating));
}

/**
 * Flatten whatever notes a product carries into a single, de-duplicated list
 * of `FragranceNote` objects, capped at `limit`.
 *
 * Accepts every shape the catalogue has used or might use:
 *   - the legacy `{ top, heart, base }` string groups
 *   - a flat `string[]`
 *   - a structured `FragranceNote[]` (`{ name, image }`)
 *
 * Notes are drawn evenly from top → heart → base so the preview feels balanced
 * rather than dumping every top note first.
 */
export function getDisplayNotes(
  product: Product,
  limit: number = CARD_NOTE_COUNT
): FragranceNote[] {
  const raw = (product as { notes?: unknown }).notes;
  const collected = toFragranceNotes(raw);

  // De-duplicate by case-insensitive name while preserving order.
  const seen = new Set<string>();
  const unique: FragranceNote[] = [];
  for (const note of collected) {
    const key = note.name.toLowerCase();
    if (note.name && !seen.has(key)) {
      seen.add(key);
      unique.push(note);
    }
  }
  return unique.slice(0, limit);
}

/** Convert any supported notes shape into a flat, ordered FragranceNote list. */
function toFragranceNotes(raw: unknown): FragranceNote[] {
  if (!raw) return [];

  // Flat array — either string[] or FragranceNote[].
  if (Array.isArray(raw)) {
    return raw.map(toNote).filter((n): n is FragranceNote => n !== null);
  }

  // Legacy grouped shape: interleave top → heart → base for balance.
  if (typeof raw === "object") {
    const groups = raw as Record<string, unknown>;
    const top = asStringArray(groups.top);
    const heart = asStringArray(groups.heart);
    const base = asStringArray(groups.base);
    const ordered: string[] = [];
    const max = Math.max(top.length, heart.length, base.length);
    for (let i = 0; i < max; i++) {
      if (top[i]) ordered.push(top[i]);
      if (heart[i]) ordered.push(heart[i]);
      if (base[i]) ordered.push(base[i]);
    }
    return ordered.map((name) => ({ name }));
  }

  return [];
}

function toNote(value: unknown): FragranceNote | null {
  if (typeof value === "string") {
    const name = value.trim();
    return name ? { name } : null;
  }
  if (value && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const name = typeof obj.name === "string" ? obj.name.trim() : "";
    if (!name) return null;
    const image = typeof obj.image === "string" && obj.image.trim() ? obj.image.trim() : undefined;
    return { name, image };
  }
  return null;
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((v) => (typeof v === "string" ? v.trim() : ""))
    .filter((v) => v.length > 0);
}
