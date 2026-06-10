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

  onModuleInit() {
    // Connect in the background so a slow/unreachable DB never blocks the HTTP
    // server from binding its port (PaaS hosts kill services that don't open a
    // port quickly). Prisma also connects lazily on the first query.
    this.$connect().catch((err) => {
      this.logger.error(
        `Failed to connect to the database: ${
          err instanceof Error ? err.message : "unknown"
        }`
      );
    });
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
