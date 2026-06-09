import { Controller, Get } from "@nestjs/common";
import { CatalogueService } from "../../catalogue/catalogue.service";

@Controller("offers")
export class OffersController {
  constructor(private readonly catalogue: CatalogueService) {}

  // GET /api/offers — active offers with derived savings.
  @Get()
  list() {
    const enriched = this.catalogue.getOffers().map((o) => {
      const original = o.product.originalPrice ?? o.product.price;
      const saving = Math.max(0, original - o.product.price);
      return { ...o, saving };
    });
    return { count: enriched.length, offers: enriched };
  }
}
