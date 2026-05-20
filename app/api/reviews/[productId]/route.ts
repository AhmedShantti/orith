import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { ApiResponse, PaginatedResponse, Review } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const product = await prisma.product.findUnique({
      where: { id: params.productId },
    });

    if (!product) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Not Found",
        message: "Product not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId: params.productId },
        include: { user: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.review.count({ where: { productId: params.productId } }),
    ]);

    const apiResponse: PaginatedResponse<Review> = {
      success: true,
      data: reviews,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: "Internal Server Error",
      message: "Failed to fetch reviews",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
