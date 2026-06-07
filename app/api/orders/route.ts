import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { products } from "@/data/products";

export interface Order {
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

const ORDERS_PATH = path.join(process.cwd(), "data", "orders.json");

async function readOrders(): Promise<Order[]> {
  try {
    const raw = await fs.readFile(ORDERS_PATH, "utf-8");
    return JSON.parse(raw) as Order[];
  } catch {
    return [];
  }
}

async function writeOrders(orders: Order[]): Promise<void> {
  await fs.writeFile(ORDERS_PATH, JSON.stringify(orders, null, 2), "utf-8");
}

function summarize(orders: Order[]) {
  const revenue = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const unitsSold = orders
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.quantity, 0);
  return {
    orderCount: orders.length,
    revenue,
    unitsSold,
    avgOrderValue: orders.length ? Math.round(revenue / orders.length) : 0,
  };
}

// GET /api/orders — list orders (newest first) + summary metrics
export async function GET() {
  const orders = await readOrders();
  const sorted = [...orders].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
  return NextResponse.json({ ...summarize(orders), orders: sorted });
}

// POST /api/orders — create a new order
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const customerName = String(body.customerName ?? "").trim();
  const productId = String(body.productId ?? "").trim();
  const quantity = Math.max(1, Math.floor(Number(body.quantity) || 1));
  const status = String(body.status ?? "pending") as Order["status"];

  if (!customerName) {
    return NextResponse.json(
      { error: "Customer name is required" },
      { status: 400 }
    );
  }

  const product = products.find((p) => p.id === productId);
  if (!product) {
    return NextResponse.json(
      { error: "Unknown product" },
      { status: 400 }
    );
  }

  const size = String(body.size ?? product.sizes[0] ?? "");
  const unitPrice = product.price;

  const orders = await readOrders();
  const order: Order = {
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
  await writeOrders(orders);

  return NextResponse.json({ order }, { status: 201 });
}
