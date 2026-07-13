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
    },
  },
  plugins: [],
};

export default config;
