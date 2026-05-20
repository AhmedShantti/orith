"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { ApiResponse, BackendProduct } from "@/types";
import ProductForm, { ProductFormData } from "@/components/admin/ProductForm";
import { useToast } from "@/components/admin/Toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function NewProductPage() {
  const router = useRouter();
  const { showToast } = useToast();
  const [loading, setLoading] = useState(false);

  async function handleSubmit(data: ProductFormData) {
    setLoading(true);
    try {
      const res = await api.post<ApiResponse<BackendProduct>>(
        "/api/products",
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
        showToast("Product created successfully!", "success");
        router.push("/admin/products");
      } else {
        showToast(res.error || "Failed to create product", "error");
      }
    } catch {
      showToast("Failed to create product", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/products"
          className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-[#f5f0e8]">Add New Product</h1>
      </div>

      <div className="bg-[#111111] border border-white/5 rounded-xl p-6">
        <ProductForm onSubmit={handleSubmit} loading={loading} />
      </div>
    </div>
  );
}
