import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
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

  // --- Legacy file-JSON (dashboard) ---
  @Get()
  list() {
    return this.orders.listLegacy();
  }

  @Post()
  @HttpCode(201)
  create(@Body() body: Record<string, unknown>) {
    return this.orders.createLegacy(body);
  }

  @Patch(":id")
  patch(@Param("id") id: string, @Body() body: { status?: string }) {
    return this.orders.patchLegacy(id, String(body?.status ?? ""));
  }

  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.orders.deleteLegacy(id);
  }

  // --- Prisma checkout orders ---
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

  @Put(":id")
  @UseGuards(AdminGuard)
  updateStatus(@Param("id") id: string, @Body() body: { status?: string }) {
    return this.orders.updatePrismaStatus(id, String(body?.status ?? ""));
  }
}
