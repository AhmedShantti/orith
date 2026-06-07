import { promises as fs } from "fs";
import path from "path";
import { products as staticProducts } from "@/data/products";
import type { Product } from "@/types";

// Admin-created products live in a JSON file so they survive restarts and are
// shared by both the dashboard and the public storefront. The static catalogue
// in data/products.ts is the immutable base; custom products are appended.
const CUSTOM_PATH = path.join(process.cwd(), "data", "custom-products.json");

export async function readCustomProducts(): Promise<Product[]> {
  try {
    const raw = await fs.readFile(CUSTOM_PATH, "utf-8");
    return JSON.parse(raw) as Product[];
  } catch {
    return [];
  }
}

async function writeCustomProducts(products: Product[]): Promise<void> {
  await fs.writeFile(CUSTOM_PATH, JSON.stringify(products, null, 2), "utf-8");
}

// Full catalogue = static base + admin additions (newest custom first).
export async function getAllProducts(): Promise<Product[]> {
  const custom = await readCustomProducts();
  return [...custom, ...staticProducts];
}

export async function addProduct(
  input: Omit<Product, "id">
): Promise<Product> {
  const custom = await readCustomProducts();
  const product: Product = {
    ...input,
    id: `c${Date.now().toString(36)}`,
  };
  custom.unshift(product);
  await writeCustomProducts(custom);
  return product;
}
