import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAllProducts } from "@/lib/productStore";
import { createOrderSchema } from "@/lib/checkout/validation";
import { validateCoupon } from "@/lib/checkout/coupons";
import {
  computeOrderTotals,
  egpToPiastres,
  piastresToEgp,
} from "@/lib/checkout/calculations";
import {
  generateOrderNumber,
  getClientIp,
  isRetryableStatus,
} from "@/lib/checkout/orderHelpers";
import { rateLimit } from "@/lib/checkout/rateLimit";
import { getUserFromRequest } from "@/lib/auth";
import { CURRENCY } from "@/lib/checkout/constants";
import type { CreatedOrder } from "@/types/checkout";

const ORDER_ACCESS_COOKIE = "orith_order_access";

function logError(message: string): void {
  console.error(
    `[${new Date().toISOString()}] [ERROR] [create-order]: ${message}`
  );
}

function buildCreatedOrder(order: {
  id: string;
  orderNumber: string | null;
  totalAmount: number | null;
  currency: string | null;
  subtotal: number | null;
  discountAmount: number | null;
  shippingFee: number | null;
}): CreatedOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber ?? "",
    totalAmount: order.totalAmount ?? 0,
    currency: order.currency ?? CURRENCY,
    status: "PENDING_PAYMENT",
    breakdown: {
      subtotal: order.subtotal ?? 0,
      discountAmount: order.discountAmount ?? 0,
      shippingFee: order.shippingFee ?? 0,
      totalAmount: order.totalAmount ?? 0,
    },
  };
}

