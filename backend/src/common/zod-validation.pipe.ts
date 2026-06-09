import {
  PipeTransform,
  Injectable,
  BadRequestException,
  ArgumentMetadata,
} from "@nestjs/common";
import { ZodSchema } from "zod";

/**
 * Validate a request payload against a Zod schema. Reuses the same schemas as
 * the original Next.js implementation so validation behaviour is identical.
 *
 * Usage: `@Body(new ZodValidationPipe(createOrderSchema)) body: CreateOrderInput`
 */
@Injectable()
export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown, _metadata: ArgumentMetadata) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException({
        success: false,
        data: null,
        error: "VALIDATION_ERROR",
        message: "Please check the highlighted fields.",
        details: result.error.flatten(),
      });
    }
    return result.data;
  }
}
