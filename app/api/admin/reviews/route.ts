import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware";
import { PaginatedResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAdmin(request);
    if (authResponse) return authResponse;

    const searchParams = request.nextUrl.searchParams;
    const rating = searchParams.get("rating");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (rating) where.rating = parseInt(rating);

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true } },
          product: { select: { nameEn: true, image: true } },
        },
      }),
      prisma.review.count({ where }),
    ]);

    const response: PaginatedResponse<(typeof reviews)[number]> = {
      success: true,
      data: reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Internal Server Error",
        message: "Failed to fetch reviews",
      },
      { status: 500 }
    );
  }
}