function appendOrderAccessCookie(
  response: NextResponse,
  request: NextRequest,
  orderId: string
): void {
  const existing = request.cookies.get(ORDER_ACCESS_COOKIE)?.value ?? "";
  const ids = new Set(existing.split(",").filter(Boolean));
  ids.add(orderId);
  response.cookies.set(ORDER_ACCESS_COOKIE, Array.from(ids).join(","), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function POST(request: NextRequest) {
  const ip = getClientIp(request) ?? "unknown";

  const limit = rateLimit(`create-order:${ip}`, 5, 10 * 60_000);
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

  // 2. Input validation (security: NEVER read prices from the body).
  const parsed = createOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      {
        success: false,
        error: "VALIDATION_ERROR",
        message: "Please check the highlighted fields.",
        details: parsed.error.flatten(),
      },
      { status: 400 }
    );
  }
  const data = parsed.data;

  try {
    // 1. Idempotency check.
    const existing = await prisma.order.findUnique({
      where: { idempotencyKey: data.idempotencyKey },
    });
    if (existing) {
      if (!isRetryableStatus(existing.status)) {
        const res = NextResponse.json(
          { success: true, order: buildCreatedOrder(existing) },
          { status: 200 }
        );
        appendOrderAccessCookie(res, request, existing.id);
        return res;
      }
      // Retryable (PAYMENT_FAILED / PENDING_PAYMENT): fall through and reuse it.
    }

    // 3. Product validation — authoritative pricing from the catalogue.
    const catalogue = await getAllProducts();
    const byId = new Map(catalogue.map((p) => [p.id, p]));
    const outOfStock: string[] = [];
    const resolvedItems = data.items.map((item) => {
      const product = byId.get(item.productId);
      if (!product) {
        outOfStock.push(item.productId);
        return null;
      }
      // TODO: Add stock check here if/when the catalogue tracks stock.
      const unitPrice = egpToPiastres(product.price);
      return {
        productId: item.productId,
        productName: product.nameEn,
        variantName: item.variantName ?? product.sizes[0] ?? null,
        quantity: item.quantity,
        unitPrice,
        totalPrice: unitPrice * item.quantity,
        imageUrl: product.image,
        priceEgp: product.price,
      };
    });

    if (outOfStock.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: "PRODUCT_UNAVAILABLE",
          message: "Some items are no longer available.",
          unavailable: outOfStock,
        },
        { status: 422 }
      );
    }
    const items = resolvedItems.filter(
      (i): i is NonNullable<typeof i> => i !== null
    );

    // 5a. Subtotal (piastres).
    const subtotal = items.reduce((sum, i) => sum + i.totalPrice, 0);

    // 4. Coupon re-validation (server-side, never trust the client).
    let discountAmount = 0;
    let couponId: string | null = null;
    let couponCode: string | null = null;
    if (data.couponCode && data.couponCode.length > 0) {
      const couponResult = await validateCoupon(data.couponCode, subtotal);
      if (couponResult.ok) {
        discountAmount = couponResult.coupon.discountAmount;
        couponId = couponResult.couponId;
        couponCode = couponResult.coupon.code;
      }
      // Invalid coupon at this stage is silently dropped (order proceeds at
      // full price) — the client already validated; this guards tampering.
    }

    // 5b. Totals (shipping computed server-side from governorate).
    const totals = computeOrderTotals({
      subtotal,
      discountAmount,
      governorate: data.shipping.governorate,
    });

    const user = await getUserFromRequest(request);
    const year = new Date().getFullYear();

    // 6 + 7. Order-number generation + transactional write, with a small retry
    // loop to survive orderNumber uniqueness races.
    let created: Awaited<ReturnType<typeof writeOrder>> | null = null;
    const writeOrder = async (orderNumber: string) =>
      prisma.$transaction(async (tx) => {
        const orderData = {
          orderNumber,
          status: "PENDING_PAYMENT" as const,
          total: piastresToEgp(totals.totalAmount),
          customerFirstName: data.customer.firstName,
          customerLastName: data.customer.lastName,
          customerEmail: data.customer.email,
          customerPhone: data.customer.phone,
          shippingAddress1: data.shipping.address1,
          shippingAddress2: data.shipping.address2 || null,
          shippingCity: data.shipping.city,
          shippingGovernorate: data.shipping.governorate,
          shippingPostalCode: data.shipping.postalCode || null,
          shippingCountry: "EG",
          subtotal: totals.subtotal,
          discountAmount: totals.discountAmount,
          shippingFee: totals.shippingFee,
          taxAmount: totals.taxAmount,
          totalAmount: totals.totalAmount,
          currency: CURRENCY,
          couponCode,
          couponId,
          paymentMethod: data.paymentMethod,
          paymentStatus: "UNPAID" as const,
          notes: data.shipping.notes || null,
          ipAddress: ip,
          userAgent: request.headers.get("user-agent"),
          userId: user?.userId ?? null,
          idempotencyKey: data.idempotencyKey,
        };

        let order;
        if (existing && isRetryableStatus(existing.status)) {
          // Re-attempt: refresh the existing order and replace its items.
          await tx.orderItem.deleteMany({ where: { orderId: existing.id } });
          order = await tx.order.update({
            where: { id: existing.id },
            data: { ...orderData, orderNumber: existing.orderNumber ?? orderNumber },
          });
        } else {
          order = await tx.order.create({ data: orderData });
        }

        await tx.orderItem.createMany({
          data: items.map((i) => ({
            orderId: order.id,
            productId: null, // catalogue is static; rely on snapshot fields
            productName: i.productName,
            productSku: i.productId, // store catalogue id as the snapshot SKU
            variantName: i.variantName,
            quantity: i.quantity,
            price: i.priceEgp,
            unitPrice: i.unitPrice,
            totalPrice: i.totalPrice,
            imageUrl: i.imageUrl,
          })),
        });

        // Increment coupon usage only on a fresh order (not on retry).
        if (couponId && !existing) {
          await tx.coupon.update({
            where: { id: couponId },
            data: { usageCount: { increment: 1 } },
          });
        }

        return order;
      });

    const baseSeq =
      (await prisma.order.count({ where: { orderNumber: { not: null } } })) + 1;
    for (let attempt = 0; attempt < 5 && !created; attempt++) {
      const orderNumber =
        existing?.orderNumber ?? generateOrderNumber(year, baseSeq + attempt);
      try {
        created = await writeOrder(orderNumber);
      } catch (err: unknown) {
        const code = (err as { code?: string })?.code;
        if (code === "P2002" && !existing) continue; // orderNumber clash, retry
        throw err;
      }
    }

    if (!created) {
      throw new Error("Failed to allocate a unique order number");
    }

    const res = NextResponse.json(
      { success: true, order: buildCreatedOrder(created) },
      { status: 201 }
    );
    appendOrderAccessCookie(res, request, created.id);
    return res;
  } catch (error) {
    const code = (error as { code?: string })?.code;
    if (code === "P2002") {
      // Idempotency key already used in a concurrent request.
      return NextResponse.json(
        {
          success: false,
          error: "DUPLICATE_ORDER",
          message: "This order was already submitted.",
        },
        { status: 409 }
      );
    }
    logError(error instanceof Error ? error.message : "unknown");
    return NextResponse.json(
      {
        success: false,
        error: "SERVER_ERROR",
        message: "Something went wrong on our end. Please try again.",
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
