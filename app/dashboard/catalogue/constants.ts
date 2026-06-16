// Shared catalogue-form constants and helpers, used by both the catalogue list
// page and the product edit page.

export const CATEGORY_OPTIONS = ["oriental", "floral", "woody", "fresh", "powdery"];
export const BADGE_OPTIONS = ["bestseller", "new", "limited", "offer"];

/** The bundled bottle images shipped in /public/products. */
export const EXISTING_IMAGES = Array.from(
  { length: 31 },
  (_, i) => `/products/bottle-${i + 1}.png`
);

export const inputCls =
  "w-full bg-transparent border-b border-obsidian/20 focus:border-crimson py-2.5 text-sm font-body text-obsidian placeholder-obsidian/30 focus:outline-none transition-colors";
export const labelCls = "eyebrow text-[9px] text-obsidian/45 mb-2 block";

/**
 * Built-in catalogue products use plain numeric ids ("1".."31") and ship in a
 * static file. They are fully editable — an edit materializes a DB override
 * with the same id — but they can't be permanently deleted (the file always
 * re-supplies them), so the delete action is reserved for admin-created
 * products (cuid ids).
 */
export const isBuiltInProductId = (id: string): boolean => /^\d+$/.test(id);

/** Comma-separated input → clean string[]. */
export const splitNotes = (v: string): string[] =>
  v
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
