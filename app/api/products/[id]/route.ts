import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware";
import { ApiResponse, BackendProduct } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const product = await prisma.product.findUnique({
      where: { id: params.id },
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

    const apiResponse: ApiResponse<BackendProduct> = {
      success: true,
      data: product,
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Error fetching product:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: "Internal Server Error",
      message: "Failed to fetch product",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, response: authResponse } = await requireAdmin(request);
    if (authResponse) return authResponse;

    const body = await request.json();
    const {
      nameEn, nameAr, descriptionEn, descriptionAr,
      price, originalPrice, image, sizes, category,
      badge, notesTop, notesHeart, notesBase, stock,
    } = body;

    const product = await prisma.product.findUnique({
      where: { id: params.id },
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

    const updatedProduct = await prisma.product.update({
      where: { id: params.id },
      data: {
        ...(nameEn !== undefined && { nameEn }),
        ...(nameAr !== undefined && { nameAr }),
        ...(descriptionEn !== undefined && { descriptionEn }),
        ...(descriptionAr !== undefined && { descriptionAr }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(originalPrice !== undefined && { originalPrice: originalPrice ? parseFloat(originalPrice) : null }),
        ...(image !== undefined && { image }),
        ...(sizes !== undefined && { sizes }),
        ...(category !== undefined && { category }),
        ...(badge !== undefined && { badge: badge || null }),
        ...(notesTop !== undefined && { notesTop }),
        ...(notesHeart !== undefined && { notesHeart }),
        ...(notesBase !== undefined && { notesBase }),
        ...(stock !== undefined && { stock: parseInt(stock) }),
      },
    });

    const apiResponse: ApiResponse<BackendProduct> = {
      success: true,
      data: updatedProduct,
      message: "Product updated successfully",
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Error updating product:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: "Internal Server Error",
      message: "Failed to update product",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, response: authResponse } = await requireAdmin(request);
    if (authResponse) return authResponse;

    const product = await prisma.product.findUnique({
      where: { id: params.id },
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

    await prisma.product.delete({
      where: { id: params.id },
    });

    const apiResponse: ApiResponse<null> = {
      success: true,
      data: null,
      message: "Product deleted successfully",
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Error deleting product:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: "Internal Server Error",
      message: "Failed to delete product",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
