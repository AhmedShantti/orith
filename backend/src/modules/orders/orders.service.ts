import {
  Injectable,
  BadRequestException,
  NotFoundException,
  ForbiddenException,
} from "@nestjs/common";
import { promises as fs } from "fs";
import path from "path";
import { PrismaService } from "../../prisma/prisma.service";
import { CatalogueService } from "../../catalogue/catalogue.service";
import { ok } from "../../common/api-response";
import type { JWTPayload } from "../../common/auth/jwt.util";

// ---- Legacy file-JSON order (used by the simple dashboard order list) ----
export interface LegacyOrder {
  id: string;
  customerName: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
  size: string;
  status: "pending" | "paid" | "shipped" | "delivered" | "cancelled";
  createdAt: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const ORDERS_PATH = path.join(DATA_DIR, "orders.json");
const LEGACY_STATUSES: LegacyOrder["status"][] = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
];

@Injectable()
export class OrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogue: CatalogueService
  ) {}

  private async readOrders(): Promise<LegacyOrder[]> {
    try {
      return JSON.parse(await fs.readFile(ORDERS_PATH, "utf-8")) as LegacyOrder[];
    } catch {
      return [];
    }
  }

  private async writeOrders(orders: LegacyOrder[]): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2), "utf-8");
  }

  private summarize(orders: LegacyOrder[]) {
    const active = orders.filter((o) => o.status !== "cancelled");
    const revenue = active.reduce((s, o) => s + o.total, 0);
    const unitsSold = active.reduce((s, o) => s + o.quantity, 0);
    return {
      orderCount: orders.length,
      revenue,
      unitsSold,
      avgOrderValue: orders.length ? Math.round(revenue / orders.length) : 0,
    };
  }

  // GET /api/orders
  async listLegacy() {
    const orders = await this.readOrders();
    const sorted = [...orders].sort((a, b) =>
      b.createdAt.localeCompare(a.createdAt)
    );
    return { ...this.summarize(orders), orders: sorted };
  }

  // POST /api/orders
  async createLegacy(body: Record<string, unknown>) {
    const customerName = String(body.customerName ?? "").trim();
    const productId = String(body.productId ?? "").trim();
    const quantity = Math.max(1, Math.floor(Number(body.quantity) || 1));
    const status = String(body.status ?? "pending") as LegacyOrder["status"];

    if (!customerName) {
      throw new BadRequestException({ error: "Customer name is required" });
    }
    const product = (await this.catalogue.getAllProducts()).find(
      (p) => p.id === productId
    );
    if (!product) {
      throw new BadRequestException({ error: "Unknown product" });
    }
    const size = String(body.size ?? product.sizes[0] ?? "");
    const unitPrice = product.price;

    const orders = await this.readOrders();
    const order: LegacyOrder = {
      id: `ord_${Date.now().toString(36)}${Math.floor(Math.random() * 1e4)
        .toString(36)
        .padStart(3, "0")}`,
      customerName,
      productId: product.id,
      productName: product.nameEn,
      quantity,
      unitPrice,
      total: unitPrice * quantity,
      size,
      status,
      createdAt: new Date().toISOString(),
    };
    orders.push(order);
    await this.writeOrders(orders);
    return { order };
  }

  // PATCH /api/orders/:id  (legacy status update)
  async patchLegacy(id: string, status: string) {
    if (!LEGACY_STATUSES.includes(status as LegacyOrder["status"])) {
      throw new BadRequestException({ error: "Invalid status" });
    }
    const orders = await this.readOrders();
    const order = orders.find((o) => o.id === id);
    if (!order) throw new NotFoundException({ error: "Order not found" });
    order.status = status as LegacyOrder["status"];
    await this.writeOrders(orders);
    return { order };
  }

  // DELETE /api/orders/:id (legacy)
  async deleteLegacy(id: string) {
    const orders = await this.readOrders();
    const next = orders.filter((o) => o.id !== id);
    if (next.length === orders.length) {
      throw new NotFoundException({ error: "Order not found" });
    }
    await this.writeOrders(next);
    return { ok: true };
  }

  // ---- Prisma checkout orders ----

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
    const VALID = [
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
    if (!VALID.includes(status)) {
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
