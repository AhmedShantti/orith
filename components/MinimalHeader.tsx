import Link from "next/link";
import Emblem from "@/components/Emblem";

// Logo-only header used by the focused checkout / payment / order routes.
export default function MinimalHeader() {
  return (
    <header className="border-b border-obsidian/10 bg-ivory">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-center sm:justify-start">
        <Link
          href="/"
          aria-label="ORITH — return to homepage"
          className="flex items-center gap-3 text-obsidian"
        >
          <Emblem size={26} className="text-crimson" />
          <span
            className="text-lg tracking-[0.3em]"
            style={{ fontFamily: "var(--font-cinzel)" }}
          >
            ORITH
          </span>
        </Link>
      </div>
    </header>
  );
}
