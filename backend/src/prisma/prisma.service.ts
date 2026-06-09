import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { PrismaClient } from "@prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name);

  constructor() {
    super({
      log:
        process.env.NODE_ENV === "development"
          ? ["error", "warn"]
          : ["error"],
    });
  }

  async onModuleInit() {
    try {
      await this.$connect();
    } catch (err) {
      // Don't crash the whole app at boot if the DB is briefly unavailable;
      // queries will surface the error instead.
      this.logger.error(
        `Failed to connect to the database: ${
          err instanceof Error ? err.message : "unknown"
        }`
      );
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
