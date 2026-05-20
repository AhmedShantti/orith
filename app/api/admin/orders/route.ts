import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware";
import { PaginatedResponse, Order } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAdmin(request);
    if (authResponse) return authResponse;

    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "15");
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (status && status !== "ALL") {
      where.status = status;
    }

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          user: { select: { name: true, email: true, id: true, role: true, createdAt: true, updatedAt: true } },
          items: { include: { product: true } },
        },
      }),
      prisma.order.count({ where }),
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
    console.error("Error fetching admin orders:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Internal Server Error",
        message: "Failed to fetch orders",
      },
      { status: 500 }
    );
  }
}
