"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { Order, OrderStatus, PaginatedResponse } from "@/types";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";

const statusFilters: Array<{ label: string; value: string }> = [
  { label: "All", value: "ALL" },
  { label: "Pending", value: "PENDING" },
  { label: "Processing", value: "PROCESSING" },
  { label: "Shipped", value: "SHIPPED" },
  { label: "Delivered", value: "DELIVERED" },
];

export default function OrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "15",
      });
      if (statusFilter !== "ALL") params.set("status", statusFilter);

      const res = await api.get<PaginatedResponse<Order>>(
        `/api/admin/orders?${params.toString()}`
      );
      if (res.success && res.data) {
        setOrders(res.data);
        if (res.pagination) setTotalPages(res.pagination.pages);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [page, statusFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#f5f0e8]">Orders</h1>

      <div className="flex gap-2 flex-wrap">
        {statusFilters.map((filter) => (
          <button
            key={filter.value}
            onClick={() => {
              setStatusFilter(filter.value);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              statusFilter === filter.value
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
      ) : orders.length === 0 ? (
        <div className="bg-[#111111] border border-white/5 rounded-xl p-12 text-center">
          <p className="text-white/30 text-sm">No orders found</p>
        </div>
      ) : (
        <div className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-3">
                    Order ID
                  </th>
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-3">
                    Customer
                  </th>
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-3">
                    Items
                  </th>
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-3">
                    Total
                  </th>
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-3">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-3">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    onClick={() => router.push(`/admin/orders/${order.id}`)}
                    className="border-b border-white/5 cursor-pointer hover:bg-[#c9a84c]/5 transition-colors"
                  >
                    <td className="px-5 py-3 text-sm text-[#f5f0e8]/60 font-mono">
                      {order.id.slice(0, 8)}...
                    </td>
                    <td className="px-5 py-3 text-sm text-[#f5f0e8]/80">
                      {order.user?.name || "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-white/50">
                      {order.items?.length || 0}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#c9a84c]">
                      {order.total.toFixed(2)} EGP
                    </td>
                    <td className="px-5 py-3">
                      <OrderStatusBadge status={order.status} />
                    </td>
                    <td className="px-5 py-3 text-sm text-white/30">
                      {new Date(order.createdAt).toLocaleDateString()}
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
    </div>
  );
}
