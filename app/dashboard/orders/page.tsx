"use client";
import React, { useEffect, useMemo, useState } from "react";
import Emblem from "@/components/Emblem";
import type { Product } from "@/types";

interface Order {
  id: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  size: string;
  status: string;
  createdAt: string;
}

interface OrdersResponse {
  orderCount: number;
  revenue: number;
  unitsSold: number;
  avgOrderValue: number;
  orders: Order[];
}

const fmt = (n: number) => n.toLocaleString();
const STATUSES = ["pending", "paid", "shipped", "delivered", "cancelled"];

const statusStyle: Record<string, string> = {
  pending: "text-amber-700 border-amber-700/30",
  paid: "text-emerald-700 border-emerald-700/30",
  shipped: "text-sky-700 border-sky-700/30",
  delivered: "text-crimson border-crimson/30",
  cancelled: "text-obsidian/40 border-obsidian/20",
};

const inputCls =
  "w-full bg-transparent border-b border-obsidian/20 focus:border-crimson py-2.5 text-sm font-body text-obsidian placeholder-obsidian/30 focus:outline-none transition-colors";
const labelCls = "eyebrow text-[9px] text-obsidian/45 mb-2 block";

export default function OrdersPage() {
  const [data, setData] = useState<OrdersResponse | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // form state
  const [customerName, setCustomerName] = useState("");
  const [productId, setProductId] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState("pending");
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const selectedProduct = useMemo(
    () => products.find((p) => p.id === productId),
    [products, productId]
  );

  const estTotal = selectedProduct ? selectedProduct.price * quantity : 0;

  const load = async () => {
    const res = await fetch("/api/orders");
    const json = (await res.json()) as OrdersResponse;
    setData(json);
  };

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [o, p] = await Promise.all([
          fetch("/api/orders"),
          fetch("/api/products"),
        ]);
        const ordersData = (await o.json()) as OrdersResponse;
        const productsData = (await p.json()) as { products: Product[] };
        if (cancelled) return;
        setData(ordersData);
        setProducts(productsData.products);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // keep size valid when product changes
  useEffect(() => {
    if (selectedProduct) setSize(selectedProduct.sizes[0] ?? "");
  }, [selectedProduct]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!customerName.trim()) return setFormError("Enter a customer name");
    if (!productId) return setFormError("Choose a product");

    setSubmitting(true);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerName, productId, size, quantity, status }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error ?? "Failed to create order");
      }
      // reset form
      setCustomerName("");
      setProductId("");
      setQuantity(1);
      setStatus("pending");
      await load();
    } catch (e) {
      setFormError(e instanceof Error ? e.message : "Error");
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    await load();
  };

  const remove = async (id: string) => {
    await fetch(`/api/orders/${id}`, { method: "DELETE" });
    await load();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <Emblem size={40} className="text-crimson animate-pulse" />
        <p className="eyebrow text-[10px] text-obsidian/40">Loading…</p>
      </div>
    );
  }

  return (
    <div className="page-transition px-6 lg:px-12 py-10 lg:py-14">
      {/* Header */}
      <div className="border-b border-obsidian/12 pb-8 mb-12">
        <p className="eyebrow text-crimson mb-4">Administration</p>
        <h1
          className="display text-4xl sm:text-5xl lg:text-6xl text-obsidian"
          style={{ fontWeight: 600 }}
        >
          Orders
        </h1>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-obsidian/10 border border-obsidian/10 mb-14">
        {[
          { label: "Total Sales", value: fmt(data?.revenue ?? 0), suffix: "EGP" },
          { label: "Orders", value: fmt(data?.orderCount ?? 0), suffix: "" },
          { label: "Units Sold", value: fmt(data?.unitsSold ?? 0), suffix: "" },
          {
            label: "Avg Order Value",
            value: fmt(data?.avgOrderValue ?? 0),
            suffix: "EGP",
          },
        ].map((k) => (
          <div key={k.label} className="bg-ivory p-6 lg:p-7 flex flex-col gap-3">
            <p className="eyebrow text-[9px] text-obsidian/40">{k.label}</p>
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

      {/* New order form */}
      <div className="border border-obsidian/10 bg-ivory p-8 mb-14">
        <p className="eyebrow text-crimson mb-8">Record New Order</p>
        <form onSubmit={submit} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 items-end">
          {/* Customer */}
          <div className="lg:col-span-1">
            <label className={labelCls}>Customer Name</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Full name"
              className={inputCls}
            />
          </div>

          {/* Product */}
          <div className="lg:col-span-1">
            <label className={labelCls}>Product</label>
            <select
              value={productId}
              onChange={(e) => setProductId(e.target.value)}
              className={`${inputCls} cursor-pointer`}
            >
              <option value="">Select…</option>
              {products.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nameEn} — {fmt(p.price)} EGP
                </option>
              ))}
            </select>
          </div>

          {/* Size */}
          <div>
            <label className={labelCls}>Size</label>
            <select
              value={size}
              onChange={(e) => setSize(e.target.value)}
              disabled={!selectedProduct}
              className={`${inputCls} cursor-pointer disabled:opacity-40`}
            >
              {(selectedProduct?.sizes ?? ["—"]).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Quantity */}
          <div>
            <label className={labelCls}>Quantity</label>
            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) => setQuantity(Math.max(1, Number(e.target.value)))}
              className={inputCls}
            />
          </div>

          {/* Status */}
          <div>
            <label className={labelCls}>Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className={`${inputCls} cursor-pointer capitalize`}
            >
              {STATUSES.map((s) => (
                <option key={s} value={s} className="capitalize">
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Total + submit */}
          <div className="lg:col-span-5 flex flex-col sm:flex-row sm:items-center justify-between gap-5 pt-4 border-t border-obsidian/10">
            <p className="font-body text-sm text-obsidian/60">
              Estimated total:{" "}
              <span className="display text-xl text-crimson ms-1">
                {fmt(estTotal)}
                <span className="font-body text-[10px] text-obsidian/40 ms-1">EGP</span>
              </span>
            </p>
            <div className="flex items-center gap-5">
              {formError && (
                <p className="eyebrow text-[9px] text-crimson">{formError}</p>
              )}
              <button
                type="submit"
                disabled={submitting}
                className="btn-crimson text-[10px] disabled:opacity-50"
              >
                {submitting ? "Saving…" : "Add Order"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Orders table */}
      <p className="eyebrow text-crimson mb-6">
        All Orders — {String(data?.orderCount ?? 0).padStart(2, "0")}
      </p>

      {(data?.orders.length ?? 0) === 0 ? (
        <div className="border border-obsidian/10 text-center py-16 flex flex-col items-center gap-4">
          <Emblem size={32} className="text-obsidian/20" />
          <p className="display text-xl text-obsidian/40">No orders yet</p>
          <p className="font-body text-sm text-obsidian/40">
            Use the form above to record your first order.
          </p>
        </div>
      ) : (
        <div className="border border-obsidian/10 overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <thead>
              <tr className="bg-obsidian/[0.03] border-b border-obsidian/10">
                {["Customer", "Product", "Size", "Qty", "Total", "Status", ""].map(
                  (h) => (
                    <th
                      key={h}
                      className="eyebrow text-[9px] text-obsidian/40 text-start px-5 py-4 font-normal"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {data?.orders.map((o) => (
                <tr
                  key={o.id}
                  className="border-b border-obsidian/8 hover:bg-crimson/[0.03] transition-colors"
                >
                  <td className="px-5 py-4">
                    <p className="font-body text-sm text-obsidian">
                      {o.customerName}
                    </p>
                    <p className="font-body text-[10px] text-obsidian/35 mt-0.5">
                      {o.createdAt.slice(0, 10)}
                    </p>
                  </td>
                  <td className="px-5 py-4 product-name text-base text-obsidian">
                    {o.productName}
                  </td>
                  <td className="px-5 py-4 font-body text-xs text-obsidian/60">
                    {o.size}
                  </td>
                  <td className="px-5 py-4 font-body text-sm text-obsidian/60">
                    {o.quantity}
                  </td>
                  <td className="px-5 py-4 display text-base text-obsidian whitespace-nowrap">
                    {fmt(o.total)}
                    <span className="font-body text-[10px] text-obsidian/40 ms-1">
                      EGP
                    </span>
                  </td>
                  <td className="px-5 py-4">
                    <select
                      value={o.status}
                      onChange={(e) => updateStatus(o.id, e.target.value)}
                      className={`eyebrow text-[8px] px-2 py-1.5 border bg-transparent cursor-pointer capitalize focus:outline-none ${
                        statusStyle[o.status] ?? "text-obsidian/50 border-obsidian/20"
                      }`}
                    >
                      {STATUSES.map((s) => (
                        <option key={s} value={s} className="capitalize text-obsidian">
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-4 text-end">
                    <button
                      onClick={() => remove(o.id)}
                      aria-label="Delete order"
                      className="text-obsidian/30 hover:text-crimson transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.5"
                      >
                        <polyline points="3 6 5 6 21 6" />
                        <path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2" />
                      </svg>
                    </button>
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
