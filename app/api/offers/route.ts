import { NextResponse } from "next/server";
import { offers } from "@/data/products";

// GET /api/offers — active offers with derived savings
export async function GET() {
  const enriched = offers.map((o) => {
    const original = o.product.originalPrice ?? o.product.price;
    const saving = Math.max(0, original - o.product.price);
    return { ...o, saving };
  });

  return NextResponse.json({ count: enriched.length, offers: enriched });
}
