import { NextResponse } from "next/server";
import { products, offers, categories } from "@/data/products";

// GET /api/stats — aggregate metrics for the admin dashboard
export async function GET() {
  const total = products.length;
  const collectionValue = products.reduce((sum, p) => sum + p.price, 0);
  const avgPrice = total ? Math.round(collectionValue / total) : 0;

  const cheapest = products.reduce((a, b) => (b.price < a.price ? b : a));
  const priciest = products.reduce((a, b) => (b.price > a.price ? b : a));

  const byCategory = categories
    .filter((c) => c.id !== "all")
    .map((c) => ({
      id: c.id,
      labelEn: c.labelEn,
      labelAr: c.labelAr,
      count: products.filter((p) => p.category === c.id).length,
    }))
    .sort((a, b) => b.count - a.count);

  const badged = products.filter((p) => p.badge).length;

  return NextResponse.json({
    totalProducts: total,
    collectionValue,
    avgPrice,
    activeOffers: offers.length,
    badged,
    categories: byCategory,
    cheapest: { nameEn: cheapest.nameEn, price: cheapest.price },
    priciest: { nameEn: priciest.nameEn, price: priciest.price },
  });
}
