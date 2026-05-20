import { NextRequest, NextResponse } from "next/server";
import { getUserFromRequest, JWTPayload } from "./auth";

export async function requireAuth(
  request: NextRequest
): Promise<{
  user: JWTPayload | null;
  response: NextResponse | null;
}> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "No valid authentication token provided",
          data: null,
        },
        { status: 401 }
      ),
    };
  }

  return { user, response: null };
}

export async function requireAdmin(
  request: NextRequest
): Promise<{
  user: JWTPayload | null;
  response: NextResponse | null;
}> {
  const user = await getUserFromRequest(request);

  if (!user) {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          error: "Unauthorized",
          message: "No valid authentication token provided",
          data: null,
        },
        { status: 401 }
      ),
    };
  }

  if (user.role !== "ADMIN") {
    return {
      user: null,
      response: NextResponse.json(
        {
          success: false,
          error: "Forbidden",
          message: "Admin access required",
          data: null,
        },
        { status: 403 }
      ),
    };
  }

  return { user, response: null };
}
