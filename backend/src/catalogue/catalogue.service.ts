import { Injectable } from "@nestjs/common";
import { promises as fs } from "fs";
import path from "path";
import {
  products as staticProducts,
  offers as staticOffers,
  categories as staticCategories,
} from "./catalogue.data";
import type { Product, Offer } from "./catalogue.types";

// Admin-created products live in a JSON file (backend/data) so they survive
// restarts. The static catalogue is the immutable base; custom products prepend.
const DATA_DIR = path.join(process.cwd(), "data");
const CUSTOM_PATH = path.join(DATA_DIR, "custom-products.json");

@Injectable()
export class CatalogueService {
  async readCustomProducts(): Promise<Product[]> {
    try {
      const raw = await fs.readFile(CUSTOM_PATH, "utf-8");
      return JSON.parse(raw) as Product[];
    } catch {
      return [];
    }
  }

  private async writeCustomProducts(products: Product[]): Promise<void> {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(CUSTOM_PATH, JSON.stringify(products, null, 2), "utf-8");
  }

  async getAllProducts(): Promise<Product[]> {
    const custom = await this.readCustomProducts();
    return [...custom, ...staticProducts];
  }

  async addProduct(input: Omit<Product, "id">): Promise<Product> {
    const custom = await this.readCustomProducts();
    const product: Product = { ...input, id: `c${Date.now().toString(36)}` };
    custom.unshift(product);
    await this.writeCustomProducts(custom);
    return product;
  }

  getOffers(): Offer[] {
    return staticOffers;
  }

  getCategories() {
    return staticCategories;
  }
}
