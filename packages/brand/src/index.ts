import tokens from "./tokens.json";

/** Typed access to brand tokens: web, Tailwind config and the future
 *  React Native theme all read this one file. */
export const brand = tokens;

export const colors = Object.fromEntries(
  Object.entries(tokens.color).map(([name, meta]) => [name, meta.value]),
) as Record<keyof typeof tokens.color, string>;

export const BRAND_NAME = "GharSahayak";
export const BRAND_TAGLINE = "Ghar ka kaam, bharose ke saath.";
export const SUPPORTED_LOCALES = ["en", "hi", "gu"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];