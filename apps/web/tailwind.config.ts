import type { Config } from "tailwindcss";
import tokens from "../../packages/brand/src/tokens.json";

/** Colours are CSS-variable driven: dark mode flips tokens, not components. */
const rgb = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const radius = Object.fromEntries(
  Object.entries(tokens.radius).map(([name, meta]) => [name, meta.value]),
);

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        white: rgb("surface"),
        navy: rgb("navy"),
        navyDeep: rgb("navydeep"),
        ink: rgb("ink"),
        saffron: rgb("saffron"),
        haldi: rgb("haldi"),
        neem: rgb("neem"),
        violet: rgb("violet"),
        danger: rgb("danger"),
        chuna: rgb("chuna"),
        line: rgb("line"),
        muted: rgb("muted"),
        raatri: rgb("raatri"),
      },
      borderRadius: radius,
        boxShadow: {
        card: "0 10px 30px rgba(24, 32, 40, 0.10)",
        lift: "0 12px 26px rgba(224, 0, 72, 0.30)",
      },
    },
  },
  plugins: [],
};

export default config;