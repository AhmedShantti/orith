"use client";

import { api } from "@/lib/api";
import React, { useCallback, useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Emblem from "@/components/Emblem";
import { useLang } from "@/context/LanguageContext";
import { dict } from "../../dict";
import { formatPiastres } from "@/lib/checkout/calculations";
import { METRO_GOVERNORATES } from "@/lib/checkout/constants";
import type { ApiResponse, Order, OrderItem } from "@/types";

// Section labels kept local (bilingual) so we don't bloat the shared dict.
const LBL = {
  en: {
    back: "← Back to Orders",
    summary: "Order Summary",
    customer: "Customer",
    products: "Products",
    shipping: "Shipping",
    actions: "Actions",
    orderId: "Order",
    status: "Status",
    paymentStatus: "Payment",
    paymentMethod: "Method",
    total: "Total",
    createdAt: "Created",
    name: "Name",
    email: "Email",
    phone: "Phone",
    address: "Address",
    itemsCount: "Total items",
    subtotal: "Subtotal",
    discount: "Discount",
    shippingFee: "Shipping",
    finalTotal: "Final total",
    estDelivery: "Estimated delivery",
    governorate: "Governorate",
    unitPrice: "Unit price",
    lineTotal: "Subtotal",
    qty: "Qty",
    product: "Product",
    notFound: "Order not found, or you don't have access to it.",
    markProcessing: "Mark as Processing",
    markShipped: "Mark as Shipped",
    markDelivered: "Mark as Delivered",
    cancel: "Cancel Order",
    refund: "Refund Order",
    confirmTitle: "Are you sure?",
    confirmCancel: "This will cancel the order. This cannot be undone.",
    confirmRefund: "This will mark the order as refunded. This cannot be undone.",
    confirmYes: "Yes, continue",
    confirmNo: "Keep order",
    saving: "Saving…",
    days23: "2–3 business days",
    days47: "4–7 business days",
  },
  ar: {
    back: "← العودة إلى الطلبات",
    summary: "ملخص الطلب",
    customer: "العميل",
    products: "المنتجات",
    shipping: "الشحن",
    actions: "الإجراءات",
    orderId: "الطلب",
    status: "الحالة",
    paymentStatus: "الدفع",
    paymentMethod: "الطريقة",
    total: "الإجمالي",
    createdAt: "تاريخ الإنشاء",
    name: "الاسم",
    email: "البريد",
    phone: "الهاتف",
    address: "العنوان",
    itemsCount: "إجمالي القطع",
    subtotal: "المجموع الفرعي",
    discount: "الخصم",
    shippingFee: "الشحن",
    finalTotal: "الإجمالي النهائي",
    estDelivery: "التوصيل المتوقع",
    governorate: "المحافظة",
    unitPrice: "سعر الوحدة",
    lineTotal: "المجموع",
    qty: "الكمية",
    product: "المنتج",
    notFound: "الطلب غير موجود أو لا تملك صلاحية الوصول إليه.",
    markProcessing: "وضع قيد المعالجة",
    markShipped: "وضع تم الشحن",
    markDelivered: "وضع تم التوصيل",
    cancel: "إلغاء الطلب",
    refund: "استرداد الطلب",
    confirmTitle: "هل أنت متأكد؟",
    confirmCancel: "سيتم إلغاء الطلب. لا يمكن التراجع.",
    confirmRefund: "سيتم تعليم الطلب كمسترد. لا يمكن التراجع.",
    confirmYes: "نعم، متابعة",
    confirmNo: "إبقاء الطلب",
    saving: "جارٍ الحفظ…",
    days23: "٢–٣ أيام عمل",
    days47: "٤–٧ أيام عمل",
  },
};

const statusStyle: Record<string, string> = {
  PENDING: "text-obsidian/50 border-obsidian/20 bg-obsidian/5",
  PENDING_PAYMENT: "text-amber-700 border-amber-700/30 bg-amber-50",
  AWAITING_CONFIRMATION: "text-sky-700 border-sky-700/30 bg-sky-50",
  PROCESSING: "text-emerald-700 border-emerald-700/30 bg-emerald-50",
  SHIPPED: "text-indigo-700 border-indigo-700/30 bg-indigo-50",
  DELIVERED: "text-crimson border-crimson/30 bg-crimson/5",
  CANCELLED: "text-obsidian/40 border-obsidian/20 bg-obsidian/5",
  REFUNDED: "text-orange-700 border-orange-700/30 bg-orange-50",
  PAYMENT_FAILED: "text-red-700 border-red-700/30 bg-red-50",
};
const paymentStyle: Record<string, string> = {
  PAID: "text-emerald-700 border-emerald-700/30 bg-emerald-50",
  UNPAID: "text-amber-700 border-amber-700/30 bg-amber-50",
  FAILED: "text-red-700 border-red-700/30 bg-red-50",
  REFUNDED: "text-orange-700 border-orange-700/30 bg-orange-50",
  PARTIALLY_REFUNDED: "text-orange-700 border-orange-700/30 bg-orange-50",
};

function Badge({ value, styles }: { value: string; styles: Record<string, string> }) {
  return (
    <span
      className={`inline-block eyebrow text-[9px] px-2.5 py-1 border ${
        styles[value] ?? "text-obsidian/50 border-obsidian/20 bg-obsidian/5"
      }`}
    >
      {value}
    </span>
  );
}

export default function OrderDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = String(params.orderId);
  const { lang } = useLang();
  const d = dict[lang];
  const L = LBL[lang];

  const [order, setOrder] = useState<Order | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "error">("loading");
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState<{ msg: string; run: () => void } | null>(
    null
  );

  const load = useCallback(async () => {
    const res = await api.get<ApiResponse<Order>>(`/api/orders/${orderId}`);
    if (res.success && res.data) {
      setOrder(res.data);
      setState("ready");
    } else {
      setState("error");
    }
  }, [orderId]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        await load();
      } catch (e) {
        console.error("[order-details] load failed:", e);
        if (!cancelled) setState("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  const apply = useCallback(
    async (body: Record<string, unknown>) => {
      setSaving(true);
      try {
        await api.put<ApiResponse<Order>>(`/api/orders/${orderId}`, body);
        await load();
      } catch (e) {
        console.error("[order-details] update failed:", e);
      } finally {
        setSaving(false);
        setConfirm(null);
      }
    },
    [orderId, load]
  );

  const statusLabel = (s: string) => d.status[s as keyof typeof d.status] ?? s;
  const paymentMethodLabel = (m: string | null | undefined) =>
    m ? d.payment[m as keyof typeof d.payment] ?? m : "—";

  // ---- Loading skeleton ----
  if (state === "loading") {
    return (
      <div className="page-transition px-6 lg:px-12 py-10 lg:py-14">
        <div className="h-4 w-32 bg-obsidian/[0.06] animate-pulse mb-8" />
        <div className="h-10 w-64 bg-obsidian/[0.06] animate-pulse mb-10" />
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="h-40 bg-obsidian/[0.06] animate-pulse" />
            <div className="h-64 bg-obsidian/[0.06] animate-pulse" />
          </div>
          <div className="space-y-6">
            <div className="h-48 bg-obsidian/[0.06] animate-pulse" />
            <div className="h-40 bg-obsidian/[0.06] animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  // ---- Error state ----
  if (state === "error" || !order) {
    return (
      <div className="page-transition px-6 lg:px-12 py-20 flex flex-col items-center justify-center text-center gap-5">
        <Emblem size={40} className="text-obsidian/20" />
        <p className="display text-2xl text-obsidian/50">{L.notFound}</p>
        <Link href="/dashboard/orders" className="btn-crimson text-[10px]">
          {L.back}
        </Link>
      </div>
    );
  }

  const items: OrderItem[] = order.items ?? [];
  const itemsCount = items.reduce((s, i) => s + i.quantity, 0);
  const fullName =
    `${order.customerFirstName ?? ""} ${order.customerLastName ?? ""}`.trim() ||
    order.user?.name ||
    "—";
  const addressLines = [
    order.shippingAddress1,
    order.shippingAddress2,
    [order.shippingCity, order.shippingGovernorate].filter(Boolean).join(", "),
    order.shippingPostalCode,
  ].filter(Boolean) as string[];
  const isMetro =
    !!order.shippingGovernorate &&
    METRO_GOVERNORATES.includes(order.shippingGovernorate);
  const estDelivery = isMetro ? L.days23 : L.days47;

  // Available admin actions based on the current state.
  const canRefund = order.paymentStatus === "PAID";
  const terminal = ["DELIVERED", "CANCELLED", "REFUNDED"].includes(order.status);

  return (
    <div className="page-transition px-6 lg:px-12 py-10 lg:py-14">
      <Link
        href="/dashboard/orders"
        className="eyebrow text-[10px] text-obsidian/50 hover:text-crimson transition-colors"
      >
        {L.back}
      </Link>

      {/* Header */}
      <div className="border-b border-obsidian/12 pb-8 mt-6 mb-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="eyebrow text-crimson mb-3">{d.orders.title}</p>
          <h1 className="display text-4xl sm:text-5xl text-obsidian" style={{ fontWeight: 600 }}>
            {order.orderNumber ?? `#${order.id.slice(0, 8)}`}
          </h1>
        </div>
        <div className="flex gap-2">
          <Badge value={statusLabel(order.status)} styles={statusStyle} />
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6 items-start">
        {/* Left: summary + products */}
        <div className="lg:col-span-2 space-y-6">
          {/* Summary card */}
          <div className="border border-obsidian/10 bg-ivory p-6">
            <p className="eyebrow text-[9px] text-obsidian/40 mb-5">{L.summary}</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
              <Info label={L.orderId} value={order.orderNumber ?? order.id.slice(0, 8)} />
              <Info label={L.createdAt} value={new Date(order.createdAt).toLocaleString()} />
              <Info label={L.paymentMethod} value={paymentMethodLabel(order.paymentMethod)} />
              <div>
                <p className="eyebrow text-[8px] text-obsidian/40 mb-1.5">{L.status}</p>
                <Badge value={statusLabel(order.status)} styles={statusStyle} />
              </div>
              <div>
                <p className="eyebrow text-[8px] text-obsidian/40 mb-1.5">{L.paymentStatus}</p>
                <Badge value={order.paymentStatus ?? "—"} styles={paymentStyle} />
              </div>
              <div>
                <p className="eyebrow text-[8px] text-obsidian/40 mb-1.5">{L.total}</p>
                <p className="display text-lg text-obsidian" style={{ fontWeight: 500 }}>
                  {formatPiastres(order.totalAmount ?? 0)}
                </p>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="border border-obsidian/10 bg-ivory">
            <div className="px-6 py-4 border-b border-obsidian/10 flex items-center justify-between">
              <p className="eyebrow text-[9px] text-obsidian/40">{L.products}</p>
              <p className="eyebrow text-[9px] text-obsidian/40">
                {L.itemsCount}: {itemsCount}
              </p>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[560px]">
                <thead>
                  <tr className="bg-obsidian/[0.03] border-b border-obsidian/10">
                    {[L.product, L.qty, L.unitPrice, L.lineTotal].map((h) => (
                      <th key={h} className="eyebrow text-[9px] text-obsidian/40 text-start px-6 py-3 font-normal">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((it) => {
                    const unit = it.unitPrice ?? 0;
                    const line = it.totalPrice ?? unit * it.quantity;
                    return (
                      <tr key={it.id} className="border-b border-obsidian/8">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="relative w-10 h-12 shrink-0 bg-beige/60 overflow-hidden">
                              {it.imageUrl && (
                                <Image
                                  src={it.imageUrl}
                                  alt={it.productName ?? "item"}
                                  fill
                                  sizes="40px"
                                  className="object-contain"
                                  unoptimized={it.imageUrl.startsWith("/products/upload-")}
                                />
                              )}
                            </div>
                            <div>
                              <p className="product-name text-base text-obsidian leading-tight">
                                {it.productName ?? "—"}
                              </p>
                              {it.variantName && (
                                <p className="font-body text-[10px] text-obsidian/40 mt-0.5">
                                  {it.variantName}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-body text-sm text-obsidian/60">{it.quantity}</td>
                        <td className="px-6 py-4 font-body text-sm text-obsidian/60 whitespace-nowrap">
                          {formatPiastres(unit)}
                        </td>
                        <td className="px-6 py-4 display text-base text-obsidian whitespace-nowrap">
                          {formatPiastres(line)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Totals */}
            <div className="px-6 py-5 border-t border-obsidian/10 space-y-2 max-w-xs ms-auto">
              <Row label={L.subtotal} value={formatPiastres(order.subtotal ?? 0)} />
              {!!order.discountAmount && (
                <Row label={L.discount} value={`−${formatPiastres(order.discountAmount)}`} accent />
              )}
              <Row
                label={L.shippingFee}
                value={order.shippingFee === 0 ? "FREE" : formatPiastres(order.shippingFee ?? 0)}
              />
              <div className="h-px bg-obsidian/10 my-2" />
              <div className="flex justify-between items-baseline">
                <span className="eyebrow text-[10px] text-obsidian">{L.finalTotal}</span>
                <span className="display text-xl text-obsidian" style={{ fontWeight: 500 }}>
                  {formatPiastres(order.totalAmount ?? 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: customer + shipping + actions */}
        <div className="space-y-6">
          {/* Customer */}
          <div className="border border-obsidian/10 bg-ivory p-6">
            <p className="eyebrow text-[9px] text-obsidian/40 mb-5">{L.customer}</p>
            <div className="space-y-3">
              <Info label={L.name} value={fullName} />
              <Info label={L.email} value={order.customerEmail ?? order.user?.email ?? "—"} />
              <Info label={L.phone} value={order.customerPhone ?? "—"} />
              <div>
                <p className="eyebrow text-[8px] text-obsidian/40 mb-1.5">{L.address}</p>
                {addressLines.length ? (
                  addressLines.map((l, i) => (
                    <p key={i} className="font-body text-sm text-obsidian/75">{l}</p>
                  ))
                ) : (
                  <p className="font-body text-sm text-obsidian/40">—</p>
                )}
                {order.notes && (
                  <p className="font-body text-xs text-obsidian/45 mt-2">“{order.notes}”</p>
                )}
              </div>
            </div>
          </div>

          {/* Shipping */}
          <div className="border border-obsidian/10 bg-ivory p-6">
            <p className="eyebrow text-[9px] text-obsidian/40 mb-5">{L.shipping}</p>
            <div className="space-y-3">
              <Info label={L.governorate} value={order.shippingGovernorate ?? "—"} />
              <Info label={L.estDelivery} value={estDelivery} />
            </div>
          </div>

          {/* Actions */}
          <div className="border border-obsidian/10 bg-ivory p-6">
            <p className="eyebrow text-[9px] text-obsidian/40 mb-5">{L.actions}</p>
            <div className="flex flex-col gap-3">
              {!terminal && (
                <>
                  <ActionButton disabled={saving || order.status === "PROCESSING"} onClick={() => apply({ status: "PROCESSING" })}>
                    {L.markProcessing}
                  </ActionButton>
                  <ActionButton disabled={saving || order.status === "SHIPPED"} onClick={() => apply({ status: "SHIPPED" })}>
                    {L.markShipped}
                  </ActionButton>
                  <ActionButton disabled={saving} onClick={() => apply({ status: "DELIVERED" })}>
                    {L.markDelivered}
                  </ActionButton>
                  <ActionButton
                    disabled={saving}
                    variant="danger"
                    onClick={() => setConfirm({ msg: L.confirmCancel, run: () => apply({ status: "CANCELLED" }) })}
                  >
                    {L.cancel}
                  </ActionButton>
                </>
              )}
              {canRefund && (
                <ActionButton
                  disabled={saving}
                  variant="danger"
                  onClick={() =>
                    setConfirm({
                      msg: L.confirmRefund,
                      run: () => apply({ status: "REFUNDED", paymentStatus: "REFUNDED" }),
                    })
                  }
                >
                  {L.refund}
                </ActionButton>
              )}
              {terminal && !canRefund && (
                <p className="font-body text-xs text-obsidian/40">—</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation modal */}
      {confirm && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-obsidian/50" onClick={() => !saving && setConfirm(null)} />
          <div className="relative bg-ivory border border-obsidian/15 max-w-sm w-full p-7">
            <h3 className="display text-2xl text-obsidian mb-3" style={{ fontWeight: 500 }}>
              {L.confirmTitle}
            </h3>
            <p className="font-body text-sm text-obsidian/60 mb-7">{confirm.msg}</p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirm(null)}
                disabled={saving}
                className="btn-ghost text-obsidian text-[10px] disabled:opacity-50"
              >
                {L.confirmNo}
              </button>
              <button
                onClick={confirm.run}
                disabled={saving}
                className="btn-crimson text-[10px] disabled:opacity-50"
              >
                {saving ? L.saving : L.confirmYes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="eyebrow text-[8px] text-obsidian/40 mb-1.5">{label}</p>
      <p className="font-body text-sm text-obsidian/80 break-words">{value}</p>
    </div>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className={`flex justify-between text-sm font-body ${accent ? "text-emerald-700" : "text-obsidian/70"}`}>
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function ActionButton({
  children,
  onClick,
  disabled,
  variant = "default",
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
  variant?: "default" | "danger";
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`eyebrow text-[10px] px-4 py-3 border text-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed ${
        variant === "danger"
          ? "border-crimson/40 text-crimson hover:bg-crimson hover:text-ivory"
          : "border-obsidian/20 text-obsidian hover:border-crimson hover:text-crimson"
      }`}
    >
      {children}
    </button>
  );
}
