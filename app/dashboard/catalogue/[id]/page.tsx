"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { api, uploadImage } from "@/lib/api";
import type { ApiResponse, BackendProduct } from "@/types";
import Emblem from "@/components/Emblem";
import { useLang } from "@/context/LanguageContext";
import { dict } from "../../dict";
import {
  BADGE_OPTIONS,
  CATEGORY_OPTIONS,
  EXISTING_IMAGES,
  inputCls,
  isEditableProductId,
  labelCls,
} from "../constants";
import NotesEditor, { type NoteRow } from "../NotesEditor";

type NoteGroup = "top" | "heart" | "base";

/** Build editable note rows from a name list + the saved name→image map. */
function toRows(names: string[], images: Record<string, string> | null | undefined): NoteRow[] {
  return names.map((name) => ({ name, image: images?.[name] ?? "" }));
}

export default function EditProductPage() {
  const params = useParams();
  const router = useRouter();
  const { lang } = useLang();
  const d = dict[lang];

  const id = String(params.id ?? "");
  const editable = isEditableProductId(id);

  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);

  const [form, setForm] = useState({
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    price: "",
    originalPrice: "",
    category: "oriental",
    sizes: "100ml",
    badge: "",
    brand: "",
    rating: "",
    stock: "",
    image: EXISTING_IMAGES[0],
  });
  const [notes, setNotes] = useState<Record<NoteGroup, NoteRow[]>>({
    top: [],
    heart: [],
    base: [],
  });

  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  useEffect(() => {
    if (!editable) {
      setLoading(false);
      setNotFound(true);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<ApiResponse<BackendProduct>>(
          `/api/products/${id}`
        );
        if (cancelled) return;
        if (!res.success || !res.data) {
          setNotFound(true);
          return;
        }
        const p = res.data;
        setForm({
          nameEn: p.nameEn ?? "",
          nameAr: p.nameAr ?? "",
          descriptionEn: p.descriptionEn ?? "",
          descriptionAr: p.descriptionAr ?? "",
          price: String(p.price ?? ""),
          originalPrice: p.originalPrice != null ? String(p.originalPrice) : "",
          category: p.category ?? "oriental",
          sizes: (p.sizes ?? []).join(", ") || "100ml",
          badge: p.badge ?? "",
          brand: p.brand ?? "",
          rating: p.rating != null ? String(p.rating) : "",
          stock: p.stock != null ? String(p.stock) : "",
          image: p.image || EXISTING_IMAGES[0],
        });
        setNotes({
          top: toRows(p.notesTop ?? [], p.noteImages),
          heart: toRows(p.notesHeart ?? [], p.noteImages),
          base: toRows(p.notesBase ?? [], p.noteImages),
        });
      } catch (e) {
        if (!cancelled) {
          console.error("[edit-product] load failed:", e);
          setNotFound(true);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [id, editable]);

  const previewSrc = file ? URL.createObjectURL(file) : form.image;

  const setGroup = (g: NoteGroup) => (rows: NoteRow[]) =>
    setNotes((prev) => ({ ...prev, [g]: rows }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.nameEn.trim() || !form.nameAr.trim())
      return setError(d.addForm.errName);
    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0)
      return setError(d.addForm.errPrice);

    setSaving(true);
    try {
      let image = form.image;
      if (file) {
        image = await uploadImage(file);
      }

      // Clean each group's note names, and merge a single name→image map.
      const clean = (rows: NoteRow[]) =>
        rows.map((r) => ({ name: r.name.trim(), image: r.image.trim() })).filter((r) => r.name);
      const top = clean(notes.top);
      const heart = clean(notes.heart);
      const base = clean(notes.base);
      const noteImages: Record<string, string> = {};
      for (const r of [...top, ...heart, ...base]) {
        if (r.image) noteImages[r.name] = r.image;
      }

      await api.put<ApiResponse<BackendProduct>>(`/api/products/${id}`, {
        nameEn: form.nameEn.trim(),
        nameAr: form.nameAr.trim(),
        descriptionEn: form.descriptionEn.trim(),
        descriptionAr: form.descriptionAr.trim(),
        price,
        originalPrice: form.originalPrice.trim() ? Number(form.originalPrice) : null,
        category: form.category,
        sizes: form.sizes.split(",").map((s) => s.trim()).filter(Boolean),
        badge: form.badge || null,
        brand: form.brand.trim() || null,
        rating: form.rating.trim() ? Number(form.rating) : null,
        stock: form.stock.trim() ? Number(form.stock) : undefined,
        notesTop: top.map((r) => r.name),
        notesHeart: heart.map((r) => r.name),
        notesBase: base.map((r) => r.name),
        noteImages,
      });

      setSuccess(true);
      setTimeout(() => router.push("/dashboard/catalogue"), 700);
    } catch (e) {
      console.error("[edit-product] save failed:", e);
      setError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(d.catalogue.deleteConfirm)) return;
    setDeleting(true);
    try {
      await api.delete<ApiResponse<null>>(`/api/products/${id}`);
      router.push("/dashboard/catalogue");
    } catch (e) {
      console.error("[edit-product] delete failed:", e);
      setError(d.catalogue.deleteFailed);
      setDeleting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <Emblem size={40} className="text-crimson animate-pulse" />
        <p className="eyebrow text-[10px] text-obsidian/40">{d.loading}</p>
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-6 text-center">
        <Emblem size={36} className="text-obsidian/20" />
        <p className="display text-2xl text-obsidian/50">
          {editable ? d.editForm.notFound : d.editForm.notEditable}
        </p>
        <Link href="/dashboard/catalogue" className="eyebrow text-[10px] text-crimson link-underline">
          ← {d.editForm.back}
        </Link>
      </div>
    );
  }

  return (
    <div className="page-transition px-6 lg:px-12 py-10 lg:py-14 max-w-5xl">
      {/* Header */}
      <Link
        href="/dashboard/catalogue"
        className="inline-flex items-center gap-2 eyebrow text-[10px] text-obsidian/50 hover:text-crimson transition-colors mb-8"
      >
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
          <path d="M19 12H5M12 19l-7-7 7-7" />
        </svg>
        {d.editForm.back}
      </Link>

      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-obsidian/12 pb-8 mb-10">
        <div>
          <p className="eyebrow text-crimson mb-4">{d.administration}</p>
          <h1 className="display text-4xl sm:text-5xl text-obsidian" style={{ fontWeight: 600 }}>
            {d.editForm.title}
          </h1>
          <p className="font-body text-[11px] text-obsidian/40 mt-3">#{id}</p>
        </div>
        <button
          type="button"
          onClick={handleDelete}
          disabled={deleting}
          className="eyebrow text-[10px] text-crimson border border-crimson/30 px-5 py-3 hover:bg-crimson hover:text-ivory transition-colors disabled:opacity-50 self-start md:self-auto"
        >
          {deleting ? d.editForm.deleting : d.editForm.delete}
        </button>
      </div>

      {success && (
        <div className="mb-8 border border-emerald-700/30 bg-emerald-700/5 px-6 py-4">
          <p className="eyebrow text-[10px] text-emerald-700">✓ {d.editForm.saved}</p>
        </div>
      )}

      <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: core fields */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
          <div>
            <label className={labelCls}>{d.addForm.nameEn}</label>
            <input className={inputCls} value={form.nameEn} onChange={(e) => set("nameEn", e.target.value)} dir="ltr" />
          </div>
          <div>
            <label className={labelCls}>{d.addForm.nameAr}</label>
            <input className={inputCls} value={form.nameAr} onChange={(e) => set("nameAr", e.target.value)} dir="rtl" />
          </div>
          <div>
            <label className={labelCls}>{d.addForm.price}</label>
            <input type="number" min={1} className={inputCls} value={form.price} onChange={(e) => set("price", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{d.editForm.originalPrice}</label>
            <input type="number" min={0} className={inputCls} value={form.originalPrice} onChange={(e) => set("originalPrice", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{d.addForm.category}</label>
            <select className={`${inputCls} cursor-pointer`} value={form.category} onChange={(e) => set("category", e.target.value)}>
              {CATEGORY_OPTIONS.map((c) => (
                <option key={c} value={c}>{d.cat[c] ?? c}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>{d.addForm.badge}</label>
            <select className={`${inputCls} cursor-pointer`} value={form.badge} onChange={(e) => set("badge", e.target.value)}>
              <option value="">{d.addForm.none}</option>
              {BADGE_OPTIONS.map((b) => (
                <option key={b} value={b}>{d.badge[b as keyof typeof d.badge]}</option>
              ))}
            </select>
          </div>
          <div>
            <label className={labelCls}>{d.addForm.sizes}</label>
            <input className={inputCls} value={form.sizes} onChange={(e) => set("sizes", e.target.value)} placeholder="100ml, 50ml" dir="ltr" />
          </div>
          <div>
            <label className={labelCls}>{d.editForm.stock}</label>
            <input type="number" min={0} className={inputCls} value={form.stock} onChange={(e) => set("stock", e.target.value)} />
          </div>
          <div>
            <label className={labelCls}>{d.addForm.brand}</label>
            <input className={inputCls} value={form.brand} onChange={(e) => set("brand", e.target.value)} placeholder={d.addForm.brandPlaceholder} />
          </div>
          <div>
            <label className={labelCls}>{d.addForm.rating}</label>
            <input type="number" min={0} max={5} step={0.5} className={inputCls} value={form.rating} onChange={(e) => set("rating", e.target.value)} placeholder="0 – 5" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>{d.addForm.descEn}</label>
            <textarea className={`${inputCls} resize-none`} rows={2} value={form.descriptionEn} onChange={(e) => set("descriptionEn", e.target.value)} dir="ltr" />
          </div>
          <div className="sm:col-span-2">
            <label className={labelCls}>{d.addForm.descAr}</label>
            <textarea className={`${inputCls} resize-none`} rows={2} value={form.descriptionAr} onChange={(e) => set("descriptionAr", e.target.value)} dir="rtl" />
          </div>
        </div>

        {/* Right: image */}
        <div>
          <label className={labelCls}>{d.addForm.image}</label>
          <div className="relative aspect-[3/4] bg-gradient-to-b from-[#FBF8F2] to-[#EFE7DB] border border-obsidian/10 flex items-center justify-center mb-4 overflow-hidden">
            {previewSrc ? (
              <Image src={previewSrc} alt="preview" fill sizes="200px" className="object-contain p-6" unoptimized={!!file || previewSrc.startsWith("/products/upload-")} />
            ) : (
              <Emblem size={32} className="text-obsidian/20" />
            )}
          </div>
          <select className={`${inputCls} cursor-pointer mb-4`} value={file ? "" : form.image} disabled={!!file} onChange={(e) => set("image", e.target.value)}>
            <option value="" disabled>{d.addForm.pickExisting}</option>
            {EXISTING_IMAGES.map((img, i) => (
              <option key={img} value={img}>bottle-{i + 1}</option>
            ))}
          </select>
          <label className="block">
            <span className={labelCls}>{d.addForm.upload}</span>
            <input
              ref={fileRef}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="block w-full text-xs font-body text-obsidian/60 file:me-3 file:py-2 file:px-4 file:border file:border-obsidian/25 file:bg-transparent file:eyebrow file:text-[9px] file:text-obsidian hover:file:border-crimson hover:file:text-crimson file:cursor-pointer cursor-pointer"
            />
          </label>
        </div>

        {/* Fragrance notes with images */}
        <div className="lg:col-span-3 border-t border-obsidian/10 pt-8">
          <p className="eyebrow text-crimson mb-1">{d.editForm.notesTitle}</p>
          <p className="font-body text-xs text-obsidian/45 mb-6">{d.editForm.notesSubtitle}</p>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {(
              [
                ["top", d.editForm.notesTop],
                ["heart", d.editForm.notesHeart],
                ["base", d.editForm.notesBase],
              ] as [NoteGroup, string][]
            ).map(([group, label]) => (
              <NotesEditor
                key={group}
                label={label}
                notes={notes[group]}
                onChange={setGroup(group)}
                addLabel={d.editForm.addNote}
                namePlaceholder={d.editForm.notePlaceholder}
                imagePlaceholder={d.editForm.noteImagePlaceholder}
                uploadLabel={d.editForm.uploadNote}
              />
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="lg:col-span-3 flex flex-col sm:flex-row sm:items-center justify-end gap-5 pt-4 border-t border-obsidian/10">
          {error && <p className="eyebrow text-[9px] text-crimson">{error}</p>}
          <Link href="/dashboard/catalogue" className="btn-ghost text-obsidian text-[10px]">
            {d.catalogue.cancel}
          </Link>
          <button type="submit" disabled={saving} className="btn-crimson text-[10px] disabled:opacity-50">
            {saving ? d.editForm.saving : d.editForm.save}
          </button>
        </div>
      </form>
    </div>
  );
}
