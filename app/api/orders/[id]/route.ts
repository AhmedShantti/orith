import { NextRequest, NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Order } from "../route";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

const ORDER_ACCESS_COOKIE = "orith_order_access";
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

const ORDERS_PATH = path.join(process.cwd(), "data", "orders.json");

// GET /api/orders/:id — fetch a Prisma checkout order with ownership check.
// Allowed for: admins, the authenticated owner, or a guest whose order-access
// cookie includes this order id (set at order creation).
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const order = await prisma.order.findUnique({
      where: { id: params.id },
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
      return NextResponse.json(
        { success: false, data: null, error: "Order not found" },
        { status: 404 }
      );
    }

    const user = await getUserFromRequest(request);
    const cookieIds = (
      request.cookies.get(ORDER_ACCESS_COOKIE)?.value ?? ""
    )
      .split(",")
      .filter(Boolean);

    const isAdmin = user?.role === "ADMIN";
    const isOwner = user?.userId && order.userId === user.userId;
    const hasCookie = cookieIds.includes(order.id);

    if (!isAdmin && !isOwner && !hasCookie) {
      return NextResponse.json(
        { success: false, data: null, error: "Forbidden" },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, data: order });
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] [ERROR] [orders/:id GET]: ${
        error instanceof Error ? error.message : "unknown"
      }`
    );
    return NextResponse.json(
      { success: false, data: null, error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/orders/:id — admin-only status update on a Prisma checkout order.
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const user = await getUserFromRequest(request);
  if (!user || user.role !== "ADMIN") {
    return NextResponse.json(
      { success: false, data: null, error: "Forbidden" },
      { status: 403 }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const status = String(body.status ?? "");
  if (!VALID_ORDER_STATUSES.includes(status)) {
    return NextResponse.json(
      { success: false, data: null, error: "Invalid status" },
      { status: 400 }
    );
  }

  try {
    const updated = await prisma.order.update({
      where: { id: params.id },
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
    return NextResponse.json({ success: true, data: updated });
  } catch {
    return NextResponse.json(
      { success: false, data: null, error: "Order not found" },
      { status: 404 }
    );
  }
}
const STATUSES: Order["status"][] = [
  "pending",
  "paid",
  "shipped",
  "delivered",
  "cancelled",
];

async function readOrders(): Promise<Order[]> {
  try {
    return JSON.parse(await fs.readFile(ORDERS_PATH, "utf-8")) as Order[];
  } catch {
    return [];
  }
}

async function writeOrders(orders: Order[]): Promise<void> {
  await fs.writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2), "utf-8");
}

// PATCH /api/orders/:id — update an order's status
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const status = String(body.status ?? "") as Order["status"];
  if (!STATUSES.includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  const orders = await readOrders();
  const order = orders.find((o) => o.id === params.id);
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  order.status = status;
  await writeOrders(orders);
  return NextResponse.json({ order });
}

// DELETE /api/orders/:id — remove an order
export async function DELETE(
  _request: Request,
  { params }: { params: { id: string } }
) {
  const orders = await readOrders();
  const next = orders.filter((o) => o.id !== params.id);
  if (next.length === orders.length) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }
  await writeOrders(next);
  return NextResponse.json({ ok: true });
}
