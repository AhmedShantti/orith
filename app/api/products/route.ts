import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware";
import { ApiResponse, PaginatedResponse, BackendProduct } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const category = searchParams.get("category");
    const search = searchParams.get("search");
    const sort = searchParams.get("sort") || "createdAt";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");

    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (search) {
      where.OR = [
        { nameEn: { contains: search, mode: "insensitive" } },
        { nameAr: { contains: search, mode: "insensitive" } },
        { descriptionEn: { contains: search, mode: "insensitive" } },
      ];
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        skip,
        take: limit,
        orderBy: { [sort]: "desc" },
      }),
      prisma.product.count({ where }),
    ]);

    const response: PaginatedResponse<BackendProduct> = {
      success: true,
      data: products,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching products:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: "Internal Server Error",
      message: "Failed to fetch products",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAdmin(request);
    if (authResponse) return authResponse;

    const body = await request.json();
    const {
      nameEn, nameAr, descriptionEn, descriptionAr,
      price, originalPrice, image, sizes, category,
      badge, notesTop, notesHeart, notesBase, stock,
    } = body;

    if (
      !nameEn || !nameAr || !descriptionEn || !descriptionAr ||
      price === undefined || !image || !category || stock === undefined
    ) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Bad Request",
        message: "Missing required fields",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const product = await prisma.product.create({
      data: {
        nameEn,
        nameAr,
        descriptionEn,
        descriptionAr,
        price: parseFloat(price),
        originalPrice: originalPrice ? parseFloat(originalPrice) : null,
        image,
        sizes: sizes || [],
        category,
        badge: badge || null,
        notesTop: notesTop || [],
        notesHeart: notesHeart || [],
        notesBase: notesBase || [],
        stock: parseInt(stock),
      },
    });

    const apiResponse: ApiResponse<BackendProduct> = {
      success: true,
      data: product,
      message: "Product created successfully",
    };

    return NextResponse.json(apiResponse, { status: 201 });
  } catch (error) {
    console.error("Error creating product:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: "Internal Server Error",
      message: "Failed to create product",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
