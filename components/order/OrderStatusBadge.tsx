"use client";

import React from "react";
import type { OrderStatus } from "@/types/order";

const config: Record<OrderStatus, { label: string; className: string }> = {
  PENDING: { label: "Pending", className: "bg-obsidian/5 text-obsidian/70" },
  PENDING_PAYMENT: {
    label: "Pending Payment",
    className: "bg-amber-50 text-amber-700 border border-amber-200",
  },
  AWAITING_CONFIRMATION: {
    label: "Awaiting Confirmation",
    className: "bg-sky-50 text-sky-700 border border-sky-200",
  },
  PROCESSING: {
    label: "Processing",
    className: "bg-crimson/5 text-crimson border border-crimson/20",
  },
  SHIPPED: {
    label: "Shipped",
    className: "bg-indigo-50 text-indigo-700 border border-indigo-200",
  },
  DELIVERED: {
    label: "Delivered",
    className: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  },
  CANCELLED: {
    label: "Cancelled",
    className: "bg-obsidian/5 text-obsidian/50 border border-obsidian/15",
  },
  REFUNDED: {
    label: "Refunded",
    className: "bg-orange-50 text-orange-700 border border-orange-200",
  },
  PAYMENT_FAILED: {
    label: "Payment Failed",
    className: "bg-red-50 text-red-700 border border-red-200",
  },
};

export default function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const c = config[status] ?? config.PENDING;
  return (
    <span
      className={`inline-flex items-center px-3 py-1 text-[11px] tracking-[0.15em] uppercase font-body ${c.className}`}
    >
      {c.label}
    </span>
  );
}
