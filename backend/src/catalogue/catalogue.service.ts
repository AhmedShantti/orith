import { Injectable, Logger } from "@nestjs/common";
import type { Product as DbProduct } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import {
  products as staticProducts,
  offers as staticOffers,
  categories as staticCategories,
} from "./catalogue.data";
import type { Product, Offer } from "./catalogue.types";

/**
 * Coerce a raw JSON value from the `noteImages` column into a clean
 * `{ name: url }` map, dropping any non-string entries. Returns undefined when
 * there is nothing usable so the field is simply omitted from the response.
 */
function coerceNoteImages(value: unknown): Record<string, string> | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return undefined;
  }
  const out: Record<string, string> = {};
  for (const [name, url] of Object.entries(value as Record<string, unknown>)) {
    if (typeof url === "string" && url.trim().length > 0) {
      out[name] = url;
    }
  }
  return Object.keys(out).length > 0 ? out : undefined;
}

// The catalogue is the static base collection (catalogue.data) PLUS any
// admin-created products, which now live durably in the Supabase `Product`
// table (previously they were written to an ephemeral JSON file, so they were
// lost on every restart/redeploy and never persisted to the database).
@Injectable()
export class CatalogueService {
  private readonly logger = new Logger(CatalogueService.name);

  constructor(private readonly prisma: PrismaService) {}

  getStaticProducts(): Product[] {
    return staticProducts;
  }

  /** Map a DB product row to the storefront Product shape. */
  private mapDbProduct(p: DbProduct): Product {
    return {
      id: p.id,
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      descriptionEn: p.descriptionEn,
      descriptionAr: p.descriptionAr,
      price: p.price,
      originalPrice: p.originalPrice ?? undefined,
      image: p.image,
      sizes: p.sizes,
      category: p.category,
      badge: (p.badge as Product["badge"]) ?? undefined,
      // `brand`/`rating` are optional columns; read defensively so the mapping
      // keeps working even against a DB that predates the migration.
      brand: (p as { brand?: string | null }).brand ?? undefined,
      rating: (p as { rating?: number | null }).rating ?? undefined,
      notes: {
        top: p.notesTop,
        heart: p.notesHeart,
        base: p.notesBase,
      },
      noteImages: coerceNoteImages((p as { noteImages?: unknown }).noteImages),
    };
  }

  /** All products: admin-created (DB, newest first) + the static collection. */
  async getAllProducts(): Promise<Product[]> {
    try {
      const db = await this.prisma.product.findMany({
        orderBy: { createdAt: "desc" },
      });
      return [...db.map((p) => this.mapDbProduct(p)), ...staticProducts];
    } catch (err) {
      // Keep the storefront alive on a DB hiccup — fall back to the static
      // collection rather than throwing (which would 500 every product page).
      this.logger.error(
        `[${new Date().toISOString()}] [ERROR] [catalogue.getAllProducts]: ${
          err instanceof Error ? err.message : "unknown"
        }`
      );
      return [...staticProducts];
    }
  }

  getOffers(): Offer[] {
    return staticOffers;
  }

  getCategories() {
    return staticCategories;
  }
}
