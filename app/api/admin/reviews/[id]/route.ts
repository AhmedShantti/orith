import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/middleware";
import { ApiResponse } from "@/types";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { user, response: authResponse } = await requireAdmin(request);
    if (authResponse) return authResponse;

    const review = await prisma.review.findUnique({
      where: { id: params.id },
    });

    if (!review) {
      return NextResponse.json(
        {
          success: false,
          data: null,
          error: "Not Found",
          message: "Review not found",
        } satisfies ApiResponse<null>,
        { status: 404 }
      );
    }

    await prisma.review.delete({ where: { id: params.id } });

    return NextResponse.json({
      success: true,
      data: null,
      message: "Review deleted successfully",
    } satisfies ApiResponse<null>);
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Internal Server Error",
        message: "Failed to delete review",
      },
      { status: 500 }
    );
  }
}
