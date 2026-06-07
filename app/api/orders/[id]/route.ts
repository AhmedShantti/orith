import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import type { Order } from "../route";

const ORDERS_PATH = path.join(process.cwd(), "data", "orders.json");
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
