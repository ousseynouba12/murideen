import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        sand: "var(--sand)",
        "sand-raised": "var(--sand-raised)",
        "sand-sunken": "var(--sand-sunken)",
        ink: "var(--ink)",
        "ink-soft": "var(--ink-soft)",
        "ink-faint": "var(--ink-faint)",
        wine: "var(--wine)",
        "wine-soft": "var(--wine-soft)",
        "wine-tint": "var(--wine-tint)",
        gold: "var(--gold)",
        "gold-deep": "var(--gold-deep)",
        "gold-tint": "var(--gold-tint)",
        line: "var(--line)",
        "line-strong": "var(--line-strong)",
        ok: "var(--ok)",
        "ok-tint": "var(--ok-tint)",
        warn: "var(--warn)",
        "warn-tint": "var(--warn-tint)",
        teal: "var(--teal)",
        "teal-tint": "var(--teal-tint)",
      },
      fontFamily: {
        display: ["'Cormorant Garamond'", "serif"],
        body: ["'Jost'", "sans-serif"],
      },
      borderRadius: {
        card: "18px",
        pill: "999px",
      },
    },
  },
  plugins: [],
};

export default config;
