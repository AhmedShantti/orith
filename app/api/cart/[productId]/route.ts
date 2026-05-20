import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";
import { ApiResponse, BackendCartItem } from "@/types";

export async function PUT(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { user, response: authResponse } = await requireAuth(request);
    if (authResponse) return authResponse;

    const body = await request.json();
    const { quantity } = body;

    if (quantity === undefined) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Bad Request",
        message: "Missing required field: quantity",
      };
      return NextResponse.json(response, { status: 400 });
    }

    if (quantity < 0) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Bad Request",
        message: "Quantity must be non-negative",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: user!.userId,
          productId: params.productId,
        },
      },
    });

    if (!cartItem) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Not Found",
        message: "Cart item not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    if (quantity === 0) {
      await prisma.cartItem.delete({
        where: { id: cartItem.id },
      });

      const apiResponse: ApiResponse<null> = {
        success: true,
        data: null,
        message: "Cart item removed",
      };
      return NextResponse.json(apiResponse);
    }

    const updatedCartItem = await prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: parseInt(quantity as any) },
      include: { product: true },
    });

    const apiResponse: ApiResponse<BackendCartItem> = {
      success: true,
      data: updatedCartItem,
      message: "Cart item updated",
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Error updating cart item:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: "Internal Server Error",
      message: "Failed to update cart item",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { productId: string } }
) {
  try {
    const { user, response: authResponse } = await requireAuth(request);
    if (authResponse) return authResponse;

    const cartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: user!.userId,
          productId: params.productId,
        },
      },
    });

    if (!cartItem) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Not Found",
        message: "Cart item not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    await prisma.cartItem.delete({
      where: { id: cartItem.id },
    });

    const apiResponse: ApiResponse<null> = {
      success: true,
      data: null,
      message: "Cart item removed",
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Error deleting cart item:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: "Internal Server Error",
      message: "Failed to delete cart item",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
