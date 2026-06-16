"use client";
import { api, apiUrl } from "@/lib/api";
import React, { useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Emblem from "@/components/Emblem";
import { useLang } from "@/context/LanguageContext";
import type { ApiResponse, Product } from "@/types";
import { dict } from "../dict";
import { SearchIcon } from "../icons";
import {
  BADGE_OPTIONS,
  CATEGORY_OPTIONS,
  EXISTING_IMAGES,
  inputCls,
  isEditableProductId,
  labelCls,
  splitNotes,
} from "./constants";

const fmt = (n: number) => n.toLocaleString();

export default function CataloguePage() {
  const { lang } = useLang();
  const d = dict[lang];

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [activeCat, setActiveCat] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // add-product form
  const [showForm, setShowForm] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    nameEn: "",
    nameAr: "",
    descriptionEn: "",
    descriptionAr: "",
    price: "",
    category: "oriental",
    sizes: "100ml",
    badge: "",
    brand: "",
    rating: "",
    notesTop: "",
    notesHeart: "",
    notesBase: "",
    image: EXISTING_IMAGES[0],
  });
  const [file, setFile] = useState<File | null>(null);

  const name = (p: Product) => (lang === "ar" ? p.nameAr : p.nameEn);
  const set = (k: keyof typeof form, v: string) =>
    setForm((f) => ({ ...f, [k]: v }));

  const load = async () => {
    const res = await fetch(apiUrl("/api/products"));
    const json = (await res.json()) as { products: Product[] };
    setProducts(json.products);
  };

  const handleDelete = async (p: Product) => {
    if (!window.confirm(d.catalogue.deleteConfirm)) return;
    setDeletingId(p.id);
    try {
      await api.delete<ApiResponse<null>>(`/api/products/${p.id}`);
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
    } catch (e) {
      console.error("[catalogue] delete failed:", e);
      window.alert(d.catalogue.deleteFailed);
    } finally {
      setDeletingId(null);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await load();
      } catch (e) {
        console.error("[catalogue] failed to load products:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const cats = useMemo(() => {
    const set = Array.from(new Set(products.map((p) => p.category)));
    return ["all", ...set];
  }, [products]);

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        const matchCat = activeCat === "all" || p.category === activeCat;
        const matchSearch =
          !search ||
          p.nameEn.toLowerCase().includes(search.toLowerCase()) ||
          p.nameAr.includes(search);
        return matchCat && matchSearch;
      }),
    [products, activeCat, search]
  );

  const previewSrc = file ? URL.createObjectURL(file) : form.image;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!form.nameEn.trim() || !form.nameAr.trim())
      return setFormError(d.addForm.errName);
    const price = Number(form.price);
    if (!Number.isFinite(price) || price <= 0)
      return setFormError(d.addForm.errPrice);

    setSaving(true);
    try {
      let image = form.image;
      // upload chosen file first, if any
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const up = await fetch(apiUrl("/api/upload"), { method: "POST", body: fd });
        if (!up.ok) {
          const err = await up.json().catch(() => ({}));
          throw new Error(err.error ?? "Upload failed");
        }
        image = (await up.json()).path as string;
      }

      const res = await fetch(apiUrl("/api/products"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameEn: form.nameEn,
          nameAr: form.nameAr,
          descriptionEn: form.descriptionEn,
          descriptionAr: form.descriptionAr,
          price,
          category: form.category,
          sizes: form.sizes
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean),
          badge: form.badge || undefined,
          brand: form.brand.trim() || undefined,
          rating: form.rating.trim() ? Number(form.rating) : undefined,
          notesTop: splitNotes(form.notesTop),
          notesHeart: splitNotes(form.notesHeart),
          notesBase: splitNotes(form.notesBase),
          image,
        }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to add product");
      }

      // reset
      setForm({
        nameEn: "",
        nameAr: "",
        descriptionEn: "",
        descriptionAr: "",
        price: "",
        category: "oriental",
        sizes: "100ml",
        badge: "",
        brand: "",
        rating: "",
        notesTop: "",
        notesHeart: "",
        notesBase: "",
        image: EXISTING_IMAGES[0],
      });
      setFile(null);
      if (fileRef.current) fileRef.current.value = "";
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      setShowForm(false);
      await load();
    } catch (e) {
      console.error("[catalogue] product creation failed:", e);
      setFormError(e instanceof Error ? e.message : "Error");
    } finally {
      setSaving(false);
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

  return (
    <div className="page-transition px-6 lg:px-12 py-10 lg:py-14">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-obsidian/12 pb-8 mb-12">
        <div>
          <p className="eyebrow text-crimson mb-4">{d.administration}</p>
          <h1
            className="display text-4xl sm:text-5xl lg:text-6xl text-obsidian"
            style={{ fontWeight: 600 }}
          >
            {d.catalogue.title}
          </h1>
        </div>
        <button
          onClick={() => {
            setShowForm((v) => !v);
            setFormError(null);
          }}
          className="btn-crimson text-[10px] self-start md:self-auto"
        >
          {showForm ? d.catalogue.cancel : `+ ${d.catalogue.addProduct}`}
        </button>
      </div>

      {success && (
        <div className="mb-8 border border-emerald-700/30 bg-emerald-700/5 px-6 py-4">
          <p className="eyebrow text-[10px] text-emerald-700">✓ {d.addForm.added}</p>
        </div>
      )}

      {/* Add product form */}
      {showForm && (
        <div className="border border-crimson/20 bg-ivory p-8 mb-12">
          <p className="eyebrow text-crimson mb-1">{d.addForm.title}</p>
          <p className="font-body text-xs text-obsidian/45 mb-8">
            {d.addForm.subtitle}
          </p>
          <form onSubmit={submit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: fields */}
            <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className={labelCls}>{d.addForm.nameEn}</label>
                <input
                  className={inputCls}
                  value={form.nameEn}
                  onChange={(e) => set("nameEn", e.target.value)}
                  dir="ltr"
                />
              </div>
              <div>
                <label className={labelCls}>{d.addForm.nameAr}</label>
                <input
                  className={inputCls}
                  value={form.nameAr}
                  onChange={(e) => set("nameAr", e.target.value)}
                  dir="rtl"
                />
              </div>
              <div>
                <label className={labelCls}>{d.addForm.price}</label>
                <input
                  type="number"
                  min={1}
                  className={inputCls}
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                />
              </div>
              <div>
                <label className={labelCls}>{d.addForm.category}</label>
                <select
                  className={`${inputCls} cursor-pointer`}
                  value={form.category}
                  onChange={(e) => set("category", e.target.value)}
                >
                  {CATEGORY_OPTIONS.map((c) => (
                    <option key={c} value={c}>
                      {d.cat[c] ?? c}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{d.addForm.sizes}</label>
                <input
                  className={inputCls}
                  value={form.sizes}
                  onChange={(e) => set("sizes", e.target.value)}
                  placeholder="100ml, 50ml"
                />
              </div>
              <div>
                <label className={labelCls}>{d.addForm.badge}</label>
                <select
                  className={`${inputCls} cursor-pointer`}
                  value={form.badge}
                  onChange={(e) => set("badge", e.target.value)}
                >
                  <option value="">{d.addForm.none}</option>
                  {BADGE_OPTIONS.map((b) => (
                    <option key={b} value={b}>
                      {d.badge[b as keyof typeof d.badge]}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className={labelCls}>{d.addForm.brand}</label>
                <input
                  className={inputCls}
                  value={form.brand}
                  onChange={(e) => set("brand", e.target.value)}
                  placeholder={d.addForm.brandPlaceholder}
                />
              </div>
              <div>
                <label className={labelCls}>{d.addForm.rating}</label>
                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.5}
                  className={inputCls}
                  value={form.rating}
                  onChange={(e) => set("rating", e.target.value)}
                  placeholder="0 – 5"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>{d.addForm.descEn}</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={2}
                  value={form.descriptionEn}
                  onChange={(e) => set("descriptionEn", e.target.value)}
                  dir="ltr"
                />
              </div>
              <div className="sm:col-span-2">
                <label className={labelCls}>{d.addForm.descAr}</label>
                <textarea
                  className={`${inputCls} resize-none`}
                  rows={2}
                  value={form.descriptionAr}
                  onChange={(e) => set("descriptionAr", e.target.value)}
                  dir="rtl"
                />
              </div>

              {/* Fragrance notes — comma separated, optional */}
              <div className="sm:col-span-2 grid grid-cols-1 sm:grid-cols-3 gap-6">
                <div>
                  <label className={labelCls}>{d.addForm.notesTop}</label>
                  <input
                    className={inputCls}
                    value={form.notesTop}
                    onChange={(e) => set("notesTop", e.target.value)}
                    placeholder={d.addForm.notesPlaceholder}
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className={labelCls}>{d.addForm.notesHeart}</label>
                  <input
                    className={inputCls}
                    value={form.notesHeart}
                    onChange={(e) => set("notesHeart", e.target.value)}
                    placeholder={d.addForm.notesPlaceholder}
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className={labelCls}>{d.addForm.notesBase}</label>
                  <input
                    className={inputCls}
                    value={form.notesBase}
                    onChange={(e) => set("notesBase", e.target.value)}
                    placeholder={d.addForm.notesPlaceholder}
                    dir="ltr"
                  />
                </div>
              </div>
            </div>

            {/* Right: image */}
            <div>
              <label className={labelCls}>{d.addForm.image}</label>
              <div className="relative aspect-[3/4] bg-gradient-to-b from-[#FBF8F2] to-[#EFE7DB] border border-obsidian/10 flex items-center justify-center mb-4 overflow-hidden">
                {previewSrc ? (
                  <Image
                    src={previewSrc}
                    alt="preview"
                    fill
                    sizes="200px"
                    className="object-contain p-6"
                    unoptimized={!!file}
                  />
                ) : (
                  <Emblem size={32} className="text-obsidian/20" />
                )}
              </div>

              <select
                className={`${inputCls} cursor-pointer mb-4`}
                value={file ? "" : form.image}
                disabled={!!file}
                onChange={(e) => set("image", e.target.value)}
              >
                <option value="" disabled>
                  {d.addForm.pickExisting}
                </option>
                {EXISTING_IMAGES.map((img, i) => (
                  <option key={img} value={img}>
                    bottle-{i + 1}
                  </option>
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

            {/* Submit row */}
            <div className="lg:col-span-3 flex flex-col sm:flex-row sm:items-center justify-end gap-5 pt-4 border-t border-obsidian/10">
              {formError && (
                <p className="eyebrow text-[9px] text-crimson">{formError}</p>
              )}
              <button
                type="submit"
                disabled={saving}
                className="btn-crimson text-[10px] disabled:opacity-50"
              >
                {saving ? d.addForm.saving : d.addForm.save}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col lg:flex-row gap-6 mb-8 items-start lg:items-center lg:justify-between">
        <div className="relative w-full lg:max-w-xs border-b border-obsidian/20 focus-within:border-crimson transition-colors">
          <span className="absolute top-1/2 -translate-y-1/2 start-0 text-obsidian/30">
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={d.catalogue.search}
            className="w-full ps-7 pe-2 py-3 bg-transparent text-sm font-body text-obsidian placeholder-obsidian/30 focus:outline-none tracking-wide"
          />
        </div>

        <div className="flex flex-wrap gap-x-5 gap-y-2 items-center">
          {cats.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCat(cat)}
              className={`eyebrow text-[10px] pb-1.5 border-b transition-colors ${
                activeCat === cat
                  ? "border-crimson text-crimson"
                  : "border-transparent text-obsidian/50 hover:text-obsidian"
              }`}
            >
              {d.cat[cat] ?? cat}
            </button>
          ))}
        </div>
      </div>

      <p className="eyebrow text-[9px] text-obsidian/40 mb-6">
        {String(filtered.length).padStart(2, "0")} — {d.catalogue.fragrances}
      </p>

      {/* Table */}
      <div className="border border-obsidian/10 overflow-x-auto">
        <table className="w-full min-w-[680px]">
          <thead>
            <tr className="bg-obsidian/[0.03] border-b border-obsidian/10">
              {[
                d.table.fragrance,
                d.table.category,
                d.table.size,
                d.table.status,
                d.table.price,
              ].map((h) => (
                <th
                  key={h}
                  className="eyebrow text-[9px] text-obsidian/40 text-start px-6 py-4 font-normal"
                >
                  {h}
                </th>
              ))}
              <th className="eyebrow text-[9px] text-obsidian/40 text-end px-6 py-4 font-normal">
                {d.catalogue.manage}
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr
                key={p.id}
                className="border-b border-obsidian/8 hover:bg-crimson/[0.03] transition-colors"
              >
                <td className="px-6 py-4">
                  <div className="flex items-center gap-4">
                    <div className="relative w-10 h-12 shrink-0 bg-beige/60 overflow-hidden">
                      <Image
                        src={p.image}
                        alt={p.nameEn}
                        fill
                        sizes="40px"
                        className="object-contain"
                        unoptimized={p.image.startsWith("/products/upload-")}
                      />
                    </div>
                    <div>
                      <p className="product-name text-base text-obsidian leading-tight">
                        {name(p)}
                      </p>
                      <p className="font-body text-[11px] text-obsidian/40 mt-0.5">
                        #{p.id}
                      </p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="eyebrow text-[9px] text-obsidian/60">
                    {d.cat[p.category] ?? p.category}
                  </span>
                </td>
                <td className="px-6 py-4 font-body text-xs text-obsidian/60">
                  {p.sizes.join(", ")}
                </td>
                <td className="px-6 py-4">
                  {p.badge ? (
                    <span className="inline-block eyebrow text-[8px] text-crimson border border-crimson/30 px-2 py-1">
                      {d.badge[p.badge] ?? p.badge}
                    </span>
                  ) : (
                    <span className="font-body text-xs text-obsidian/30">—</span>
                  )}
                </td>
                <td
                  className="px-6 py-4 display text-base text-obsidian whitespace-nowrap"
                  style={{ fontWeight: 500 }}
                >
                  {fmt(p.price)}
                  <span className="font-body text-[10px] text-obsidian/40 ms-1">
                    {d.egp}
                  </span>
                </td>
                <td className="px-6 py-4">
                  {isEditableProductId(p.id) ? (
                    <div className="flex items-center justify-end gap-4">
                      <Link
                        href={`/dashboard/catalogue/${p.id}`}
                        className="eyebrow text-[9px] text-obsidian/60 hover:text-crimson transition-colors"
                      >
                        {d.catalogue.edit}
                      </Link>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        disabled={deletingId === p.id}
                        className="eyebrow text-[9px] text-crimson/70 hover:text-crimson transition-colors disabled:opacity-40"
                      >
                        {deletingId === p.id ? d.catalogue.deleting : d.catalogue.delete}
                      </button>
                    </div>
                  ) : (
                    <p
                      className="text-end font-body text-[10px] text-obsidian/30"
                      title={d.catalogue.builtIn}
                    >
                      {d.catalogue.builtIn}
                    </p>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {filtered.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center gap-4">
            <Emblem size={32} className="text-obsidian/20" />
            <p className="display text-xl text-obsidian/40">
              {d.catalogue.noResults}
            </p>
            <button
              onClick={() => {
                setSearch("");
                setActiveCat("all");
              }}
              className="eyebrow text-[10px] text-crimson link-underline"
            >
              {d.catalogue.clearFilters}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
