import { Module } from "@nestjs/common";
import { SiteSettingsController } from "./site-settings.controller";
import { SiteSettingsService } from "./site-settings.service";
import { SupabaseService } from "../../common/supabase/supabase.service";

@Module({
  controllers: [SiteSettingsController],
  providers: [SiteSettingsService, SupabaseService],
})
export class SiteSettingsModule {}
