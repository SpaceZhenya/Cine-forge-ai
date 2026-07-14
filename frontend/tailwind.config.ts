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
        // Ghost Developer VS Code colors
        "vs-bg": "#1e1e1e",
        "vs-sidebar": "#252526",
        "vs-activity": "#333333",
        "vs-border": "#3c3c3c",
        "vs-hover": "#2a2d2e",
        "vs-active": "#37373d",
        "vs-text": "#cccccc",
        "vs-muted": "#858585",
        "vs-accent": "#007acc",
        "vs-green": "#4ec9b0",
        "vs-yellow": "#dcdcaa",
        "vs-pink": "#c586c0",
        "vs-blue": "#569cd6",
        "vs-orange": "#ce9178",
      },
    },
  },
  plugins: [],
};

export default config;
