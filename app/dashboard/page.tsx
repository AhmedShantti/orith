"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Emblem from "@/components/Emblem";
import { useLang } from "@/context/LanguageContext";
import { dict } from "./dict";
import {
  SalesIcon,
  ReceiptIcon,
  UnitsIcon,
  ChartIcon,
  BottleIcon,
  TagIcon,
} from "./icons";

interface Stats {
  totalProducts: number;
  collectionValue: number;
  avgPrice: number;
  activeOffers: number;
  badged: number;
  categories: { id: string; labelEn: string; count: number }[];
  cheapest: { nameEn: string; price: number };
  priciest: { nameEn: string; price: number };
}

interface OrderRow {
  id: string;
  customerName: string;
  productName: string;
  quantity: number;
  total: number;
  status: string;
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

const statusStyle: Record<string, string> = {
  pending: "text-amber-700 border-amber-700/30",
  paid: "text-emerald-700 border-emerald-700/30",
  shipped: "text-sky-700 border-sky-700/30",
  delivered: "text-crimson border-crimson/30",
  cancelled: "text-obsidian/40 border-obsidian/20",
};

export default function OverviewPage() {
  const { lang } = useLang();
  const d = dict[lang];

  const [stats, setStats] = useState<Stats | null>(null);
  const [orders, setOrders] = useState<OrdersResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [s, o] = await Promise.all([
          fetch("/api/stats"),
          fetch("/api/orders"),
        ]);
        if (!s.ok || !o.ok) throw new Error("Failed to load data");
        const statsData = (await s.json()) as Stats;
        const ordersData = (await o.json()) as OrdersResponse;
        if (cancelled) return;
        setStats(statsData);
        setOrders(ordersData);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <Emblem size={40} className="text-crimson animate-pulse" />
        <p className="eyebrow text-[10px] text-obsidian/40">{d.loading}</p>
      </div>
    );
  }

  if (error || !stats || !orders) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5">
        <Emblem size={40} className="text-obsidian/20" />
        <p className="display text-2xl text-obsidian/50">{d.couldNotLoad}</p>
        <p className="eyebrow text-[10px] text-crimson">{error}</p>
      </div>
    );
  }

  const maxCat = Math.max(...stats.categories.map((c) => c.count), 1);

  const kpis = [
    { label: d.kpi.totalSales, value: fmt(orders.revenue), suffix: d.egp, Icon: SalesIcon },
    { label: d.kpi.orders, value: fmt(orders.orderCount), suffix: "", Icon: ReceiptIcon },
    { label: d.kpi.unitsSold, value: fmt(orders.unitsSold), suffix: "", Icon: UnitsIcon },
    { label: d.kpi.avgOrderValue, value: fmt(orders.avgOrderValue), suffix: d.egp, Icon: ChartIcon },
    { label: d.kpi.totalFragrances, value: fmt(stats.totalProducts), suffix: "", Icon: BottleIcon },
    { label: d.kpi.collectionValue, value: fmt(stats.collectionValue), suffix: d.egp, Icon: ChartIcon },
    { label: d.kpi.averagePrice, value: fmt(stats.avgPrice), suffix: d.egp, Icon: TagIcon },
    { label: d.kpi.activeOffers, value: fmt(stats.activeOffers), suffix: "", Icon: TagIcon },
  ];

  return (
    <div className="page-transition px-6 lg:px-12 py-10 lg:py-14">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 border-b border-obsidian/12 pb-8 mb-12">
        <div>
          <p className="eyebrow text-crimson mb-4">{d.administration}</p>
          <h1
            className="display text-4xl sm:text-5xl lg:text-6xl text-obsidian"
            style={{ fontWeight: 600 }}
          >
            {d.nav.dashboard}
          </h1>
        </div>
        <Link
          href="/dashboard/orders"
          className="btn-crimson text-[10px] self-start md:self-auto"
        >
          {d.overview.newOrder}
        </Link>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-px bg-obsidian/10 border border-obsidian/10 mb-14">
        {kpis.map((k) => (
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

      {/* Category + highlights */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-px bg-obsidian/10 border border-obsidian/10 mb-14">
        <div className="bg-ivory p-8 lg:col-span-2">
          <p className="eyebrow text-[9px] text-obsidian/40 mb-8">
            {d.overview.collectionByCategory}
          </p>
          <div className="flex flex-col gap-5">
            {stats.categories.map((c) => (
              <div key={c.id} className="flex items-center gap-4">
                <span className="eyebrow text-[10px] text-obsidian/70 w-24 shrink-0">
                  {d.cat[c.id] ?? c.labelEn}
                </span>
                <div className="flex-1 h-2 bg-obsidian/8">
                  <div
                    className="h-full bg-gold-gradient"
                    style={{ width: `${(c.count / maxCat) * 100}%` }}
                  />
                </div>
                <span className="display text-sm text-obsidian w-8 text-end">
                  {String(c.count).padStart(2, "0")}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-ivory p-8 flex flex-col gap-7">
          <p className="eyebrow text-[9px] text-obsidian/40">{d.overview.highlights}</p>
          <div>
            <p className="eyebrow text-[9px] text-obsidian/40 mb-2">
              {d.overview.mostPrecious}
            </p>
            <p className="product-name text-xl text-obsidian">
              {stats.priciest.nameEn}
            </p>
            <p className="display text-lg text-crimson mt-1">
              {fmt(stats.priciest.price)}
              <span className="font-body text-[10px] text-obsidian/40 ms-1.5">
                {d.egp}
              </span>
            </p>
          </div>
          <div className="hairline text-obsidian" />
          <div>
            <p className="eyebrow text-[9px] text-obsidian/40 mb-2">
              {d.overview.mostAccessible}
            </p>
            <p className="product-name text-xl text-obsidian">
              {stats.cheapest.nameEn}
            </p>
            <p className="display text-lg text-crimson mt-1">
              {fmt(stats.cheapest.price)}
              <span className="font-body text-[10px] text-obsidian/40 ms-1.5">
                {d.egp}
              </span>
            </p>
          </div>
        </div>
      </div>

      {/* Recent orders */}
      <div className="flex items-center justify-between mb-6">
        <p className="eyebrow text-crimson">{d.overview.recentOrders}</p>
        <Link
          href="/dashboard/orders"
          className="eyebrow text-[10px] text-obsidian/50 link-underline"
        >
          {d.overview.viewAll}
        </Link>
      </div>

      {orders.orders.length === 0 ? (
        <div className="border border-obsidian/10 text-center py-16 flex flex-col items-center gap-4">
          <Emblem size={32} className="text-obsidian/20" />
          <p className="display text-xl text-obsidian/40">{d.overview.noOrders}</p>
          <Link
            href="/dashboard/orders"
            className="eyebrow text-[10px] text-crimson link-underline"
          >
            {d.overview.recordFirst}
          </Link>
        </div>
      ) : (
        <div className="border border-obsidian/10 overflow-x-auto">
          <table className="w-full min-w-[620px]">
            <thead>
              <tr className="bg-obsidian/[0.03] border-b border-obsidian/10">
                {[d.table.customer, d.table.product, d.table.qty, d.table.status, d.table.total].map(
                  (h) => (
                    <th
                      key={h}
                      className="eyebrow text-[9px] text-obsidian/40 text-start px-6 py-4 font-normal"
                    >
                      {h}
                    </th>
                  )
                )}
              </tr>
            </thead>
            <tbody>
              {orders.orders.slice(0, 5).map((o) => (
                <tr key={o.id} className="border-b border-obsidian/8">
                  <td className="px-6 py-4 font-body text-sm text-obsidian">
                    {o.customerName}
                  </td>
                  <td className="px-6 py-4 product-name text-base text-obsidian">
                    {o.productName}
                  </td>
                  <td className="px-6 py-4 font-body text-sm text-obsidian/60">
                    {o.quantity}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-block eyebrow text-[8px] px-2 py-1 border ${
                        statusStyle[o.status] ?? "text-obsidian/50 border-obsidian/20"
                      }`}
                    >
                      {d.status[o.status as keyof typeof d.status] ?? o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 display text-base text-obsidian whitespace-nowrap">
                    {fmt(o.total)}
                    <span className="font-body text-[10px] text-obsidian/40 ms-1">
                      {d.egp}
                    </span>
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
