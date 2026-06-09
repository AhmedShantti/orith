import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ok, ApiResponse } from "../../common/api-response";

@Injectable()
export class CartService {
  constructor(private readonly prisma: PrismaService) {}

  async list(userId: string) {
    const items = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });
    return ok(items);
  }

  async add(userId: string, productId?: string, quantity?: number) {
    if (!productId || quantity === undefined || quantity === null) {
      throw new BadRequestException({
        success: false,
        data: null,
        error: "Bad Request",
        message: "Missing required fields: productId, quantity",
      });
    }
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });
    if (!product) {
      throw new NotFoundException({
        success: false,
        data: null,
        error: "Not Found",
        message: "Product not found",
      });
    }
    const qty = parseInt(String(quantity));
    const existing = await this.prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    const item = existing
      ? await this.prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: existing.quantity + qty },
          include: { product: true },
        })
      : await this.prisma.cartItem.create({
          data: { userId, productId, quantity: qty },
          include: { product: true },
        });
    return ok(item, "Item added to cart");
  }

  async clear(userId: string) {
    await this.prisma.cartItem.deleteMany({ where: { userId } });
    return ok(null, "Cart cleared");
  }

  async updateItem(
    userId: string,
    productId: string,
    quantity?: number
  ): Promise<ApiResponse<unknown>> {
    if (quantity === undefined || quantity === null) {
      throw new BadRequestException({
        success: false,
        data: null,
        error: "Bad Request",
        message: "Missing required field: quantity",
      });
    }
    if (quantity < 0) {
      throw new BadRequestException({
        success: false,
        data: null,
        error: "Bad Request",
        message: "Quantity must be non-negative",
      });
    }
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!cartItem) {
      throw new NotFoundException({
        success: false,
        data: null,
        error: "Not Found",
        message: "Cart item not found",
      });
    }
    if (Number(quantity) === 0) {
      await this.prisma.cartItem.delete({ where: { id: cartItem.id } });
      return ok(null, "Cart item removed");
    }
    const updated = await this.prisma.cartItem.update({
      where: { id: cartItem.id },
      data: { quantity: parseInt(String(quantity)) },
      include: { product: true },
    });
    return ok(updated, "Cart item updated");
  }

  async removeItem(userId: string, productId: string) {
    const cartItem = await this.prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (!cartItem) {
      throw new NotFoundException({
        success: false,
        data: null,
        error: "Not Found",
        message: "Cart item not found",
      });
    }
    await this.prisma.cartItem.delete({ where: { id: cartItem.id } });
    return ok(null, "Cart item removed");
  }
}
