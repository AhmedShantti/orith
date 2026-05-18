import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import OffersSection from "@/components/OffersSection";
import ContactSection from "@/components/ContactSection";

export default function HomePage() {
  return (
    <div className="page-transition">
      <Hero />

      {/* Marquee strip */}
      <div className="bg-gold py-3 overflow-hidden">
        <div className="flex gap-12 animate-[shimmer_20s_linear_infinite] whitespace-nowrap">
          {Array(6)
            .fill(
              ["Luxury Perfumery", "•", "Handcrafted Fragrances", "•", "Made in Egypt", "•", "Premium Quality", "•"]
            )
            .flat()
            .map((item, i) => (
              <span
                key={i}
                className="text-white/90 text-xs tracking-[0.4em] uppercase font-body font-light flex-shrink-0"
              >
                {item}
              </span>
            ))}
        </div>
      </div>

      <FeaturedProducts />

      {/* Separator */}
      <div className="flex items-center justify-center py-8">
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
        <div className="mx-4 text-gold text-lg">✦</div>
        <div className="w-24 h-px bg-gradient-to-r from-transparent via-gold to-transparent" />
      </div>

      <OffersSection />

      {/* Brand story section */}
      <section className="py-24 bg-gradient-to-r from-obsidian to-[#1a1a1a] text-white relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-96 rounded-full bg-gold/10 blur-3xl" />
        </div>
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="flex items-center justify-center gap-4 mb-8">
            <div className="w-16 h-px bg-gradient-to-r from-transparent to-gold/60" />
            <span className="text-gold text-lg">✦</span>
            <div className="w-16 h-px bg-gradient-to-l from-transparent to-gold/60" />
          </div>
          <h2
            className="font-display text-4xl sm:text-5xl lg:text-6xl font-light leading-tight mb-8"
            style={{ fontFamily: "var(--font-cormorant)" }}
          >
            "Every scent is a{" "}
            <em className="text-gold italic">memory waiting</em> to be made."
          </h2>
          <p className="font-body text-white/40 text-sm sm:text-base font-light leading-relaxed max-w-2xl mx-auto">
            At Orith, we believe a fragrance is more than a scent — it's a
            statement, an emotion, a signature. Our master perfumers blend
            ancient oriental traditions with contemporary artistry to create
            fragrances that endure.
          </p>
          <div className="mt-10 flex items-center justify-center gap-2">
            <div className="w-8 h-px bg-gold/40" />
            <span className="text-gold/60 text-[10px] tracking-[0.4em] uppercase font-body">
              Orith — est. 2017
            </span>
            <div className="w-8 h-px bg-gold/40" />
          </div>
        </div>
      </section>

      <ContactSection />
    </div>
  );
}
