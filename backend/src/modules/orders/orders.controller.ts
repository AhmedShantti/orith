import {
  Body,
  Controller,
  Get,
  Param,
  Put,
  Req,
  UseGuards,
} from "@nestjs/common";
import type { Request } from "express";
import { OrdersService } from "./orders.service";
import {
  AdminGuard,
  OptionalAuthGuard,
  CurrentUser,
} from "../../common/auth/guards";
import type { JWTPayload } from "../../common/auth/jwt.util";
import { parseCookies } from "../../common/checkout/orderHelpers";

const ORDER_ACCESS_COOKIE = "orith_order_access";

@Controller("orders")
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  // List real checkout orders for the dashboard (admin only).
  @Get()
  @UseGuards(AdminGuard)
  list() {
    return this.orders.listDashboard();
  }

  // Single order with ownership check (admin, owner, or guest access cookie).
  @Get(":id")
  @UseGuards(OptionalAuthGuard)
  getOne(
    @Param("id") id: string,
    @CurrentUser() user: JWTPayload | null,
    @Req() req: Request
  ) {
    const cookieIds = (parseCookies(req)[ORDER_ACCESS_COOKIE] ?? "")
      .split(",")
      .filter(Boolean);
    return this.orders.getPrismaOrder(id, user, cookieIds);
  }

  // Admin status / payment-status update.
  @Put(":id")
  @UseGuards(AdminGuard)
  updateStatus(
    @Param("id") id: string,
    @Body() body: { status?: string; paymentStatus?: string }
  ) {
    return this.orders.updatePrismaStatus(
      id,
      String(body?.status ?? ""),
      body?.paymentStatus ? String(body.paymentStatus) : undefined
    );
  }
}
