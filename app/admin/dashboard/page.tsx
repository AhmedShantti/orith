"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";
import { ApiResponse, OrderStatus } from "@/types";
import StatCard from "@/components/admin/StatCard";
import OrderStatusBadge from "@/components/admin/OrderStatusBadge";
import LoadingSkeleton from "@/components/admin/LoadingSkeleton";
import {
  DollarSign,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
} from "lucide-react";
import Image from "next/image";

interface AdminStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalProducts: number;
  outOfStock: number;
  totalCustomers: number;
  recentOrders: Array<{
    id: string;
    total: number;
    status: OrderStatus;
    createdAt: string;
    user: { name: string; email: string } | null;
  }>;
  topProducts: Array<{
    productId: string;
    nameEn: string;
    image: string;
    unitsSold: number;
    revenue: number;
  }>;
  lowStockProducts: Array<{
    id: string;
    nameEn: string;
    stock: number;
    image: string;
  }>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .get<ApiResponse<AdminStats>>("/api/admin/stats")
      .then((res) => {
        if (res.success && res.data) setStats(res.data);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-[#f5f0e8]">Dashboard</h1>
        <LoadingSkeleton type="cards" />
        <LoadingSkeleton type="table" rows={5} columns={5} />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="text-center py-20">
        <p className="text-white/30">Failed to load dashboard data.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-[#f5f0e8]">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={`${stats.totalRevenue.toFixed(2)} EGP`}
          subtitle="From delivered orders"
          icon={DollarSign}
          trend="up"
        />
        <StatCard
          title="Total Orders"
          value={stats.totalOrders}
          subtitle={`${stats.pendingOrders} pending`}
          icon={ShoppingCart}
          trend={stats.pendingOrders > 0 ? "up" : "neutral"}
        />
        <StatCard
          title="Total Products"
          value={stats.totalProducts}
          subtitle={
            stats.outOfStock > 0
              ? `${stats.outOfStock} out of stock`
              : "All in stock"
          }
          icon={Package}
          trend={stats.outOfStock > 0 ? "down" : "neutral"}
        />
        <StatCard
          title="Customers"
          value={stats.totalCustomers}
          subtitle="Registered users"
          icon={Users}
          trend="neutral"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-[#f5f0e8]">
              Recent Orders
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-2.5">
                    Customer
                  </th>
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-2.5">
                    Total
                  </th>
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-2.5">
                    Status
                  </th>
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-2.5">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3 text-sm text-[#f5f0e8]/80">
                      {order.user?.name || "—"}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#f5f0e8]/80">
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
                {stats.recentOrders.length === 0 && (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-8 text-center text-white/30 text-sm"
                    >
                      No orders yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Products */}
        <div className="bg-[#111111] border border-white/5 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-white/5">
            <h2 className="text-sm font-semibold text-[#f5f0e8]">
              Top Products
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
                    Sold
                  </th>
                  <th className="text-left text-xs font-medium text-white/30 uppercase px-5 py-2.5">
                    Revenue
                  </th>
                </tr>
              </thead>
              <tbody>
                {stats.topProducts.map((product) => (
                  <tr
                    key={product.productId}
                    className="border-b border-white/5 hover:bg-white/[0.02] transition-colors"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {product.image && (
                          <Image
                            src={product.image}
                            alt={product.nameEn}
                            width={32}
                            height={32}
                            className="rounded object-cover"
                          />
                        )}
                        <p className="text-sm text-[#f5f0e8]/80">
                          {product.nameEn}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-sm text-[#f5f0e8]/80">
                      {product.unitsSold}
                    </td>
                    <td className="px-5 py-3 text-sm text-[#c9a84c]">
                      {product.revenue.toFixed(2)} EGP
                    </td>
                  </tr>
                ))}
                {stats.topProducts.length === 0 && (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-5 py-8 text-center text-white/30 text-sm"
                    >
                      No sales data yet
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Low Stock Alert */}
      {stats.lowStockProducts.length > 0 && (
        <div className="bg-[#111111] border border-amber-500/10 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-amber-500/10 flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-400" />
            <h2 className="text-sm font-semibold text-amber-400">
              Low Stock Alert
            </h2>
          </div>
          <div className="p-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {stats.lowStockProducts.map((product) => (
              <div
                key={product.id}
                className="flex items-center gap-3 bg-white/[0.02] rounded-lg px-4 py-3 border border-white/5"
              >
                {product.image && (
                  <Image
                    src={product.image}
                    alt={product.nameEn}
                    width={36}
                    height={36}
                    className="rounded object-cover"
                  />
                )}
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[#f5f0e8]/80 truncate">
                    {product.nameEn}
                  </p>
                </div>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    product.stock === 0
                      ? "bg-red-500/10 text-red-400"
                      : "bg-amber-500/10 text-amber-400"
                  }`}
                >
                  {product.stock === 0 ? "Out" : product.stock}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
