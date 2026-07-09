import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./context/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ['"Fraunces"', "serif"],
        sans: ['"Plus Jakarta Sans"', "sans-serif"],
        mono: ['"IBM Plex Mono"', "monospace"],
      },
      colors: {
        ink: {
          50: "#F3F4F7",
          100: "#E3E5EC",
          400: "#5C6178",
          700: "#2B2E3C",
          800: "#20222E",
          900: "#181A23",
          950: "#111219",
        },
        parchment: {
          50: "#FBF9F4",
          100: "#F5F1E7",
          200: "#ECE5D3",
        },
        gold: {
          50: "#FBF4E6",
          200: "#EBD3A0",
          300: "#DFBE79",
          400: "#D2A755",
          500: "#BE8E3B",
          600: "#9C7129",
          700: "#785522",
        },
        rose: {
          400: "#C97C93",
          500: "#B15A76",
        },
        emerald: {
          400: "#5FA980",
          500: "#3E8C63",
        },
      },
      boxShadow: {
        soft: "0 2px 10px -2px rgba(24,26,35,0.06), 0 1px 2px rgba(24,26,35,0.04)",
        card: "0 8px 30px -12px rgba(24,26,35,0.18)",
        gold: "0 8px 24px -8px rgba(190,142,59,0.45)",
      },
      backgroundImage: {
        "gold-gradient": "linear-gradient(135deg, #D2A755 0%, #9C7129 100%)",
        "ink-gradient": "linear-gradient(180deg, #20222E 0%, #14151D 100%)",
      },
      keyframes: {
        slideIn: {
          from: { transform: "translateX(110%)", opacity: "0" },
          to: { transform: "translateX(0)", opacity: "1" },
        },
        fadeUp: {
          from: { transform: "translateY(6px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
      },
      animation: {
        slideIn: "slideIn .35s cubic-bezier(.16,1,.3,1)",
        fadeUp: "fadeUp .3s ease",
      },
    },
  },
  plugins: [],
};

export default config;
