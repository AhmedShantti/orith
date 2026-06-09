"use client";

import { OrderStatus } from "@/types";

const statusConfig: Record<
  OrderStatus,
  { bg: string; text: string; dot: string }
> = {
  PENDING: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  PROCESSING: {
    bg: "bg-blue-500/10",
    text: "text-blue-400",
    dot: "bg-blue-400",
  },
  SHIPPED: {
    bg: "bg-purple-500/10",
    text: "text-purple-400",
    dot: "bg-purple-400",
  },
  DELIVERED: {
    bg: "bg-emerald-500/10",
    text: "text-emerald-400",
    dot: "bg-emerald-400",
  },
  PENDING_PAYMENT: {
    bg: "bg-amber-500/10",
    text: "text-amber-400",
    dot: "bg-amber-400",
  },
  AWAITING_CONFIRMATION: {
    bg: "bg-sky-500/10",
    text: "text-sky-400",
    dot: "bg-sky-400",
  },
  CANCELLED: {
    bg: "bg-white/5",
    text: "text-white/40",
    dot: "bg-white/40",
  },
  REFUNDED: {
    bg: "bg-orange-500/10",
    text: "text-orange-400",
    dot: "bg-orange-400",
  },
  PAYMENT_FAILED: {
    bg: "bg-red-500/10",
    text: "text-red-400",
    dot: "bg-red-400",
  },
};

function prettify(status: OrderStatus): string {
  return status
    .toLowerCase()
    .split("_")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = statusConfig[status];
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {prettify(status)}
    </span>
  );
}
