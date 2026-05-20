import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";
import { signToken } from "@/lib/auth";
import { ApiResponse, User } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Bad Request",
        message: "Missing required fields: name, email, password",
      };
      return NextResponse.json(response, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        error: "Conflict",
        message: "User with this email already exists",
      };
      return NextResponse.json(response, { status: 409 });
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "CUSTOMER",
      },
    });

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
      message: "User registered successfully",
    };

    return NextResponse.json(apiResponse, { status: 201 });
  } catch (error) {
    console.error("Error during registration:", error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      error: "Internal Server Error",
      message: "Failed to register user",
    };
    return NextResponse.json(response, { status: 500 });
  }
}
