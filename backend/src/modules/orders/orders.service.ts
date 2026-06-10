import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ok } from "../../common/api-response";
import type { JWTPayload } from "../../common/auth/jwt.util";

// Statuses that count toward sales totals (a confirmed sale, incl. COD).
const REVENUE_STATUSES = ["PROCESSING", "SHIPPED", "DELIVERED"];

const VALID_ORDER_STATUSES = [
  "PENDING",
  "PENDING_PAYMENT",
  "AWAITING_CONFIRMATION",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
  "PAYMENT_FAILED",
];

// Flat row shape the dashboard consumes.
export interface DashboardOrderRow {
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

@Injectable()
export class OrdersService {
  constructor(private readonly prisma: PrismaService) {}

  // GET /api/orders — real checkout orders from the database, shaped for the
  // dashboard (summary KPIs + flat rows). Admin-only (guarded in controller).
  async listDashboard() {
    const orders = await this.prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: { items: true, user: { select: { name: true } } },
    });

    const rows: DashboardOrderRow[] = orders.map((o) => {
      const items = o.items ?? [];
      const first = items[0];
      const extra = items.length > 1 ? ` +${items.length - 1} more` : "";
      const customerName =
        `${o.customerFirstName ?? ""} ${o.customerLastName ?? ""}`.trim() ||
        o.user?.name ||
        "Guest";
      return {
        id: o.id,
        orderNumber: o.orderNumber,
        customerName,
        productName: first ? `${first.productName ?? "Item"}${extra}` : "—",
        size: first?.variantName ?? "",
        quantity: items.reduce((s, i) => s + i.quantity, 0),
        total: o.total,
        status: o.status,
        paymentMethod: o.paymentMethod,
        paymentStatus: o.paymentStatus,
        createdAt: o.createdAt.toISOString(),
      };
    });

    const counted = orders.filter((o) => REVENUE_STATUSES.includes(o.status));
    const revenue = counted.reduce((s, o) => s + o.total, 0);
    const unitsSold = counted.reduce(
      (s, o) => s + (o.items ?? []).reduce((q, i) => q + i.quantity, 0),
      0
    );

    return {
      orderCount: orders.length,
      revenue,
      unitsSold,
      avgOrderValue: orders.length ? Math.round(revenue / orders.length) : 0,
      orders: rows,
    };
  }

  // GET /api/orders/:id with ownership check.
  async getPrismaOrder(
    id: string,
    user: JWTPayload | null,
    accessCookieIds: string[]
  ) {
    const order = await this.prisma.order.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            createdAt: true,
            updatedAt: true,
          },
        },
        items: true,
      },
    });
    if (!order) {
      throw new NotFoundException({
        success: false,
        data: null,
        error: "Order not found",
      });
    }
    const isAdmin = user?.role === "ADMIN";
    const isOwner = !!user?.userId && order.userId === user.userId;
    const hasCookie = accessCookieIds.includes(order.id);
    if (!isAdmin && !isOwner && !hasCookie) {
      throw new ForbiddenException({
        success: false,
        data: null,
        error: "Forbidden",
      });
    }
    return ok(order);
  }

  // PUT /api/orders/:id (admin status update).
  async updatePrismaStatus(id: string, status: string) {
    if (!VALID_ORDER_STATUSES.includes(status)) {
      throw new BadRequestException({
        success: false,
        data: null,
        error: "Invalid status",
      });
    }
    try {
      const updated = await this.prisma.order.update({
        where: { id },
        data: { status: status as never },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              createdAt: true,
              updatedAt: true,
            },
          },
          items: true,
        },
      });
      return ok(updated);
    } catch {
      throw new NotFoundException({
        success: false,
        data: null,
        error: "Order not found",
      });
    }
  }
}
