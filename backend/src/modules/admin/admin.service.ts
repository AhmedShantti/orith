import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ok, paginated } from "../../common/api-response";

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async orders(status: string | undefined, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (status && status !== "ALL") where.status = status;

    const [orders, total] = await Promise.all([
      this.prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: {
            select: {
              name: true,
              email: true,
              id: true,
              role: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          items: { include: { product: true } },
        },
      }),
      this.prisma.order.count({ where }),
    ]);
    return paginated(orders, {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  }

  async customers(search: string | undefined, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = { role: "CUSTOMER" };
    if (search) {
      where.OR = [
        { name: { contains: search, mode: "insensitive" } },
        { email: { contains: search, mode: "insensitive" } },
      ];
    }
    const [customers, total] = await Promise.all([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true,
          _count: { select: { orders: true } },
        },
      }),
      this.prisma.user.count({ where }),
    ]);
    return paginated(customers, {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  }

  async reviews(rating: string | undefined, page: number, limit: number) {
    const skip = (page - 1) * limit;
    const where: Record<string, unknown> = {};
    if (rating) where.rating = parseInt(rating, 10);
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          product: { select: { nameEn: true, image: true } },
        },
      }),
      this.prisma.review.count({ where }),
    ]);
    return paginated(reviews, {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  }

  async deleteReview(id: string) {
    const review = await this.prisma.review.findUnique({ where: { id } });
    if (!review) {
      throw new NotFoundException({
        success: false,
        data: null,
        error: "Not Found",
        message: "Review not found",
      });
    }
    await this.prisma.review.delete({ where: { id } });
    return ok(null, "Review deleted successfully");
  }

  async stats() {
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
      this.prisma.order.aggregate({
        where: { status: "DELIVERED" },
        _sum: { total: true },
      }),
      this.prisma.order.count(),
      this.prisma.order.count({ where: { status: "PENDING" } }),
      this.prisma.product.count(),
      this.prisma.product.count({ where: { stock: 0 } }),
      this.prisma.user.count({ where: { role: "CUSTOMER" } }),
      this.prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { user: { select: { name: true, email: true } } },
      }),
      this.prisma.product.findMany({
        where: { stock: { lt: 10 } },
        orderBy: { stock: "asc" },
        take: 10,
      }),
    ]);

    const topProductsRaw = await this.prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true, price: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 5,
    });
    const topProductIds = topProductsRaw
      .map((p) => p.productId)
      .filter((id): id is string => id !== null);
    const topProductDetails = await this.prisma.product.findMany({
      where: { id: { in: topProductIds } },
    });
    const topProducts = topProductsRaw.map((item) => {
      const product = topProductDetails.find((p) => p.id === item.productId);
      return {
        productId: item.productId ?? "",
        nameEn: product?.nameEn || "Unknown",
        image: product?.image || "",
        unitsSold: item._sum.quantity || 0,
        revenue: (item._sum.quantity || 0) * (product?.price || 0),
      };
    });

    return ok({
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
    });
  }
}
