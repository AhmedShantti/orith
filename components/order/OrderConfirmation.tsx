"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import OrderStatusBadge from "./OrderStatusBadge";
import { formatPiastres } from "@/lib/checkout/calculations";
import { METRO_GOVERNORATES } from "@/lib/checkout/constants";
import type { Order } from "@/types";

function estimatedDelivery(governorate: string | null | undefined): string {
  if (governorate && METRO_GOVERNORATES.includes(governorate)) {
    return "2–3 business days";
  }
  return "4–7 business days";
}

export default function OrderConfirmation({ order }: { order: Order }) {
  const items = order.items ?? [];
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="text-center mb-10 border-b border-obsidian/12 pb-8">
        <p className="eyebrow text-crimson mb-3">Order Confirmed</p>
        <h1
          className="display text-4xl sm:text-5xl text-obsidian mb-4"
          style={{ fontWeight: 600 }}
        >
          {order.orderNumber ?? order.id}
        </h1>
        <div className="flex justify-center">
          <OrderStatusBadge status={order.status} />
        </div>
      </div>

      {/* Items */}
      <div className="mb-8">
        <h2 className="eyebrow text-obsidian/55 mb-4">Items</h2>
        <ul className="divide-y divide-obsidian/10 border-y border-obsidian/10">
          {items.map((item) => (
            <li key={item.id} className="flex items-center gap-4 py-4">
              {item.imageUrl && (
                <div className="relative w-14 h-14 shrink-0 bg-ivory border border-obsidian/10">
                  <Image
                    src={item.imageUrl}
                    alt={item.productName ?? "Item"}
                    width={56}
                    height={56}
                    quality={75}
                    className="object-cover w-full h-full"
                  />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-body text-obsidian truncate">
                  {item.productName ?? "Item"}
                </p>
                <p className="text-xs font-body text-obsidian/50 mt-0.5">
                  {item.variantName ? `${item.variantName} · ` : ""}Qty{" "}
                  {item.quantity}
                </p>
              </div>
              <span className="text-sm font-body text-obsidian whitespace-nowrap">
                {formatPiastres(
                  item.totalPrice ?? (item.unitPrice ?? 0) * item.quantity,
                  false
                )}
              </span>
            </li>
          ))}
        </ul>
      </div>

      {/* Breakdown */}
      <div className="mb-8 space-y-2.5">
        <Row label="Subtotal" value={formatPiastres(order.subtotal ?? 0)} />
        {order.discountAmount ? (
          <Row
            label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`}
            value={`−${formatPiastres(order.discountAmount)}`}
            accent
          />
        ) : null}
        <Row
          label="Shipping"
          value={
            order.shippingFee === 0
              ? "FREE"
              : formatPiastres(order.shippingFee ?? 0)
          }
        />
        <div className="hairline my-3" />
        <div className="flex justify-between items-baseline">
          <span className="text-sm uppercase tracking-wider font-body text-obsidian">
            Total
          </span>
          <span
            className="text-2xl font-light text-obsidian"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            {formatPiastres(order.totalAmount ?? 0)}
          </span>
        </div>
      </div>

      {/* Shipping + payment + delivery */}
      <div className="grid sm:grid-cols-2 gap-4 mb-10">
        <div className="bg-[#FBF8F2] border border-obsidian/12 p-5">
          <h3 className="eyebrow text-obsidian/55 mb-3">Shipping To</h3>
          <p className="text-sm font-body text-obsidian/80">
            {order.customerFirstName} {order.customerLastName}
          </p>
          <p className="text-sm font-body text-obsidian/55">
            {order.shippingAddress1}
          </p>
          {order.shippingAddress2 && (
            <p className="text-sm font-body text-obsidian/55">
              {order.shippingAddress2}
            </p>
          )}
          <p className="text-sm font-body text-obsidian/55">
            {order.shippingCity}, {order.shippingGovernorate}
            {order.shippingPostalCode ? ` ${order.shippingPostalCode}` : ""}
          </p>
        </div>
        <div className="bg-[#FBF8F2] border border-obsidian/12 p-5">
          <h3 className="eyebrow text-obsidian/55 mb-3">Payment &amp; Delivery</h3>
          <p className="text-sm font-body text-obsidian/80">
            {order.paymentMethod === "MOBILE_WALLET"
              ? "Mobile Wallet"
              : order.paymentMethod === "APPLE_PAY"
              ? "Apple Pay"
              : order.paymentMethod === "COD"
              ? "Cash on Delivery"
              : "—"}
          </p>
          {order.paymentMethod === "COD" && (
            <p className="text-sm font-body text-obsidian/55 mt-1">
              You will pay in cash when your order arrives.
            </p>
          )}
          <p className="text-sm font-body text-obsidian/55 mt-2">
            Estimated delivery: {estimatedDelivery(order.shippingGovernorate)}
          </p>
        </div>
      </div>

      <div className="text-center">
        <Link href="/products" className="btn-crimson">
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}

function Row({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`flex justify-between text-sm font-body ${
        accent ? "text-emerald-700" : "text-obsidian/70"
      }`}
    >
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
