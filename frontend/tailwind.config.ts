import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        nebula: {
          950: "#09090b",
          900: "#0f0a1a",
          800: "#1a1030",
          700: "#2d1b69",
          600: "#5b21b6",
          500: "#7c3aed",
          400: "#a78bfa",
        },
      },
      backgroundImage: {
        "nebula-gradient":
          "radial-gradient(ellipse 80% 60% at 50% 0%, rgba(91, 33, 182, 0.25) 0%, rgba(15, 10, 26, 0) 70%)",
        "hero-gradient":
          "linear-gradient(135deg, #a78bfa 0%, #6366f1 50%, #818cf8 100%)",
      },
      boxShadow: {
        glow: "0 0 60px rgba(124, 58, 237, 0.15)",
        "glow-lg": "0 0 100px rgba(124, 58, 237, 0.25)",
        card: "0 4px 24px rgba(0, 0, 0, 0.4)",
      },
      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-up": "slideUp 0.6s ease-out forwards",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideUp: {
          "0%": { opacity: "0", transform: "translateY(20px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
