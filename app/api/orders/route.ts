import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";
import { ApiResponse, Order, PaginatedResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth(request);
    if (authResponse) return authResponse;

    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const skip = (page - 1) * limit;

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: { userId: user!.userId },
        include: { items: { include: { product: true } }, user: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({ where: { userId: user!.userId } }),
    ]);

    const response: PaginatedResponse<Order> = {
      success: true,
      data: orders,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("Error fetching orders:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: "Internal Server Error",
      message: "Failed to fetch orders",
    };
    return NextResponse.json(response, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth(request);
    if (authResponse) return authResponse;

    const cartItems = await prisma.cartItem.findMany({
      where: { userId: user!.userId },
      include: { product: true },
    });

    if (cartItems.length === 0) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Bad Request",
        message: "Cart is empty",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const total = cartItems.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const order = await prisma.order.create({
      data: {
        userId: user!.userId,
        total,
        status: "PENDING",
        items: {
          createMany: {
            data: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
      },
      include: { items: { include: { product: true } }, user: true },
    });

    await prisma.cartItem.deleteMany({
      where: { userId: user!.userId },
    });

    const apiResponse: ApiResponse<Order> = {
      success: true,
      data: order,
      message: "Order created successfully",
    };

    return NextResponse.json(apiResponse, { status: 201 });
  } catch (error) {
    console.error("Error creating order:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: "Internal Server Error",
      message: "Failed to create order",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
