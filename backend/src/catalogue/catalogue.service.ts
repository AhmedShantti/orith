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

  /** Find a built-in (static) product by id. */
  findStaticById(id: string): Product | undefined {
    return staticProducts.find((p) => p.id === id);
  }

  /**
   * Map a built-in product into the DB Product field shape, so a static
   * product can be materialized into the `Product` table when it is first
   * edited (a "DB override" that keeps the original id).
   */
  staticToDbFields(p: Product) {
    return {
      nameEn: p.nameEn,
      nameAr: p.nameAr,
      descriptionEn: p.descriptionEn,
      descriptionAr: p.descriptionAr,
      price: p.price,
      originalPrice: p.originalPrice ?? null,
      image: p.image,
      sizes: p.sizes,
      category: p.category,
      badge: p.badge ?? null,
      brand: null as string | null,
      rating: null as number | null,
      notesTop: p.notes?.top ?? [],
      notesHeart: p.notes?.heart ?? [],
      notesBase: p.notes?.base ?? [],
      noteImages: p.noteImages ?? {},
      stock: 100,
    };
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

  /**
   * All products: admin-created (DB, newest first), then the static base
   * collection. Any static product that has been edited has a DB row with the
   * same id — that override replaces the file version, so built-in products are
   * fully editable while remaining visible by default.
   */
  async getAllProducts(): Promise<Product[]> {
    try {
      const db = await this.prisma.product.findMany({
        orderBy: { createdAt: "desc" },
      });
      const dbMapped = db.map((p) => this.mapDbProduct(p));
      const dbById = new Map(dbMapped.map((p) => [p.id, p]));
      const staticIds = new Set(staticProducts.map((s) => s.id));

      // Admin-created products are DB rows whose id is not a built-in id.
      const adminProducts = dbMapped.filter((p) => !staticIds.has(p.id));
      // Built-in collection, with edited entries swapped for their DB override.
      const baseProducts = staticProducts.map((s) => dbById.get(s.id) ?? s);

      return [...adminProducts, ...baseProducts];
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
