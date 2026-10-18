import type { Config } from "tailwindcss";
import tokens from "../../packages/brand/src/tokens.json";

/** Tailwind theme generated from shared brand tokens — one source, zero drift. */
const colors = Object.fromEntries(
  Object.entries(tokens.color).map(([name, meta]) => [name, meta.value]),
);

const radius = Object.fromEntries(
  Object.entries(tokens.radius).map(([name, meta]) => [name, meta.value]),
);

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors,
      borderRadius: radius,
      boxShadow: {
        card: "0 10px 30px rgba(11, 18, 32, 0.10)",
        lift: "0 12px 26px rgba(242, 118, 46, 0.35)",
      },
    },
  },
  plugins: [],
};

export default config;