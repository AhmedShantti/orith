import {
  Body,
  Controller,
  Post,
  Req,
  Res,
  UseGuards,
} from "@nestjs/common";
import type { Request, Response } from "express";
import { CheckoutService } from "./checkout.service";
import { ZodValidationPipe } from "../../common/zod-validation.pipe";
import {
  validateCouponSchema,
  createOrderSchema,
  ValidateCouponInput,
  CreateOrderInput,
} from "../../common/checkout/validation";
import { OptionalAuthGuard, CurrentUser } from "../../common/auth/guards";
import type { JWTPayload } from "../../common/auth/jwt.util";
import { getClientIp, parseCookies } from "../../common/checkout/orderHelpers";

const ORDER_ACCESS_COOKIE = "orith_order_access";

@Controller("checkout")
export class CheckoutController {
  constructor(private readonly checkout: CheckoutService) {}

  @Post("validate-coupon")
  validateCoupon(
    @Body(new ZodValidationPipe(validateCouponSchema))
    body: ValidateCouponInput,
    @Req() req: Request
  ) {
    return this.checkout.validateCouponRequest(
      body,
      getClientIp(req) ?? "unknown"
    );
  }

  @Post("create-order")
  @UseGuards(OptionalAuthGuard)
  async createOrder(
    @Body(new ZodValidationPipe(createOrderSchema)) body: CreateOrderInput,
    @CurrentUser() user: JWTPayload | null,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response
  ) {
    const result = await this.checkout.createOrder(
      body,
      getClientIp(req) ?? "unknown",
      (req.headers["user-agent"] as string) ?? null,
      user
    );

    if (result.orderId) {
      const existing = parseCookies(req)[ORDER_ACCESS_COOKIE] ?? "";
      const ids = new Set(existing.split(",").filter(Boolean));
      ids.add(result.orderId);
      const isProd = process.env.NODE_ENV === "production";
      res.cookie(ORDER_ACCESS_COOKIE, Array.from(ids).join(","), {
        httpOnly: true,
        sameSite: isProd ? "none" : "lax",
        secure: isProd,
        path: "/",
        maxAge: 60 * 60 * 24 * 7 * 1000,
      });
    }

    res.status(result.status);
    return result.body;
  }
}
