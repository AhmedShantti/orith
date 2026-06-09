import { Controller, Get } from "@nestjs/common";
import { CatalogueService } from "../../catalogue/catalogue.service";

@Controller("stats")
export class StatsController {
  constructor(private readonly catalogue: CatalogueService) {}

  // GET /api/stats — aggregate catalogue metrics for the storefront.
  @Get()
  async stats() {
    const products = await this.catalogue.getAllProducts();
    const total = products.length;
    const collectionValue = products.reduce((sum, p) => sum + p.price, 0);
    const avgPrice = total ? Math.round(collectionValue / total) : 0;

    const cheapest = products.reduce((a, b) => (b.price < a.price ? b : a));
    const priciest = products.reduce((a, b) => (b.price > a.price ? b : a));

    const byCategory = this.catalogue
      .getCategories()
      .filter((c) => c.id !== "all")
      .map((c) => ({
        id: c.id,
        labelEn: c.labelEn,
        labelAr: c.labelAr,
        count: products.filter((p) => p.category === c.id).length,
      }))
      .sort((a, b) => b.count - a.count);

    const badged = products.filter((p) => p.badge).length;

    return {
      totalProducts: total,
      collectionValue,
      avgPrice,
      activeOffers: this.catalogue.getOffers().length,
      badged,
      categories: byCategory,
      cheapest: { nameEn: cheapest.nameEn, price: cheapest.price },
      priciest: { nameEn: priciest.nameEn, price: priciest.price },
    };
  }
}
