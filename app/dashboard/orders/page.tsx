"use client";
import { api } from "@/lib/api";
import React, { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Emblem from "@/components/Emblem";
import { useLang } from "@/context/LanguageContext";
import { dict } from "../dict";
import { SalesIcon, ReceiptIcon, UnitsIcon, ChartIcon } from "../icons";
import type { ApiResponse } from "@/types";

interface OrderRow {
  id: string;
  orderNumber: string | null;
  customerName: string;
  productName: string;
  size: string;
  quantity: number;
  total: number;
  status: string;
  paymentMethod: string | null;
  paymentStatus: string | null;
  createdAt: string;
}

interface OrdersResponse {
  orderCount: number;
  revenue: number;
  unitsSold: number;
  avgOrderValue: number;
  orders: OrderRow[];
}

const fmt = (n: number) => n.toLocaleString();

// Statuses an admin can set (matches the OrderStatus enum).
const STATUSES = [
  "PENDING_PAYMENT",
  "AWAITING_CONFIRMATION",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
  "PAYMENT_FAILED",
] as const;

const statusStyle: Record<string, string> = {
  PENDING: "text-obsidian/50 border-obsidian/20",
  PENDING_PAYMENT: "text-amber-700 border-amber-700/30",
  AWAITING_CONFIRMATION: "text-sky-700 border-sky-700/30",
  PROCESSING: "text-emerald-700 border-emerald-700/30",
  SHIPPED: "text-sky-700 border-sky-700/30",
  DELIVERED: "text-crimson border-crimson/30",
  CANCELLED: "text-obsidian/40 border-obsidian/20",
  REFUNDED: "text-orange-700 border-orange-700/30",
  PAYMENT_FAILED: "text-red-700 border-red-700/30",
};

export default function OrdersPage() {
  const { lang } = useLang();
  const d = dict[lang];
  const router = useRouter();

  const [data, setData] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await api.get<OrdersResponse>("/api/orders");
    setData(res);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await api.get<OrdersResponse>("/api/orders");
        if (!cancelled) setData(res);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    setSavingId(id);
    try {
      await api.put<ApiResponse<unknown>>(`/api/orders/${id}`, {
        status: newStatus,
      });
      await load();
    } finally {
      setSavingId(null);
    }
  };

  const statusLabel = (s: string) =>
    d.status[s as keyof typeof d.status] ?? s;
  const paymentLabel = (m: string | null) =>
    m ? d.payment[m as keyof typeof d.payment] ?? m : "—";

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <Emblem size={40} className="text-crimson animate-pulse" />
        <p className="eyebrow text-[10px] text-obsidian/40">{d.loading}</p>
      </div>
    );
  }

  const summary = [
    { label: d.kpi.totalSales, value: fmt(data?.revenue ?? 0), suffix: d.egp, Icon: SalesIcon },
    { label: d.kpi.orders, value: fmt(data?.orderCount ?? 0), suffix: "", Icon: ReceiptIcon },
    { label: d.kpi.unitsSold, value: fmt(data?.unitsSold ?? 0), suffix: "", Icon: UnitsIcon },
    { label: d.kpi.avgOrderValue, value: fmt(data?.avgOrderValue ?? 0), suffix: d.egp, Icon: ChartIcon },
  ];

  return (
    <div className="page-transition px-6 lg:px-12 py-10 lg:py-14">
      {/* Header */}
      <div className="border-b border-obsidian/12 pb-8 mb-12">
        <p className="eyebrow text-crimson mb-4">{d.administration}</p>
        <h1
          className="display text-4xl sm:text-5xl lg:text-6xl text-obsidian"
          style={{ fontWeight: 600 }}
        >
          {d.orders.title}
        </h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-obsidian/10 border border-obsidian/10 mb-14">
        {summary.map((k) => (
          <div key={k.label} className="bg-ivory p-6 lg:p-7 flex flex-col gap-3">
            <div className="flex items-center justify-between text-obsidian/40">
              <p className="eyebrow text-[9px]">{k.label}</p>
              <k.Icon size={16} className="text-crimson/60 shrink-0" />
            </div>
            <p
              className="display text-2xl lg:text-3xl text-obsidian"
              style={{ fontWeight: 500 }}
            >
              {k.value}
              {k.suffix && (
                <span className="font-body text-[10px] text-obsidian/40 ms-1.5 tracking-widest">
                  {k.suffix}
                </span>
              )}
            </p>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <p className="eyebrow text-crimson mb-6">
        {d.orders.allOrders} — {String(data?.orderCount ?? 0).padStart(2, "0")}
      </p>

      {(data?.orders.length ?? 0) === 0 ? (
        <div className="border border-obsidian/10 text-center py-16 flex flex-col items-center gap-4">
          <Emblem size={32} className="text-obsidian/20" />
          <p className="display text-xl text-obsidian/40">{d.orders.noOrders}</p>
        </div>
      ) : (
        <div className="border border-obsidian/10 overflow-x-auto">
          <table className="w-full min-w-[880px]">
            <thead>
              <tr className="bg-obsidian/[0.03] border-b border-obsidian/10">
                {[
                  d.table.order,
                  d.table.customer,
                  d.table.product,
                  d.table.qty,
                  d.table.payment,
                  d.table.total,
                  d.table.status,
                ].map((h, i) => (
                  <th
                    key={i}
                    className="eyebrow text-[9px] text-obsidian/40 text-start px-5 py-4 font-normal"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data?.orders.map((o) => (
                <tr
                  key={o.id}
                  onClick={() => router.push(`/dashboard/orders/${o.id}`)}
                  className="border-b border-obsidian/8 hover:bg-crimson/[0.03] transition-colors cursor-pointer"
                >
                  <td className="px-5 py-4">
                    <p className="font-body text-xs text-obsidian">
                      {o.orderNumber ?? o.id.slice(0, 8)}
                    </p>
                    <p className="font-body text-[10px] text-obsidian/35 mt-0.5">
                      {o.createdAt.slice(0, 10)}
                    </p>
                  </td>
                  <td className="px-5 py-4 font-body text-sm text-obsidian">
                    {o.customerName}
                  </td>
                  <td className="px-5 py-4">
                    <span className="product-name text-base text-obsidian">
                      {o.productName}
                    </span>
                    {o.size && (
                      <span className="block font-body text-[10px] text-obsidian/40 mt-0.5">
                        {o.size}
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 font-body text-sm text-obsidian/60">
                    {o.quantity}
                  </td>
                  <td className="px-5 py-4 font-body text-xs text-obsidian/60">
                    {paymentLabel(o.paymentMethod)}
                  </td>
                  <td className="px-5 py-4 display text-base text-obsidian whitespace-nowrap">
                    {fmt(o.total)}
                    <span className="font-body text-[10px] text-obsidian/40 ms-1">
                      {d.egp}
                    </span>
                  </td>
                  <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                    <select
                      value={o.status}
                      disabled={savingId === o.id}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className={`eyebrow text-[8px] px-2 py-1.5 border bg-transparent cursor-pointer focus:outline-none disabled:opacity-50 ${
                        statusStyle[o.status] ?? "text-obsidian/50 border-obsidian/20"
                      }`}
                    >
                      {/* Ensure the current status is selectable even if legacy */}
                      {!STATUSES.includes(o.status as (typeof STATUSES)[number]) && (
                        <option value={o.status} className="text-obsidian">
                          {statusLabel(o.status)}
                        </option>
                      )}
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="text-obsidian">
                          {statusLabel(s)}
                        </option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
