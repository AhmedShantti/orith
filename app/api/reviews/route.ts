import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";
import { ApiResponse, Review } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth(request);
    if (authResponse) return authResponse;

    const body = await request.json();
    const { productId, rating, comment } = body;

    if (!productId || rating === undefined || !comment) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Bad Request",
        message: "Missing required fields: productId, rating, comment",
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Bad Request",
        message: "Rating must be an integer between 1 and 5",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const product = await prisma.product.findUnique({
      where: { id: productId },
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

    const review = await prisma.review.create({
      data: {
        userId: user!.userId,
        productId,
        rating,
        comment,
      },
      include: { user: true },
    });

    const apiResponse: ApiResponse<Review> = {
      success: true,
      data: review,
      message: "Review created successfully",
    };

    return NextResponse.json(apiResponse, { status: 201 });
  } catch (error) {
    console.error("Error creating review:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: "Internal Server Error",
      message: "Failed to create review",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
