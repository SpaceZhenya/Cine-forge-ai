import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#6C5CE7",
        secondary: "#00CEC9",
        accent: "#FD79A8",
        dark: "#0a0a0f",
        darker: "#050508",
        card: "#12121a",
        border: "#1e1e2a",
        muted: "#6b6b80",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "glow": "glow 2s ease-in-out infinite alternate",
      },
      keyframes: {
        glow: {
          "0%": { boxShadow: "0 0 20px rgba(108, 92, 231, 0.3)" },
          "100%": { boxShadow: "0 0 40px rgba(108, 92, 231, 0.6)" },
        },
      },
    },
  },
  plugins: [],
};

export default config;
