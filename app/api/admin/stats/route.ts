import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware";
import { ApiResponse } from "@/types";

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
    status: string;
    createdAt: Date;
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

export async function GET(request: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAdmin(request);
    if (authResponse) return authResponse;

    const [
      deliveredOrders,
      totalOrders,
      pendingOrders,
      totalProducts,
      outOfStock,
      totalCustomers,
      recentOrders,
      lowStockProducts,
    ] = await Promise.all([
      prisma.order.aggregate({
        where: { status: "DELIVERED" },
        _sum: { total: true },
      }),
      prisma.order.count(),
      prisma.order.count({ where: { status: "PENDING" } }),
      prisma.product.count(),
      prisma.product.count({ where: { stock: 0 } }),
      prisma.user.count({ where: { role: "CUSTOMER" } }),
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.product.findMany({
        where: { stock: { lt: 10 } },
        orderBy: { stock: "asc" },
        take: 10,
      }),
    ]);

    const topProductsRaw = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });

    const topProductIds = topProductsRaw.map((p) => p.productId);
    const topProductDetails = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
    });

    const topProducts = topProductsRaw.map((item) => {
      const product = topProductDetails.find((p) => p.id === item.productId);
      return {
        productId: item.productId,
        nameEn: product?.nameEn || "Unknown",
        image: product?.image || "",
        unitsSold: item._sum.quantity || 0,
        revenue: (item._sum.quantity || 0) * (product?.price || 0),
      };
    });

    const stats: AdminStats = {
      totalRevenue: deliveredOrders._sum.total || 0,
      totalOrders,
      pendingOrders,
      totalProducts,
      outOfStock,
      totalCustomers,
      recentOrders,
      topProducts,
      lowStockProducts: lowStockProducts.map((p) => ({
        id: p.id,
        nameEn: p.nameEn,
        stock: p.stock,
        image: p.image,
      })),
    };

    const apiResponse: ApiResponse<AdminStats> = {
      success: true,
      data: stats,
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Internal Server Error",
        message: "Failed to fetch admin stats",
      },
      { status: 500 }
    );
  }
}
