import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth, requireAdmin } from "@/lib/middleware";
import { ApiResponse, Order } from "@/types";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, response: authResponse } = await requireAuth(request);
    if (authResponse) return authResponse;

    const order = await prisma.order.findUnique({
      where: { id: params.id },
      include: { items: { include: { product: true } }, user: true },
    });

    if (!order) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Not Found",
        message: "Order not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    if (order.userId !== user!.userId && user!.role !== "ADMIN") {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Forbidden",
        message: "You cannot access this order",
      };
      return NextResponse.json(response, { status: 403 });
    }

    const apiResponse: ApiResponse<Order> = {
      success: true,
      data: order,
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Error fetching order:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: "Internal Server Error",
      message: "Failed to fetch order",
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
    const { status } = body;

    if (!status) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Bad Request",
        message: "Missing required field: status",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const validStatuses = ["PENDING", "PROCESSING", "SHIPPED", "DELIVERED"];
    if (!validStatuses.includes(status)) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Bad Request",
        message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      };
      return NextResponse.json(response, { status: 400 });
    }

    const order = await prisma.order.findUnique({
      where: { id: params.id },
    });

    if (!order) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Not Found",
        message: "Order not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const updatedOrder = await prisma.order.update({
      where: { id: params.id },
      data: { status },
      include: { items: { include: { product: true } }, user: true },
    });

    const apiResponse: ApiResponse<Order> = {
      success: true,
      data: updatedOrder,
      message: "Order status updated",
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Error updating order:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: "Internal Server Error",
      message: "Failed to update order",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
