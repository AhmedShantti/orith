"use client";
import React from "react";
import Image from "next/image";
import type { FragranceNote } from "@/types";

interface FragranceNotesProps {
  notes: FragranceNote[];
  /** Section heading, e.g. "Fragrance Notes". */
  heading: string;
  className?: string;
}

/**
 * Horizontal row of fragrance notes — each an icon (or image) above a label,
 * evenly spaced and centred. When a note carries an `image` it is used;
 * otherwise a curated line-icon is chosen from the note name, with an elegant
 * generic glyph as the final fallback.
 */
function FragranceNotes({ notes, heading, className = "" }: FragranceNotesProps) {
  if (notes.length === 0) return null;

  return (
    <div className={className}>
      <div className="flex items-center justify-center gap-3 mb-5">
        <span className="h-px w-6 bg-sand-dark/40" aria-hidden="true" />
        <h3 className="eyebrow text-[8px] text-sand-dark">{heading}</h3>
        <span className="h-px w-6 bg-sand-dark/40" aria-hidden="true" />
      </div>

      <ul className="flex items-start justify-center gap-2 sm:gap-3" role="list">
        {notes.map((note) => (
          <li
            key={note.name}
            className="flex flex-1 min-w-0 flex-col items-center gap-2 text-center"
          >
            <span className="flex h-11 w-11 items-center justify-center rounded-full bg-champagne/40 text-crimson transition-colors duration-300 group-hover:bg-champagne/70">
              {note.image ? (
                <span className="relative h-6 w-6">
                  <Image
                    src={note.image}
                    alt=""
                    fill
                    sizes="24px"
                    className="object-contain"
                  />
                </span>
              ) : (
                <NoteIcon name={note.name} />
              )}
            </span>
            <span className="font-body text-[10px] leading-tight text-obsidian/65 line-clamp-2 break-words">
              {note.name}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Keyword → icon family. Order matters: first match wins. */
const ICON_KEYWORDS: { match: RegExp; icon: IconKind }[] = [
  { match: /(rose|jasmin|floral|blossom|lily|violet|peony|iris|tuberose|orange blossom)/i, icon: "floral" },
  { match: /(oud|wood|cedar|sandal|vetiver|pine|patchouli)/i, icon: "wood" },
  { match: /(amber|resin|labdanum|benzoin)/i, icon: "amber" },
  { match: /(vanilla|tonka|caramel|sugar|honey|sweet)/i, icon: "vanilla" },
  { match: /(musk|skin|cotton)/i, icon: "musk" },
  { match: /(citrus|lemon|bergamot|orange|grapefruit|mandarin|lime|currant)/i, icon: "citrus" },
  { match: /(spice|pepper|cardamom|cinnamon|saffron|ginger|clove)/i, icon: "spice" },
  { match: /(leather|suede|tobacco|smoke|incense)/i, icon: "smoke" },
];

type IconKind = "floral" | "wood" | "amber" | "vanilla" | "musk" | "citrus" | "spice" | "smoke" | "default";

function NoteIcon({ name }: { name: string }) {
  const kind = ICON_KEYWORDS.find((k) => k.match.test(name))?.icon ?? "default";
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.3,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (kind) {
    case "floral":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="2.4" />
          <path d="M12 9.6V5M12 14.4V19M9.6 12H5M14.4 12H19M10.3 10.3 7.4 7.4M13.7 13.7l2.9 2.9M13.7 10.3l2.9-2.9M10.3 13.7l-2.9 2.9" />
        </svg>
      );
    case "wood":
      return (
        <svg {...common}>
          <path d="M12 3c-2 3-2 5 0 8s2 7 0 10" />
          <path d="M9 6c1.5 2 1.5 3.5 0 5.5M15 6c-1.5 2-1.5 3.5 0 5.5" />
        </svg>
      );
    case "amber":
      return (
        <svg {...common}>
          <path d="M12 3l2.2 4.5L19 8.3l-3.5 3.4.8 4.9L12 14.3 7.7 16.6l.8-4.9L5 8.3l4.8-.8z" />
        </svg>
      );
    case "vanilla":
      return (
        <svg {...common}>
          <path d="M8 4c0 5 0 11 4 16M16 4c0 5 0 11-4 16" />
          <path d="M8 4h8" />
        </svg>
      );
    case "musk":
      return (
        <svg {...common}>
          <path d="M12 21c4-2 6-5 6-9a6 6 0 0 0-12 0c0 4 2 7 6 9z" />
          <circle cx="12" cy="11" r="2" />
        </svg>
      );
    case "citrus":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 4v16M4 12h16M6.3 6.3l11.4 11.4M17.7 6.3 6.3 17.7" />
        </svg>
      );
    case "spice":
      return (
        <svg {...common}>
          <path d="M12 3c3 2 4 5 4 8s-1 7-4 10c-3-3-4-7-4-10s1-6 4-8z" />
        </svg>
      );
    case "smoke":
      return (
        <svg {...common}>
          <path d="M7 20c-1-1.5-1-3 .5-4S9 13 8 11.5 7 8 9 6.5 12 5 11.5 3" />
          <path d="M13 20c-1-1.5-1-3 .5-4s1.5-3 .5-4.5" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <path d="M12 21c4-2 6.5-5.5 6.5-9.5C18.5 7 15.5 3 12 3S5.5 7 5.5 11.5C5.5 15.5 8 19 12 21z" />
        </svg>
      );
  }
}

export default React.memo(FragranceNotes);
