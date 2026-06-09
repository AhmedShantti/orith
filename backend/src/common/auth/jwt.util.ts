// JWT signing/verification — ported verbatim from the Next.js lib/auth.ts so
// existing tokens remain valid (same secret, alg, 7d expiry).

import { SignJWT, jwtVerify } from "jose";

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

export async function signToken(
  payload: Omit<JWTPayload, "iat" | "exp">
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(secretKey);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const verified = await jwtVerify(token, secretKey);
    return verified.payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export function bearerFromHeader(authHeader?: string): string | null {
  if (!authHeader || !authHeader.startsWith("Bearer ")) return null;
  return authHeader.substring(7);
}
