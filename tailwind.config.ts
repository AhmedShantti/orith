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
        gold: {
          DEFAULT: "#C9A96E",
          light: "#E8D5B0",
          dark: "#A07840",
          pale: "#F5ECD9",
        },
        champagne: "#F7E7CE",
        beige: "#F5F0E8",
        rose: {
          DEFAULT: "#E8C5C5",
          deep: "#C9908F",
          pale: "#F7EDED",
        },
        obsidian: "#0A0A0A",
        ivory: "#FDFAF5",
      },
      fontFamily: {
        display: ["var(--font-cormorant)", "Georgia", "serif"],
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
          "linear-gradient(135deg, #C9A96E 0%, #E8D5B0 50%, #C9A96E 100%)",
        "luxury-gradient":
          "linear-gradient(135deg, #FDFAF5 0%, #F5F0E8 50%, #F7E7CE 100%)",
        "hero-gradient":
          "linear-gradient(to bottom right, #FDFAF5, #F5ECD9, #F7E7CE)",
      },
      boxShadow: {
        luxury: "0 8px 40px rgba(201,169,110,0.15)",
        "luxury-lg": "0 16px 60px rgba(201,169,110,0.2)",
        card: "0 4px 24px rgba(0,0,0,0.06)",
        "card-hover": "0 12px 40px rgba(0,0,0,0.12)",
      },
    },
  },
  plugins: [],
};
export default config;
