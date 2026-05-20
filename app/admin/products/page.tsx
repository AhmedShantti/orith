"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { api } from "@/lib/api";
import { BackendProduct, PaginatedResponse, ApiResponse } from "@/types";
import DataTable, { Column } from "@/components/admin/DataTable";
import ConfirmModal from "@/components/admin/ConfirmModal";
import { useToast } from "@/components/admin/Toast";
import { Plus, Search, Pencil, Trash2 } from "lucide-react";

export default function ProductsPage() {
  const router = useRouter();
  const { showToast } = useToast();

  const [products, setProducts] = useState<BackendProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("ALL");
  const [sortKey, setSortKey] = useState("createdAt");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const [deleteTarget, setDeleteTarget] = useState<BackendProduct | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "10",
        sort: sortKey,
      });
      if (category !== "ALL") params.set("category", category);
      if (search) params.set("search", search);

      const res = await api.get<PaginatedResponse<BackendProduct>>(
        `/api/products?${params.toString()}`
      );
      if (res.success && res.data) {
        setProducts(res.data);
        if (res.pagination) setTotalPages(res.pagination.pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, sortKey, category, search]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPage(1);
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api.delete<ApiResponse<null>>(
        `/api/products/${deleteTarget.id}`
      );
      if (res.success) {
        showToast("Product deleted successfully", "success");
        fetchProducts();
      } else {
        showToast(res.error || "Failed to delete", "error");
      }
    } catch {
      showToast("Failed to delete product", "error");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  const columns: Column<BackendProduct>[] = [
    {
      key: "image",
      label: "Image",
      render: (row) =>
        row.image ? (
          <Image
            src={row.image}
            alt={row.nameEn}
            width={40}
            height={40}
            className="rounded object-cover"
          />
        ) : (
          <div className="w-10 h-10 rounded bg-white/5" />
        ),
    },
    { key: "nameEn", label: "Name", sortable: true },
    { key: "nameAr", label: "Name (AR)" },
    {
      key: "category",
      label: "Category",
      render: (row) => (
        <span className="capitalize text-white/50">{row.category}</span>
      ),
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      render: (row) => (
        <span className="text-[#c9a84c]">{row.price.toFixed(2)} EGP</span>
      ),
    },
    {
      key: "stock",
      label: "Stock",
      sortable: true,
      render: (row) => (
        <span
          className={
            row.stock === 0
              ? "text-red-400"
              : row.stock < 10
              ? "text-amber-400"
              : "text-emerald-400"
          }
        >
          {row.stock}
        </span>
      ),
    },
    {
      key: "actions",
      label: "Actions",
      render: (row) => (
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/products/${row.id}/edit`);
            }}
            className="p-1.5 rounded-md hover:bg-white/5 text-white/40 hover:text-[#c9a84c] transition-colors"
          >
            <Pencil size={15} />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setDeleteTarget(row);
            }}
            className="p-1.5 rounded-md hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
          >
            <Trash2 size={15} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-[#f5f0e8]">Products</h1>
        <Link
          href="/admin/products/new"
          className="flex items-center gap-2 bg-[#c9a84c] hover:bg-[#b8993f] text-[#0a0a0a] font-semibold px-4 py-2.5 rounded-lg transition-colors text-sm"
        >
          <Plus size={18} />
          Add Product
        </Link>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search
            size={16}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or brand..."
            className="w-full bg-white/5 border border-white/10 rounded-lg pl-9 pr-4 py-2.5 text-sm text-[#f5f0e8] placeholder-white/20 focus:outline-none focus:border-[#c9a84c]/50 transition-colors"
          />
        </div>
        <select
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setPage(1);
          }}
          className="bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-[#f5f0e8] focus:outline-none focus:border-[#c9a84c]/50 transition-colors"
        >
          <option value="ALL">All Categories</option>
          <option value="men">Men</option>
          <option value="women">Women</option>
          <option value="unisex">Unisex</option>
        </select>
      </div>

      <DataTable
        columns={columns}
        data={products}
        loading={loading}
        onSort={handleSort}
        sortKey={sortKey}
        sortDir={sortDir}
        emptyMessage="No products found"
      />

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-white/30">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg bg-white/5 text-white/50 hover:text-white/80 hover:bg-white/10 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}

      <ConfirmModal
        isOpen={!!deleteTarget}
        title="Delete Product"
        message={`Are you sure you want to delete "${deleteTarget?.nameEn}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
