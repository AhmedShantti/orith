import {
  Injectable,
  BadRequestException,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ok, paginated } from "../../common/api-response";

@Injectable()
export class ReviewsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(
    userId: string,
    body: { productId?: string; rating?: number; comment?: string }
  ) {
    const { productId, rating, comment } = body;
    if (!productId || rating === undefined || !comment) {
      throw new BadRequestException({
        success: false,
        data: null,
        error: "Bad Request",
        message: "Missing required fields: productId, rating, comment",
      });
    }
    if (rating < 1 || rating > 5 || !Number.isInteger(rating)) {
      throw new BadRequestException({
        success: false,
        data: null,
        error: "Bad Request",
        message: "Rating must be an integer between 1 and 5",
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
    const review = await this.prisma.review.create({
      data: { userId, productId, rating, comment },
      include: { user: true },
    });
    return ok(review, "Review created successfully");
  }

  async listForProduct(productId: string, page: number, limit: number) {
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
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { productId },
        include: { user: true },
        skip,
        take: limit,
        orderBy: { createdAt: "desc" },
      }),
      this.prisma.review.count({ where: { productId } }),
    ]);
    return paginated(reviews, {
      total,
      page,
      limit,
      pages: Math.ceil(total / limit),
    });
  }
}
