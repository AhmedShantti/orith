import { NextRequest, NextResponse } from "next/server";
import { validateCouponSchema } from "@/lib/checkout/validation";
import {
  validateCoupon,
  COUPON_ERROR_MESSAGES,
} from "@/lib/checkout/coupons";
import { rateLimit } from "@/lib/checkout/rateLimit";
import { getClientIp } from "@/lib/checkout/orderHelpers";

// Normalise response time to mitigate timing-based coupon enumeration.
const MIN_RESPONSE_MS = 250;

async function normalizeTiming<T>(start: number, value: T): Promise<T> {
  const elapsed = Date.now() - start;
  if (elapsed < MIN_RESPONSE_MS) {
    await new Promise((r) => setTimeout(r, MIN_RESPONSE_MS - elapsed));
  }
  return value;
}

export async function POST(request: NextRequest) {
  const start = Date.now();
  const ip = getClientIp(request) ?? "unknown";

  const limit = rateLimit(`coupon:${ip}`, 10, 60_000);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        success: false,
        error: "RATE_LIMITED",
        message: "Too many attempts. Please wait a moment and try again.",
      },
      {
        status: 429,
        headers: { "Retry-After": String(Math.ceil(limit.retryAfterMs / 1000)) },
      }
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "INVALID_BODY", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = validateCouponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "VALIDATION_ERROR",
        message: "Invalid request",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }

  try {
    const result = await validateCoupon(parsed.data.code, parsed.data.subtotal);

    if (!result.ok) {
      return normalizeTiming(
        start,
        NextResponse.json(
          {
            success: false,
            error: result.error,
            message: COUPON_ERROR_MESSAGES[result.error],
            ...(result.requiredAmount != null
              ? { requiredAmount: result.requiredAmount }
              : {}),
          },
          { status: 200 }
        )
      );
    }

    return normalizeTiming(
      start,
      NextResponse.json({ success: true, coupon: result.coupon })
    );
  } catch (error) {
    console.error(
      `[${new Date().toISOString()}] [ERROR] [validate-coupon]: ${
        error instanceof Error ? error.message : "unknown"
      }`
    );
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "Something went wrong. Please try again.",
      },
      { status: 500 }
    );
  }
}

export function GET() {
  return NextResponse.json(
    { success: false, error: "METHOD_NOT_ALLOWED" },
    { status: 405 }
  );
}
