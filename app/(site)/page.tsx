import Hero from "@/components/Hero";
import FeaturedProducts from "@/components/FeaturedProducts";
import OffersSection from "@/components/OffersSection";
import ContactSection from "@/components/ContactSection";
import Manifesto from "@/components/Manifesto";
import EssenceSection from "@/components/EssenceSection";

const MARQUEE = [
  "Extrait de Parfum",
  "Maison de Parfum",
  "Est. 1995",
  "Timeless by Design",
  "Defined by Essence",
  "Vaporisateur Natural Spray",
];

export default function HomePage() {
  return (
    <div className="page-transition">
      <Hero />

      {/* Crimson word-marquee band */}
      <div className="bg-crimson text-ivory py-4 word-marquee">
        <div className="word-marquee-track">
          {Array(3)
            .fill([...MARQUEE, ...MARQUEE])
            .flat()
            .map((item, i) => (
              <span key={i} className="inline-flex items-center gap-10 eyebrow text-[10px] text-ivory/85">
                {item}
                <span className="text-ivory/50">✳</span>
              </span>
            ))}
        </div>
      </div>

      <FeaturedProducts />

      <Manifesto />

      <EssenceSection />

      <OffersSection />

      <ContactSection />
    </div>
  );
}
