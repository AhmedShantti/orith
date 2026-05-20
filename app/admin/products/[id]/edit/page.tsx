"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ApiResponse, BackendProduct } from "@/types";
import ProductForm, { ProductFormData } from "@/components/admin/ProductForm";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import { useToast } from "@/components/admin/Toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function EditProductPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();

  const [product, setProduct] = useState<BackendProduct | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get<ApiResponse<BackendProduct>>(`/api/products/${params.id}`)
      .then((res) => {
        if (res.success && res.data) {
          setProduct(res.data);
        } else {
          showToast("Product not found", "error");
          router.push("/admin/products");
        }
      })
      .catch(() => {
        showToast("Failed to load product", "error");
        router.push("/admin/products");
      })
      .finally(() => setLoading(false));
  }, [params.id, router, showToast]);

  async function handleSubmit(data: ProductFormData) {
    setSaving(true);
    try {
      const res = await api.put<ApiResponse<BackendProduct>>(
        `/api/products/${params.id}`,
        {
          nameEn: data.nameEn,
          nameAr: data.nameAr,
          descriptionEn: data.descriptionEn,
          descriptionAr: data.descriptionAr,
          price: data.price,
          originalPrice: data.originalPrice || null,
          image: data.image,
          sizes: data.sizes ? data.sizes.split(",").map((s) => s.trim()).filter(Boolean) : [],
          category: data.category,
          badge: data.badge || null,
          notesTop: data.notesTop ? data.notesTop.split(",").map((s) => s.trim()).filter(Boolean) : [],
          notesHeart: data.notesHeart ? data.notesHeart.split(",").map((s) => s.trim()).filter(Boolean) : [],
          notesBase: data.notesBase ? data.notesBase.split(",").map((s) => s.trim()).filter(Boolean) : [],
          stock: data.stock,
        }
      );
      if (res.success) {
        showToast("Product updated successfully!", "success");
        router.push("/admin/products");
      } else {
        showToast(res.error || "Failed to update product", "error");
      }
    } catch {
      showToast("Failed to update product", "error");
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        </div>
        <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
          <LoadingSkeleton type="form" />
        </div>
      </div>
    );
  }

  if (!product) return null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-[#f5f0e8]">
          Edit: {product.nameEn}
        </h1>
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
        <ProductForm
          initialData={product}
          onSubmit={handleSubmit}
          loading={saving}
        />
      </div>
    </div>
  );
}
