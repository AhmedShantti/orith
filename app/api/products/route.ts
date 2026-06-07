import { NextResponse } from "next/server";
import { products } from "@/data/products";

// GET /api/products — full catalogue, optionally filtered by ?category= and ?q=
export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const q = searchParams.get("q")?.toLowerCase().trim();

  let result = products;

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
