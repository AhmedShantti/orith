import { SignJWT, jwtVerify } from "jose";
import { NextRequest } from "next/server";

const secretKey = new TextEncoder().encode(
  process.env.JWT_SECRET || "your_jwt_secret_here"
);

export interface JWTPayload {
  userId: string;
  email: string;
  role: "ADMIN" | "CUSTOMER";
  iat?: number;
  exp?: number;
}

export async function signToken(payload: Omit<JWTPayload, "iat" | "exp">) {
  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);

  return token;
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, secretKey);
    return verified.payload as unknown as JWTPayload;
  } catch (err) {
    return null;
  }
}

export async function getTokenFromRequest(
  request: NextRequest
): Promise<string | null> {
  const authHeader = request.headers.get("authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  return authHeader.substring(7);
}

export async function getUserFromRequest(
  request: NextRequest
): Promise<JWTPayload | null> {
  const token = await getTokenFromRequest(request);
  if (!token) return null;
  return verifyToken(token);
}
