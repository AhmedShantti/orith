import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // ORITH brand palette (per brand book): Crimson Depth, Warm Sand,
        // Soft Pearl, Obsidian Black. The legacy "gold" token now maps to
        // Crimson Depth so every existing accent reskins to the new brand.
        gold: {
          DEFAULT: "#8E1B26",
          light: "#B23A44",
          dark: "#5A0E16",
          pale: "#F4E5E4",
        },
        crimson: {
          DEFAULT: "#8E1B26",
          light: "#B23A44",
          dark: "#5A0E16",
          deep: "#3E0810",
          pale: "#F4E5E4",
        },
        sand: {
          DEFAULT: "#C9A98A",
          light: "#E7D8C4",
          dark: "#A98A6B",
        },
        champagne: "#EAD9C2",
        beige: "#F0E8DC",
        rose: {
          DEFAULT: "#D9BDB8",
          deep: "#8E3B36",
          pale: "#F2E8E5",
        },
        obsidian: "#0C0B0A",
        ivory: "#F6F2EB",
      },
      fontFamily: {
        display: ["var(--font-cinzel)", "Georgia", "serif"],
        serif: ["var(--font-cormorant)", "Georgia", "serif"],
        body: ["var(--font-jost)", "sans-serif"],
      },
      animation: {
        "fade-up": "fadeUp 0.7s ease forwards",
        "fade-in": "fadeIn 0.5s ease forwards",
        "slide-down": "slideDown 0.4s ease forwards",
        shimmer: "shimmer 2s infinite",
        float: "float 4s ease-in-out infinite",
      },
      keyframes: {
        fadeUp: {
          "0%": { opacity: "0", transform: "translateY(24px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideDown: {
          "0%": { opacity: "0", transform: "translateY(-12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      backgroundImage: {
        "gold-gradient":
          "linear-gradient(135deg, #8E1B26 0%, #B23A44 50%, #5A0E16 100%)",
        "luxury-gradient":
          "linear-gradient(135deg, #F6F2EB 0%, #F0E8DC 50%, #EAD9C2 100%)",
        "hero-gradient":
          "linear-gradient(to bottom right, #F6F2EB, #F0E8DC, #EAD9C2)",
      },
      boxShadow: {
        luxury: "0 8px 40px rgba(142,27,38,0.15)",
        "luxury-lg": "0 16px 60px rgba(142,27,38,0.2)",
        card: "0 4px 24px rgba(0,0,0,0.06)",
        "card-hover": "0 12px 40px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
