"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { api } from "@/lib/api";
import { ApiResponse, Order, OrderStatus } from "@/types";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import { useToast } from "@/components/admin/Toast";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const statusFlow: OrderStatus[] = [
  "PENDING",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
];

export default function OrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { showToast } = useToast();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [newStatus, setNewStatus] = useState<OrderStatus>("PENDING");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    api
      .get<ApiResponse<Order>>(`/api/orders/${params.id}`)
      .then((res) => {
        if (res.success && res.data) {
          setOrder(res.data);
          setNewStatus(res.data.status);
        } else {
          showToast("Order not found", "error");
          router.push("/admin/orders");
        }
      })
      .catch(() => {
        showToast("Failed to load order", "error");
        router.push("/admin/orders");
      })
      .finally(() => setLoading(false));
  }, [params.id, router, showToast]);

  async function handleUpdateStatus() {
    if (!order || newStatus === order.status) return;
    setUpdating(true);
    try {
      const res = await api.put<ApiResponse<Order>>(
        `/api/orders/${params.id}`,
        { status: newStatus }
      );
      if (res.success && res.data) {
        setOrder(res.data);
        showToast("Order status updated!", "success");
      } else {
        showToast(res.error || "Failed to update status", "error");
      }
    } catch {
      showToast("Failed to update status", "error");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <div className="w-8 h-8 bg-white/5 rounded-lg animate-pulse" />
          <div className="h-8 w-48 bg-white/5 rounded animate-pulse" />
        </div>
        <LoadingSkeleton type="table" rows={4} columns={5} />
      </div>
    );
  }

  if (!order) return null;

  const itemsSubtotal =
    order.items?.reduce((sum, item) => sum + item.price * item.quantity, 0) || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link
          href="/admin/orders"
          className="p-2 rounded-lg hover:bg-white/5 text-white/40 hover:text-white/70 transition-colors"
        >
          <ArrowLeft size={20} />
        </Link>
        <h1 className="text-2xl font-bold text-[#f5f0e8]">
          Order #{order.id.slice(0, 8)}
        </h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Info */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[#f5f0e8] mb-4">
              Order Summary
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p className="text-white/30 mb-1">Order ID</p>
                <p className="text-[#f5f0e8]/80 font-mono text-xs">
                  {order.id}
                </p>
              </div>
              <div>
                <p className="text-white/30 mb-1">Date</p>
                <p className="text-[#f5f0e8]/80">
                  {new Date(order.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-white/30 mb-1">Total</p>
                <p className="text-[#c9a84c] font-semibold">
                  {order.total.toFixed(2)} EGP
                </p>
              </div>
              <div>
                <p className="text-white/30 mb-1">Status</p>
                <OrderStatusBadge status={order.status} />
              </div>
            </div>
          </div>

          {/* Items */}
          <div className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden">
            <div className="px-5 py-4 border-b border-white/5">
              <h2 className="text-sm font-semibold text-[#f5f0e8]">
                Items ({order.items?.length || 0})
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-white/5">
                    <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-2.5">
                      Product
                    </th>
                    <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-2.5">
                      Qty
                    </th>
                    <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-2.5">
                      Unit Price
                    </th>
                    <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-2.5">
                      Subtotal
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {order.items?.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-white/5"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          {item.product?.image && (
                            <Image
                              src={item.product.image}
                              alt={item.product.nameEn}
                              width={36}
                              height={36}
                              className="rounded object-cover"
                            />
                          )}
                          <div>
                            <p className="text-sm text-[#f5f0e8]/80">
                              {item.product?.nameEn || "—"}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-sm text-white/50">
                        {item.quantity}
                      </td>
                      <td className="px-5 py-3 text-sm text-white/50">
                        {item.price.toFixed(2)} EGP
                      </td>
                      <td className="px-5 py-3 text-sm text-[#f5f0e8]/80">
                        {(item.price * item.quantity).toFixed(2)} EGP
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-3 text-sm font-semibold text-[#f5f0e8] text-right"
                    >
                      Total
                    </td>
                    <td className="px-5 py-3 text-sm font-semibold text-[#c9a84c]">
                      {itemsSubtotal.toFixed(2)} EGP
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[#f5f0e8] mb-4">
              Customer
            </h2>
            {order.user && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#c9a84c]/20 flex items-center justify-center text-[#c9a84c] text-sm font-bold">
                  {order.user.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm text-[#f5f0e8]/80">
                    {order.user.name}
                  </p>
                  <p className="text-xs text-white/30">{order.user.email}</p>
                </div>
              </div>
            )}
          </div>

          {/* Update Status */}
          <div className="bg-[#111111] border border-white/5 rounded-xl p-5">
            <h2 className="text-sm font-semibold text-[#f5f0e8] mb-4">
              Update Status
            </h2>

            <div className="space-y-3 mb-4">
              {statusFlow.map((status) => {
                const currentIdx = statusFlow.indexOf(order.status);
                const statusIdx = statusFlow.indexOf(status);
                const isPast = statusIdx <= currentIdx;

                return (
                  <div key={status} className="flex items-center gap-3">
                    <div
                      className={`w-3 h-3 rounded-full border-2 ${
                        isPast
                          ? "bg-[#c9a84c] border-[#c9a84c]"
                          : "border-white/20"
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        isPast ? "text-[#f5f0e8]/80" : "text-white/30"
                      }`}
                    >
                      {status.charAt(0) + status.slice(1).toLowerCase()}
                    </span>
                  </div>
                );
              })}
            </div>

            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value as OrderStatus)}
              className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-sm text-[#f5f0e8] focus:outline-none focus:border-[#c9a84c]/50 mb-3"
            >
              {statusFlow.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0) + status.slice(1).toLowerCase()}
                </option>
              ))}
            </select>

            <button
              onClick={handleUpdateStatus}
              disabled={updating || newStatus === order.status}
              className="w-full bg-[#c9a84c] hover:bg-[#b8993f] text-[#0a0a0a] font-semibold py-2.5 px-4 rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2 text-sm"
            >
              {updating && (
                <div className="w-3.5 h-3.5 border-2 border-[#0a0a0a]/30 border-t-[#0a0a0a] rounded-full animate-spin" />
              )}
              {updating ? "Updating..." : "Update Status"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
