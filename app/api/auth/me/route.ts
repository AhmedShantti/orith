import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requireAuth } from "@/lib/middleware";
import { ApiResponse, User } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { user, response: authResponse } = await requireAuth(request);
    if (authResponse) return authResponse;

    const dbUser = await prisma.user.findUnique({
      where: { id: user!.userId },
    });

    if (!dbUser) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Not Found",
        message: "User not found",
      };
      return NextResponse.json(response, { status: 404 });
    }

    const responseUser: User = {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      role: dbUser.role,
      createdAt: dbUser.createdAt,
      updatedAt: dbUser.updatedAt,
    };

    const apiResponse: ApiResponse<User> = {
      success: true,
      data: responseUser,
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Error fetching current user:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: "Internal Server Error",
      message: "Failed to fetch user",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
