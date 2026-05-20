"use client";

import { useState, FormEvent } from "react";
import { BackendProduct } from "@/types";
import Image from "next/image";

export interface ProductFormData {
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  price: string;
  originalPrice: string;
  category: string;
  stock: string;
  image: string;
  sizes: string;
  badge: string;
  notesTop: string;
  notesHeart: string;
  notesBase: string;
}

interface ProductFormProps {
  initialData?: BackendProduct;
  onSubmit: (data: ProductFormData) => Promise<void>;
  loading: boolean;
}

interface FormErrors {
  nameEn?: string;
  nameAr?: string;
  descriptionEn?: string;
  descriptionAr?: string;
  price?: string;
  stock?: string;
  image?: string;
}

export default function ProductForm({
  initialData,
  onSubmit,
  loading,
}: ProductFormProps) {
  const [form, setForm] = useState<ProductFormData>({
    nameEn: initialData?.nameEn || "",
    nameAr: initialData?.nameAr || "",
    descriptionEn: initialData?.descriptionEn || "",
    descriptionAr: initialData?.descriptionAr || "",
    price: initialData?.price?.toString() || "",
    originalPrice: initialData?.originalPrice?.toString() || "",
    category: initialData?.category || "men",
    stock: initialData?.stock?.toString() || "",
    image: initialData?.image || "",
    sizes: initialData?.sizes?.join(", ") || "",
    badge: initialData?.badge || "",
    notesTop: initialData?.notesTop?.join(", ") || "",
    notesHeart: initialData?.notesHeart?.join(", ") || "",
    notesBase: initialData?.notesBase?.join(", ") || "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const newErrors: FormErrors = {};
    if (!form.nameEn.trim()) newErrors.nameEn = "English name is required";
    if (!form.nameAr.trim()) newErrors.nameAr = "Arabic name is required";
    if (!form.descriptionEn.trim())
      newErrors.descriptionEn = "English description is required";
    if (!form.descriptionAr.trim())
      newErrors.descriptionAr = "Arabic description is required";
    if (!form.price || parseFloat(form.price) < 0)
      newErrors.price = "Valid price required";
    if (!form.stock || parseInt(form.stock) < 0)
      newErrors.stock = "Valid stock required";
    if (!form.image.trim()) newErrors.image = "Image path is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    await onSubmit(form);
  }

  function updateField(field: keyof ProductFormData, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  }

  const inputClass =
    "w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-[#f5f0e8] placeholder-white/20 focus:outline-none focus:border-[#c9a84c]/50 transition-colors";
  const labelClass = "block text-sm font-medium text-white/50 mb-1.5";
  const errorClass = "text-xs text-red-400 mt-1";

  return (
    <form onSubmit={handleSubmit} className="space-y-5 max-w-2xl">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Name (English)</label>
          <input
            type="text"
            value={form.nameEn}
            onChange={(e) => updateField("nameEn", e.target.value)}
            className={inputClass}
            placeholder="Rehal Forest"
          />
          {errors.nameEn && <p className={errorClass}>{errors.nameEn}</p>}
        </div>
        <div>
          <label className={labelClass}>Name (Arabic)</label>
          <input
            type="text"
            dir="rtl"
            value={form.nameAr}
            onChange={(e) => updateField("nameAr", e.target.value)}
            className={inputClass}
            placeholder="رحال فورست"
          />
          {errors.nameAr && <p className={errorClass}>{errors.nameAr}</p>}
        </div>
      </div>

      <div>
        <label className={labelClass}>Description (English)</label>
        <textarea
          value={form.descriptionEn}
          onChange={(e) => updateField("descriptionEn", e.target.value)}
          className={`${inputClass} min-h-[80px] resize-y`}
          placeholder="A sophisticated blend of oud, amber, and sandalwood..."
        />
        {errors.descriptionEn && (
          <p className={errorClass}>{errors.descriptionEn}</p>
        )}
      </div>

      <div>
        <label className={labelClass}>Description (Arabic)</label>
        <textarea
          dir="rtl"
          value={form.descriptionAr}
          onChange={(e) => updateField("descriptionAr", e.target.value)}
          className={`${inputClass} min-h-[80px] resize-y`}
          placeholder="عطر خشبي أخضر بطابع فخم ومنعش..."
        />
        {errors.descriptionAr && (
          <p className={errorClass}>{errors.descriptionAr}</p>
        )}
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className={labelClass}>Price (EGP)</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.price}
            onChange={(e) => updateField("price", e.target.value)}
            className={inputClass}
            placeholder="1175"
          />
          {errors.price && <p className={errorClass}>{errors.price}</p>}
        </div>
        <div>
          <label className={labelClass}>Original Price</label>
          <input
            type="number"
            step="0.01"
            min="0"
            value={form.originalPrice}
            onChange={(e) => updateField("originalPrice", e.target.value)}
            className={inputClass}
            placeholder="Optional"
          />
        </div>
        <div>
          <label className={labelClass}>Stock</label>
          <input
            type="number"
            min="0"
            value={form.stock}
            onChange={(e) => updateField("stock", e.target.value)}
            className={inputClass}
            placeholder="50"
          />
          {errors.stock && <p className={errorClass}>{errors.stock}</p>}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Category</label>
          <select
            value={form.category}
            onChange={(e) => updateField("category", e.target.value)}
            className={inputClass}
          >
            <option value="men">Men</option>
            <option value="women">Women</option>
            <option value="unisex">Unisex</option>
            <option value="woody">Woody</option>
            <option value="oriental">Oriental</option>
            <option value="fresh">Fresh</option>
            <option value="floral">Floral</option>
          </select>
        </div>
        <div>
          <label className={labelClass}>Badge</label>
          <select
            value={form.badge}
            onChange={(e) => updateField("badge", e.target.value)}
            className={inputClass}
          >
            <option value="">None</option>
            <option value="bestseller">Bestseller</option>
            <option value="new">New</option>
            <option value="limited">Limited</option>
            <option value="offer">Offer</option>
          </select>
        </div>
      </div>

      <div>
        <label className={labelClass}>Sizes (comma separated)</label>
        <input
          type="text"
          value={form.sizes}
          onChange={(e) => updateField("sizes", e.target.value)}
          className={inputClass}
          placeholder="50ml, 100ml"
        />
      </div>

      <div>
        <label className={labelClass}>Image Path</label>
        <input
          type="text"
          value={form.image}
          onChange={(e) => updateField("image", e.target.value)}
          className={inputClass}
          placeholder="/products/bottle-1.png"
        />
        {errors.image && <p className={errorClass}>{errors.image}</p>}
        {form.image && (
          <div className="mt-3 p-3 bg-white/5 rounded-lg border border-white/5 inline-block">
            <Image
              src={form.image}
              alt="Preview"
              width={80}
              height={80}
              className="rounded object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      <div className="border-t border-white/5 pt-5">
        <p className="text-xs font-medium text-white/30 uppercase tracking-wider mb-3">
          Fragrance Notes (comma separated)
        </p>
        <div className="grid grid-cols-3 gap-4">
          <div>
            <label className={labelClass}>Top Notes</label>
            <input
              type="text"
              value={form.notesTop}
              onChange={(e) => updateField("notesTop", e.target.value)}
              className={inputClass}
              placeholder="Bergamot, Lemon"
            />
          </div>
          <div>
            <label className={labelClass}>Heart Notes</label>
            <input
              type="text"
              value={form.notesHeart}
              onChange={(e) => updateField("notesHeart", e.target.value)}
              className={inputClass}
              placeholder="Rose, Jasmine"
            />
          </div>
          <div>
            <label className={labelClass}>Base Notes</label>
            <input
              type="text"
              value={form.notesBase}
              onChange={(e) => updateField("notesBase", e.target.value)}
              className={inputClass}
              placeholder="Oud, Musk"
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#c9a84c] hover:bg-[#b8993f] text-[#0a0a0a] font-semibold py-3 px-6 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
      >
        {loading && (
          <div className="w-4 h-4 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
        )}
        {loading
          ? "Saving..."
          : initialData
          ? "Update Product"
          : "Create Product"}
      </button>
    </form>
  );
}
