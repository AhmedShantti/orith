import "reflect-metadata";
import { NestFactory } from "@nestjs/core";
import { Logger } from "@nestjs/common";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    // Required for the Paymob webhook signature: we need the raw body untouched
    // for any future raw-body needs, and JSON parsing for everything else.
    bodyParser: true,
  });

  // Keep the same URL surface as the old Next.js routes: everything under /api.
  app.setGlobalPrefix("api");

  // CORS so the Next.js frontend (a different origin) can call this API.
  const frontendOrigin = process.env.FRONTEND_ORIGIN || "http://localhost:3000";
  app.enableCors({
    origin: frontendOrigin.split(",").map((o) => o.trim()),
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  });

  const port = parseInt(process.env.PORT || "4000", 10);
  // Bind to 0.0.0.0 so PaaS hosts (Render, Railway, etc.) can detect the port.
  await app.listen(port, "0.0.0.0");
  new Logger("Bootstrap").log(
    `ORITH API listening on port ${port}/api (CORS: ${frontendOrigin})`
  );
}

bootstrap();
