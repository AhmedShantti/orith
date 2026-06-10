import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { PrismaModule } from "./prisma/prisma.module";
import { CatalogueModule } from "./catalogue/catalogue.module";
import { AuthModule } from "./modules/auth/auth.module";
import { ProductsModule } from "./modules/products/products.module";
import { CartModule } from "./modules/cart/cart.module";
import { ReviewsModule } from "./modules/reviews/reviews.module";
import { OffersModule } from "./modules/offers/offers.module";
import { OrdersModule } from "./modules/orders/orders.module";
import { AdminModule } from "./modules/admin/admin.module";
import { StatsModule } from "./modules/stats/stats.module";
import { UploadModule } from "./modules/upload/upload.module";
import { CheckoutModule } from "./modules/checkout/checkout.module";
import { PaymentsModule } from "./modules/payments/payments.module";
import { WebhooksModule } from "./modules/webhooks/webhooks.module";
import { SiteSettingsModule } from "./modules/site-settings/site-settings.module";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    CatalogueModule,
    AuthModule,
    ProductsModule,
    CartModule,
    ReviewsModule,
    OffersModule,
    OrdersModule,
    AdminModule,
    StatsModule,
    UploadModule,
    CheckoutModule,
    PaymentsModule,
    WebhooksModule,
    SiteSettingsModule,
  ],
})
export class AppModule {}
