import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";
import { ApiResponse, BackendCartItem } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth(request);
    if (authResponse) return authResponse;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user!.userId },
      include: { product: true },
    });

    const apiResponse: ApiResponse<BackendCartItem[]> = {
      success: true,
      data: cartItems,
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Error fetching cart:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: "Internal Server Error",
      message: "Failed to fetch cart",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth(request);
    if (authResponse) return authResponse;

    const body = await request.json();
    const { productId, quantity } = body;

    if (!productId || !quantity) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Bad Request",
        message: "Missing required fields: productId, quantity",
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

    const existingCartItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: user!.userId,
          productId,
        },
      },
    });

    let cartItem;
    if (existingCartItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingCartItem.id },
        data: { quantity: existingCartItem.quantity + parseInt(quantity) },
        include: { product: true },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: user!.userId,
          productId,
          quantity: parseInt(quantity),
        },
        include: { product: true },
      });
    }

    const apiResponse: ApiResponse<BackendCartItem> = {
      success: true,
      data: cartItem,
      message: "Item added to cart",
    };

    return NextResponse.json(apiResponse, { status: 201 });
  } catch (error) {
    console.error("Error adding to cart:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: "Internal Server Error",
      message: "Failed to add item to cart",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth(request);
    if (authResponse) return authResponse;

    await prisma.cartItem.deleteMany({
      where: { userId: user!.userId },
    });

    const apiResponse: ApiResponse<null> = {
      success: true,
      data: null,
      message: "Cart cleared",
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Error clearing cart:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: "Internal Server Error",
      message: "Failed to clear cart",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
