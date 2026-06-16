import {
  Injectable,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CatalogueService } from "../../catalogue/catalogue.service";
import { ok, ApiResponse } from "../../common/api-response";
import type { Product } from "../../catalogue/catalogue.types";

const VALID_CATEGORIES = ["oriental", "floral", "woody", "fresh", "powdery"];
const VALID_BADGES = ["bestseller", "new", "limited", "offer"];
const MAX_RATING = 5;

/** Normalize an optional brand line; empty/whitespace → null. */
function parseBrand(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/** Clamp an optional rating into 0–5; anything non-positive/invalid → null. */
function parseRating(value: unknown): number | null {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  if (!Number.isFinite(num) || num <= 0) return null;
  return Math.min(MAX_RATING, Math.max(0, num));
}

/**
 * Normalize an optional note-image map into a clean `{ name: url }` object,
 * dropping non-string entries. Always returns an object (possibly empty) so it
 * can be stored in the JSON column.
 */
function parseNoteImages(value: unknown): Record<string, string> {
  if (!value || typeof value !== "object" || Array.isArray(value)) return {};
  const out: Record<string, string> = {};
  for (const [name, url] of Object.entries(value as Record<string, unknown>)) {
    const key = name.trim();
    if (key && typeof url === "string" && url.trim().length > 0) {
      out[key] = url.trim();
    }
  }
  return out;
}

/** Accept `string[]` or a comma-separated string; return a clean string[]. */
function parseNotes(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map((v) => String(v).trim()).filter(Boolean);
  }
  if (typeof value === "string") {
    return value
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

@Injectable()
export class ProductsService {
  private readonly logger = new Logger(ProductsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogue: CatalogueService
  ) {}

  async list(category?: string, q?: string) {
    let result = await this.catalogue.getAllProducts();
    if (category && category !== "all") {
      result = result.filter((p) => p.category === category);
    }
    const query = q?.toLowerCase().trim();
    if (query) {
      result = result.filter(
        (p) =>
          p.nameEn.toLowerCase().includes(query) ||
          p.nameAr.includes(query) ||
          p.descriptionEn.toLowerCase().includes(query)
      );
    }
    return { count: result.length, products: result };
  }

  async create(body: Record<string, unknown>) {
    const nameEn = String(body.nameEn ?? "").trim();
    const nameAr = String(body.nameAr ?? "").trim();
    const price = Number(body.price);
    const category = String(body.category ?? "").trim();

    if (!nameEn || !nameAr) {
      throw new BadRequestException({
        error: "Both English and Arabic names are required",
      });
    }
    if (!Number.isFinite(price) || price <= 0) {
      throw new BadRequestException({ error: "A valid price is required" });
    }
    if (!VALID_CATEGORIES.includes(category)) {
      throw new BadRequestException({ error: "Invalid category" });
    }

    const sizes =
      Array.isArray(body.sizes) && body.sizes.length
        ? (body.sizes as unknown[]).map((s) => String(s).trim()).filter(Boolean)
        : ["100ml"];

    const badge =
      typeof body.badge === "string" && VALID_BADGES.includes(body.badge)
        ? (body.badge as Product["badge"])
        : undefined;

    const brand = parseBrand(body.brand);
    const rating = parseRating(body.rating);

    // Persist to the Supabase `Product` table (the same store update/delete
    // use). Previously this wrote to an ephemeral JSON file, so products were
    // never durably saved.
    try {
      const product = await this.prisma.product.create({
        data: {
          nameEn,
          nameAr,
          descriptionEn: String(body.descriptionEn ?? "").trim(),
          descriptionAr: String(body.descriptionAr ?? "").trim(),
          price: Math.round(price),
          image: String(body.image ?? "/products/bottle-1.png").trim(),
          sizes,
          category,
          badge: badge ?? null,
          brand,
          rating,
          notesTop: parseNotes(body.notesTop),
          notesHeart: parseNotes(body.notesHeart),
          notesBase: parseNotes(body.notesBase),
          noteImages: parseNoteImages(body.noteImages),
        },
      });
      return { product };
    } catch (err) {
      this.logger.error(
        `[${new Date().toISOString()}] [ERROR] [products.create]: ${
          err instanceof Error ? err.message : "unknown"
        }`
      );
      throw new InternalServerErrorException({
        error: "Failed to create product. Please try again.",
      });
    }
  }

  async getOne(id: string): Promise<ApiResponse<unknown>> {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (product) return ok(product);

    // No DB row. If this is a built-in product, return its static definition in
    // the DB field shape so the edit page can load and edit it.
    const staticProduct = this.catalogue.findStaticById(id);
    if (staticProduct) {
      const now = new Date();
      return ok({
        id,
        ...this.catalogue.staticToDbFields(staticProduct),
        createdAt: now,
        updatedAt: now,
      });
    }

    throw new NotFoundException({
      success: false,
      data: null,
      error: "Not Found",
      message: "Product not found",
    });
  }

  async update(id: string, body: Record<string, unknown>) {
    const b = body;
    const data = {
      ...(b.nameEn !== undefined && { nameEn: String(b.nameEn) }),
      ...(b.nameAr !== undefined && { nameAr: String(b.nameAr) }),
      ...(b.descriptionEn !== undefined && {
        descriptionEn: String(b.descriptionEn),
      }),
      ...(b.descriptionAr !== undefined && {
        descriptionAr: String(b.descriptionAr),
      }),
      ...(b.price !== undefined && { price: parseFloat(String(b.price)) }),
      ...(b.originalPrice !== undefined && {
        originalPrice: b.originalPrice
          ? parseFloat(String(b.originalPrice))
          : null,
      }),
      ...(b.image !== undefined && { image: String(b.image) }),
      ...(b.sizes !== undefined && { sizes: b.sizes as string[] }),
      ...(b.category !== undefined && { category: String(b.category) }),
      ...(b.badge !== undefined && { badge: (b.badge as string) || null }),
      ...(b.brand !== undefined && { brand: parseBrand(b.brand) }),
      ...(b.rating !== undefined && { rating: parseRating(b.rating) }),
      ...(b.notesTop !== undefined && { notesTop: b.notesTop as string[] }),
      ...(b.notesHeart !== undefined && {
        notesHeart: b.notesHeart as string[],
      }),
      ...(b.notesBase !== undefined && {
        notesBase: b.notesBase as string[],
      }),
      ...(b.noteImages !== undefined && {
        noteImages: parseNoteImages(b.noteImages),
      }),
      ...(b.stock !== undefined && { stock: parseInt(String(b.stock)) }),
    };

    const existing = await this.prisma.product.findUnique({ where: { id } });
    if (existing) {
      const updated = await this.prisma.product.update({ where: { id }, data });
      return ok(updated, "Product updated successfully");
    }

    // No DB row yet. If this is a built-in product, materialize it as a DB
    // override (keeping its original id) seeded from the static definition,
    // then apply the edits on top.
    const staticProduct = this.catalogue.findStaticById(id);
    if (staticProduct) {
      const created = await this.prisma.product.create({
        data: { id, ...this.catalogue.staticToDbFields(staticProduct), ...data },
      });
      return ok(created, "Product updated successfully");
    }

    throw new NotFoundException({
      success: false,
      data: null,
      error: "Not Found",
      message: "Product not found",
    });
  }

  async remove(id: string) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException({
        success: false,
        data: null,
        error: "Not Found",
        message: "Product not found",
      });
    }
    await this.prisma.product.delete({ where: { id } });
    return ok(null, "Product deleted successfully");
  }
}
