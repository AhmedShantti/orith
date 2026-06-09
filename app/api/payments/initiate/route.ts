import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { paymobClient, PaymobAPIError } from "@/lib/paymob/client";
import { applePayIframeUrl } from "@/lib/paymob/constants";
import { paymobEnv } from "@/lib/env";
import { initiatePaymentSchema } from "@/lib/checkout/validation";
import { normalizeEgyptPhone } from "@/lib/checkout/orderHelpers";
import { CURRENCY } from "@/lib/checkout/constants";
import type {
  PaymobBillingData,
  PaymobOrderItem,
  PaymobShippingData,
} from "@/lib/paymob/types";

function logError(message: string): void {
  console.error(
    `[${new Date().toISOString()}] [ERROR] [payments/initiate]: ${message}`
  );
}

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { success: false, error: "INVALID_BODY", message: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = initiatePaymentSchema.safeParse(body);
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
  const { orderId, paymentMethod, walletPhone } = parsed.data;

  try {
    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return NextResponse.json(
        { success: false, error: "ORDER_NOT_FOUND", message: "Order not found." },
        { status: 404 }
      );
    }

    if (order.paymentStatus === "PAID" || order.status === "PROCESSING") {
      return NextResponse.json(
        {
          success: false,
          error: "ALREADY_PAID",
          message: "This order has already been paid.",
        },
        { status: 409 }
      );
    }

    if (paymentMethod === "MOBILE_WALLET" && !walletPhone) {
      return NextResponse.json(
        {
          success: false,
          error: "WALLET_PHONE_REQUIRED",
          message: "A wallet phone number is required.",
        },
        { status: 400 }
      );
    }

    const amountCents = order.totalAmount ?? Math.round(order.total * 100);

    // Paymob Step 1 — auth token (cached).
    const authToken = await paymobClient.getAuthToken();

    // Paymob Step 2 — create order (reuse if already created).
    let paymobOrderId = order.paymobOrderId
      ? Number(order.paymobOrderId)
      : null;

    if (!paymobOrderId) {
      const shippingData: PaymobShippingData = {
        first_name: order.customerFirstName ?? "NA",
        last_name: order.customerLastName ?? "NA",
        email: order.customerEmail ?? "NA",
        phone_number: order.customerPhone ?? "NA",
        city: order.shippingCity ?? "NA",
        country: "EG",
        state: order.shippingGovernorate ?? "NA",
        street: order.shippingAddress1 ?? "NA",
      };
      const items: PaymobOrderItem[] = order.items.map((it) => ({
        name: it.productName ?? "Item",
        amount_cents: it.unitPrice ?? Math.round(it.price * 100),
        description: it.variantName ?? "",
        quantity: it.quantity,
      }));

      const paymobOrder = await paymobClient.createOrder(authToken, {
        amountCents,
        currency: CURRENCY,
        merchantOrderId: order.orderNumber ?? order.id,
        items,
        shippingData,
      });
      paymobOrderId = paymobOrder.id;
      await prisma.order.update({
        where: { id: order.id },
        data: { paymobOrderId: String(paymobOrderId) },
      });
    }

    // Paymob Step 3 — payment key.
    const integrationId =
      paymentMethod === "MOBILE_WALLET"
        ? paymobEnv.mobileWalletIntegrationId
        : paymobEnv.applePayIntegrationId;

    if (!integrationId) {
      return NextResponse.json(
        {
          success: false,
          error: "PAYMENT_METHOD_UNAVAILABLE",
          message: "This payment method is not configured.",
        },
        { status: 400 }
      );
    }

    const billingData: PaymobBillingData = {
      first_name: order.customerFirstName ?? "NA",
      last_name: order.customerLastName ?? "NA",
      email: order.customerEmail ?? "NA",
      phone_number: order.customerPhone ?? "NA",
      apartment: "NA",
      floor: "NA",
      street: order.shippingAddress1 ?? "NA",
      building: "NA",
      shipping_method: "PKG",
      postal_code: order.shippingPostalCode || "NA",
      city: order.shippingCity ?? "NA",
      country: "EG",
      state: order.shippingGovernorate ?? "NA",
    };

    const paymentKey = await paymobClient.getPaymentKey({
      authToken,
      amountCents,
      orderId: paymobOrderId,
      billingData,
      integrationId,
      currency: CURRENCY,
    });

    // Move to awaiting confirmation now that payment is in flight.
    await prisma.order.update({
      where: { id: order.id },
      data: { status: "AWAITING_CONFIRMATION" },
    });

    if (paymentMethod === "MOBILE_WALLET") {
      // Paymob Step 4 — wallet pay request.
      const wallet = await paymobClient.initiateWalletPayment(
        paymentKey,
        normalizeEgyptPhone(walletPhone as string)
      );
      const redirectUrl =
        wallet.redirect_url || wallet.iframe_redirection_url || null;
      if (!redirectUrl) {
        logError("Wallet pay response missing redirect URL");
        return NextResponse.json(
          {
            success: false,
            error: "PAYMENT_PROVIDER_ERROR",
            message:
              "We couldn't connect to the payment provider. Please try again in a few moments.",
          },
          { status: 502 }
        );
      }
      return NextResponse.json({
        success: true,
        redirectUrl,
        orderId: order.id,
      });
    }

    // Apple Pay — return the iframe URL + payment key for the JS SDK.
    return NextResponse.json({
      success: true,
      iframeUrl: applePayIframeUrl(paymobEnv.applePayIframeId, paymentKey),
      paymentKey,
      orderId: order.id,
    });
  } catch (error) {
    if (error instanceof PaymobAPIError) {
      logError(`PaymobAPIError ${error.statusCode}: ${error.message}`);
      return NextResponse.json(
        {
          success: false,
          error: "PAYMENT_PROVIDER_ERROR",
          message:
            "We couldn't connect to the payment provider. Please try again in a few moments.",
        },
        { status: 502 }
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
