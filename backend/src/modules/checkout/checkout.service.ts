import {
  Injectable,
  BadRequestException,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { CatalogueService } from "../../catalogue/catalogue.service";
import {
  validateCoupon,
  COUPON_ERROR_MESSAGES,
} from "../../common/checkout/coupons";
import {
  computeOrderTotals,
  egpToPiastres,
  piastresToEgp,
} from "../../common/checkout/calculations";
import {
  generateOrderNumber,
  isRetryableStatus,
} from "../../common/checkout/orderHelpers";
import { rateLimit } from "../../common/checkout/rateLimit";
import { CURRENCY } from "../../common/checkout/constants";
import type {
  CreateOrderInput,
  ValidateCouponInput,
} from "../../common/checkout/validation";
import type { JWTPayload } from "../../common/auth/jwt.util";

const MIN_COUPON_RESPONSE_MS = 250;

export interface CreatedOrderResult {
  body: Record<string, unknown>;
  status: number;
  orderId: string | null; // set when an order exists → controller sets cookie
}

@Injectable()
export class CheckoutService {
  private readonly logger = new Logger(CheckoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly catalogue: CatalogueService
  ) {}

  // ---- validate-coupon ----
  async validateCouponRequest(input: ValidateCouponInput, ip: string) {
    const limit = rateLimit(`coupon:${ip}`, 10, 60_000);
    if (!limit.allowed) {
      throw new HttpException(
        {
          success: false,
          error: "RATE_LIMITED",
          message: "Too many attempts. Please wait a moment and try again.",
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }
    const start = Date.now();
    const result = await validateCoupon(
      this.prisma,
      input.code,
      input.subtotal
    );
    const respond = async <T>(value: T): Promise<T> => {
      const elapsed = Date.now() - start;
      if (elapsed < MIN_COUPON_RESPONSE_MS) {
        await new Promise((r) => setTimeout(r, MIN_COUPON_RESPONSE_MS - elapsed));
      }
      return value;
    };

    if (!result.ok) {
      return respond({
        success: false,
        error: result.error,
        message: COUPON_ERROR_MESSAGES[result.error],
        ...(result.requiredAmount != null
          ? { requiredAmount: result.requiredAmount }
          : {}),
      });
    }
    return respond({ success: true, coupon: result.coupon });
  }

  // ---- create-order ----
  async createOrder(
    data: CreateOrderInput,
    ip: string,
    userAgent: string | null,
    user: JWTPayload | null
  ): Promise<CreatedOrderResult> {
    const limit = rateLimit(`create-order:${ip}`, 5, 10 * 60_000);
    if (!limit.allowed) {
      throw new HttpException(
        {
          success: false,
          error: "RATE_LIMITED",
          message: "Too many attempts. Please wait a moment and try again.",
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    try {
      // 1. Idempotency check.
      const existing = await this.prisma.order.findUnique({
        where: { idempotencyKey: data.idempotencyKey },
      });
      if (existing && !isRetryableStatus(existing.status)) {
        return {
          status: 200,
          orderId: existing.id,
          body: { success: true, order: this.buildCreatedOrder(existing) },
        };
      }

      // 3. Product validation — authoritative pricing from the catalogue.
      const catalogue = await this.catalogue.getAllProducts();
      const byId = new Map(catalogue.map((p) => [p.id, p]));
      const unavailable: string[] = [];
      const items = data.items.map((item) => {
        const product = byId.get(item.productId);
        if (!product) {
          unavailable.push(item.productId);
          return null;
        }
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
      if (unavailable.length > 0) {
        throw new HttpException(
          {
            success: false,
            error: "PRODUCT_UNAVAILABLE",
            message: "Some items are no longer available.",
            unavailable,
          },
          HttpStatus.UNPROCESSABLE_ENTITY
        );
      }
      const resolved = items.filter(
        (i): i is NonNullable<typeof i> => i !== null
      );

      // 5a. Subtotal.
      const subtotal = resolved.reduce((s, i) => s + i.totalPrice, 0);

      // 4. Coupon re-validation.
      let discountAmount = 0;
      let couponId: string | null = null;
      let couponCode: string | null = null;
      if (data.couponCode && data.couponCode.length > 0) {
        const couponResult = await validateCoupon(
          this.prisma,
          data.couponCode,
          subtotal
        );
        if (couponResult.ok) {
          discountAmount = couponResult.coupon.discountAmount;
          couponId = couponResult.couponId;
          couponCode = couponResult.coupon.code;
        }
      }

      // 5b. Totals.
      const totals = computeOrderTotals({
        subtotal,
        discountAmount,
        governorate: data.shipping.governorate,
      });

      // Cash on Delivery needs no payment processing: the order is confirmed
      // immediately (PROCESSING) and payment is collected on delivery (UNPAID).
      // Online methods stay PENDING_PAYMENT until the Paymob flow completes.
      const isCod = data.paymentMethod === "COD";

      const year = new Date().getFullYear();
      const orderData = {
        status: isCod ? ("PROCESSING" as const) : ("PENDING_PAYMENT" as const),
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
        userAgent,
        userId: user?.userId ?? null,
        idempotencyKey: data.idempotencyKey,
      };

      const writeOrder = (orderNumber: string) =>
        this.prisma.$transaction(async (tx) => {
          let order;
          if (existing && isRetryableStatus(existing.status)) {
            await tx.orderItem.deleteMany({ where: { orderId: existing.id } });
            order = await tx.order.update({
              where: { id: existing.id },
              data: {
                ...orderData,
                orderNumber: existing.orderNumber ?? orderNumber,
              },
            });
          } else {
            order = await tx.order.create({
              data: { ...orderData, orderNumber },
            });
          }
          await tx.orderItem.createMany({
            data: resolved.map((i) => ({
              orderId: order.id,
              productId: null,
              productName: i.productName,
              productSku: i.productId,
              variantName: i.variantName,
              quantity: i.quantity,
              price: i.priceEgp,
              unitPrice: i.unitPrice,
              totalPrice: i.totalPrice,
              imageUrl: i.imageUrl,
            })),
          });
          if (couponId && !existing) {
            await tx.coupon.update({
              where: { id: couponId },
              data: { usageCount: { increment: 1 } },
            });
          }
          return order;
        });

      const baseSeq =
        (await this.prisma.order.count({
          where: { orderNumber: { not: null } },
        })) + 1;

      let created: Awaited<ReturnType<typeof writeOrder>> | null = null;
      for (let attempt = 0; attempt < 5 && !created; attempt++) {
        const orderNumber =
          existing?.orderNumber ?? generateOrderNumber(year, baseSeq + attempt);
        try {
          created = await writeOrder(orderNumber);
        } catch (err: unknown) {
          const code = (err as { code?: string })?.code;
          if (code === "P2002" && !existing) continue;
          throw err;
        }
      }
      if (!created) {
        throw new Error("Failed to allocate a unique order number");
      }

      return {
        status: 201,
        orderId: created.id,
        body: { success: true, order: this.buildCreatedOrder(created) },
      };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      const code = (error as { code?: string })?.code;
      if (code === "P2002") {
        throw new HttpException(
          {
            success: false,
            error: "DUPLICATE_ORDER",
            message: "This order was already submitted.",
          },
          HttpStatus.CONFLICT
        );
      }
      this.logger.error(
        `create-order failed: ${
          error instanceof Error ? error.message : "unknown"
        }`
      );
      throw new HttpException(
        {
          success: false,
          error: "SERVER_ERROR",
          message: "Something went wrong on our end. Please try again.",
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  private buildCreatedOrder(order: {
    id: string;
    orderNumber: string | null;
    totalAmount: number | null;
    currency: string | null;
    subtotal: number | null;
    discountAmount: number | null;
    shippingFee: number | null;
    status: string;
    paymentMethod: string | null;
    paymentStatus: string | null;
  }) {
    return {
      id: order.id,
      orderNumber: order.orderNumber ?? "",
      totalAmount: order.totalAmount ?? 0,
      currency: order.currency ?? CURRENCY,
      status: order.status,
      // Surfaced so the frontend can show the correct confirmation message
      // (e.g. the COD "pay on delivery" note vs. an online-payment redirect).
      paymentMethod: order.paymentMethod,
      paymentStatus: order.paymentStatus,
      breakdown: {
        subtotal: order.subtotal ?? 0,
        discountAmount: order.discountAmount ?? 0,
        shippingFee: order.shippingFee ?? 0,
        totalAmount: order.totalAmount ?? 0,
      },
    };
  }
}
