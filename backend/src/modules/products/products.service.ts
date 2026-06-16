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
    if (!product) {
      throw new NotFoundException({
        success: false,
        data: null,
        error: "Not Found",
        message: "Product not found",
      });
    }
    return ok(product);
  }

  async update(id: string, body: Record<string, unknown>) {
    const product = await this.prisma.product.findUnique({ where: { id } });
    if (!product) {
      throw new NotFoundException({
        success: false,
        data: null,
        error: "Not Found",
        message: "Product not found",
      });
    }
    const b = body;
    const updated = await this.prisma.product.update({
      where: { id },
      data: {
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
        ...(b.stock !== undefined && { stock: parseInt(String(b.stock)) }),
      },
    });
    return ok(updated, "Product updated successfully");
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
