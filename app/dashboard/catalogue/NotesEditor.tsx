"use client";
import React, { useRef, useState } from "react";
import Image from "next/image";
import { uploadImage } from "@/lib/api";

/** A single editable fragrance note: a name and an optional icon/image URL. */
export interface NoteRow {
  name: string;
  image: string;
}

interface NotesEditorProps {
  label: string;
  notes: NoteRow[];
  onChange: (next: NoteRow[]) => void;
  /** i18n strings supplied by the parent. */
  addLabel: string;
  namePlaceholder: string;
  imagePlaceholder: string;
  uploadLabel: string;
}

const inputCls =
  "w-full bg-transparent border-b border-obsidian/20 focus:border-crimson py-2 text-sm font-body text-obsidian placeholder-obsidian/30 focus:outline-none transition-colors";

/**
 * Editor for one fragrance-note group (Top / Heart / Base). Each note is a row
 * with a name field and an image: the admin can paste a URL or upload an icon
 * (stored via the shared upload endpoint). Rows can be added and removed.
 */
export default function NotesEditor({
  label,
  notes,
  onChange,
  addLabel,
  namePlaceholder,
  imagePlaceholder,
  uploadLabel,
}: NotesEditorProps) {
  const update = (i: number, patch: Partial<NoteRow>) =>
    onChange(notes.map((n, idx) => (idx === i ? { ...n, ...patch } : n)));
  const remove = (i: number) => onChange(notes.filter((_, idx) => idx !== i));
  const add = () => onChange([...notes, { name: "", image: "" }]);

  return (
    <div>
      <p className="eyebrow text-[9px] text-obsidian/45 mb-3">{label}</p>
      <div className="flex flex-col gap-4">
        {notes.map((note, i) => (
          <NoteRowEditor
            key={i}
            note={note}
            onChange={(patch) => update(i, patch)}
            onRemove={() => remove(i)}
            namePlaceholder={namePlaceholder}
            imagePlaceholder={imagePlaceholder}
            uploadLabel={uploadLabel}
          />
        ))}
      </div>
      <button
        type="button"
        onClick={add}
        className="mt-4 eyebrow text-[9px] text-crimson link-underline"
      >
        + {addLabel}
      </button>
    </div>
  );
}

function NoteRowEditor({
  note,
  onChange,
  onRemove,
  namePlaceholder,
  imagePlaceholder,
  uploadLabel,
}: {
  note: NoteRow;
  onChange: (patch: Partial<NoteRow>) => void;
  onRemove: () => void;
  namePlaceholder: string;
  imagePlaceholder: string;
  uploadLabel: string;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpload = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const path = await uploadImage(file);
      onChange({ image: path });
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  };

  return (
    <div className="flex items-start gap-3 border border-obsidian/10 bg-ivory p-3">
      {/* Icon preview */}
      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-full bg-champagne/40 flex items-center justify-center">
        {note.image ? (
          <Image
            src={note.image}
            alt=""
            fill
            sizes="48px"
            className="object-contain p-1.5"
            unoptimized={note.image.startsWith("/products/upload-")}
          />
        ) : (
          <span className="text-crimson/40 text-lg">◌</span>
        )}
      </div>

      {/* Fields */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
        <input
          className={inputCls}
          value={note.name}
          onChange={(e) => onChange({ name: e.target.value })}
          placeholder={namePlaceholder}
          dir="ltr"
        />
        <input
          className={inputCls}
          value={note.image}
          onChange={(e) => onChange({ image: e.target.value })}
          placeholder={imagePlaceholder}
          dir="ltr"
        />
        <label className="sm:col-span-2 block">
          <input
            ref={fileRef}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handleUpload(f);
            }}
            className="block w-full text-xs font-body text-obsidian/60 file:me-3 file:py-1.5 file:px-3 file:border file:border-obsidian/25 file:bg-transparent file:eyebrow file:text-[9px] file:text-obsidian hover:file:border-crimson hover:file:text-crimson file:cursor-pointer cursor-pointer"
          />
          {uploading && (
            <span className="eyebrow text-[8px] text-obsidian/40">{uploadLabel}…</span>
          )}
          {error && <span className="eyebrow text-[8px] text-crimson">{error}</span>}
        </label>
      </div>

      {/* Remove */}
      <button
        type="button"
        onClick={onRemove}
        aria-label="Remove note"
        className="shrink-0 w-8 h-8 flex items-center justify-center border border-obsidian/15 text-obsidian/40 hover:border-crimson hover:text-crimson transition-colors"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  );
}
