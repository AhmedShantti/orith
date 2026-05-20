"use client";

import { useEffect, useState, useCallback } from "react";
import { api } from "@/lib/api";
import { ApiResponse, PaginatedResponse } from "@/types";
import ConfirmModal from "@/components/admin/ConfirmModal";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import { useToast } from "@/components/admin/Toast";
import { Trash2, Star } from "lucide-react";

interface ReviewRow {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: { name: string; email: string } | null;
  product: { nameEn: string; image: string } | null;
}

const ratingFilters = [
  { label: "All", value: "" },
  { label: "5 Stars", value: "5" },
  { label: "4 Stars", value: "4" },
  { label: "3 Stars", value: "3" },
  { label: "2 Stars", value: "2" },
  { label: "1 Star", value: "1" },
];

export default function ReviewsPage() {
  const { showToast } = useToast();

  const [reviews, setReviews] = useState<ReviewRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [ratingFilter, setRatingFilter] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<ReviewRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
      });
      if (ratingFilter) params.set("rating", ratingFilter);

      const res = await api.get<PaginatedResponse<ReviewRow>>(
        `/api/admin/reviews?${params.toString()}`
      );
      if (res.success && res.data) {
        setReviews(res.data);
        if (res.pagination) setTotalPages(res.pagination.pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, ratingFilter]);

  useEffect(() => {
    fetchReviews();
  }, [fetchReviews]);

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const res = await api.delete<ApiResponse<null>>(
        `/api/admin/reviews/${deleteTarget.id}`
      );
      if (res.success) {
        showToast("Review deleted successfully", "success");
        fetchReviews();
      } else {
        showToast(res.error || "Failed to delete", "error");
      }
    } catch {
      showToast("Failed to delete review", "error");
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  }

  function renderStars(rating: number) {
    return (
      <div className="flex items-center gap-0.5">
        {Array.from({ length: 5 }).map((_, i) => (
          <Star
            key={i}
            size={14}
            className={
              i < rating
                ? "fill-amber-400 text-amber-400"
                : "text-white/10"
            }
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#f5f0e8]">Reviews</h1>

      <div className="flex gap-2 flex-wrap">
        {ratingFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => {
              setRatingFilter(filter.value);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              ratingFilter === filter.value
                ? "bg-[#c9a84c]/15 text-[#c9a84c] border border-[#c9a84c]/30"
                : "bg-white/5 text-white/40 border border-white/5 hover:text-white/60 hover:bg-white/10"
            }`}
          >
            {filter.label}
          </button>
        ))}
      </div>

      {loading ? (
        <LoadingSkeleton type="table" rows={10} columns={6} />
      ) : reviews.length === 0 ? (
        <div className="bg-[#111111] border border-white/5 rounded-xl p-12 text-center">
          <p className="text-white/30 text-sm">No reviews found</p>
        </div>
      ) : (
        <div className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-3">
                    Product
                  </th>
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-3">
                    Customer
                  </th>
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-3">
                    Rating
                  </th>
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-3">
                    Comment
                  </th>
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-3">
                    Date
                  </th>
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-3">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((review) => (
                  <tr
                    key={review.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3 text-sm text-[#f5f0e8]/80">
                      {review.product?.nameEn || "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-white/50">
                      {review.user?.name || "—"}
                    </td>
                    <td className="px-5 py-3">
                      {renderStars(review.rating)}
                    </td>
                    <td className="px-5 py-3 text-sm text-white/50 max-w-xs truncate">
                      {review.comment}
                    </td>
                    <td className="px-5 py-3 text-sm text-white/30">
                      {new Date(review.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setDeleteTarget(review)}
                        className="p-1.5 rounded-md hover:bg-red-500/10 text-white/40 hover:text-red-400 transition-colors"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

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
        title="Delete Review"
        message={`Are you sure you want to delete this review by "${deleteTarget?.user?.name || "unknown"}"? This action cannot be undone.`}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
        loading={deleting}
      />
    </div>
  );
}
