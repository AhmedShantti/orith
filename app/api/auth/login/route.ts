import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePasswords } from "@/lib/hash";
import { signToken } from "@/lib/auth";
import { ApiResponse, User } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Bad Request",
        message: "Missing required fields: email, password",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Unauthorized",
        message: "Invalid email or password",
      };
      return NextResponse.json(response, { status: 401 });
    }

    const passwordMatch = await comparePasswords(password, user.password);

    if (!passwordMatch) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Unauthorized",
        message: "Invalid email or password",
      };
      return NextResponse.json(response, { status: 401 });
    }

    const token = await signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    const responseUser: User = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
    };

    const apiResponse: ApiResponse<{ user: User; token: string }> = {
      success: true,
      data: { user: responseUser, token },
      message: "Login successful",
    };

    return NextResponse.json(apiResponse);
  } catch (error) {
    console.error("Error during login:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: "Internal Server Error",
      message: "Failed to login",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
