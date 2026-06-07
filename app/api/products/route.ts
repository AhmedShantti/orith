import { NextResponse } from "next/server";
import { getAllProducts, addProduct } from "@/lib/productStore";
import type { Product } from "@/types";

const VALID_CATEGORIES = ["oriental", "floral", "woody", "fresh", "powdery"];
const VALID_BADGES = ["bestseller", "new", "limited", "offer"];

// GET /api/products — full catalogue (static + admin-added), filterable
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.toLowerCase().trim();

  let result = await getAllProducts();

  if (category && category !== "all") {
    result = result.filter((p) => p.category === category);
  }
  if (q) {
    result = result.filter(
      (p) =>
        p.nameEn.toLowerCase().includes(q) ||
        p.nameAr.includes(q) ||
        p.descriptionEn.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ count: result.length, products: result });
}

// POST /api/products — create a new product (appears on the website immediately)
export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const nameEn = String(body.nameEn ?? "").trim();
  const nameAr = String(body.nameAr ?? "").trim();
  const price = Number(body.price);
  const category = String(body.category ?? "").trim();

  if (!nameEn || !nameAr) {
    return NextResponse.json(
      { error: "Both English and Arabic names are required" },
      { status: 400 }
    );
  }
  if (!Number.isFinite(price) || price <= 0) {
    return NextResponse.json(
      { error: "A valid price is required" },
      { status: 400 }
    );
  }
  if (!VALID_CATEGORIES.includes(category)) {
    return NextResponse.json({ error: "Invalid category" }, { status: 400 });
  }

  const sizes =
    Array.isArray(body.sizes) && body.sizes.length
      ? body.sizes.map((s) => String(s).trim()).filter(Boolean)
      : ["100ml"];

  const badge =
    typeof body.badge === "string" && VALID_BADGES.includes(body.badge)
      ? (body.badge as Product["badge"])
      : undefined;

  const input: Omit<Product, "id"> = {
    nameEn,
    nameAr,
    descriptionEn: String(body.descriptionEn ?? "").trim(),
    descriptionAr: String(body.descriptionAr ?? "").trim(),
    price: Math.round(price),
    image: String(body.image ?? "/products/bottle-1.png").trim(),
    sizes,
    category,
    ...(badge ? { badge } : {}),
  };

  const product = await addProduct(input);
  return NextResponse.json({ product }, { status: 201 });
}
