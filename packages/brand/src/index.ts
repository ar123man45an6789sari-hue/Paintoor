import tokens from "./tokens.json";

/** Typed access to brand tokens: web, Tailwind config and the future
 *  React Native theme all read this one file. */
export const brand = tokens;

export const colors = Object.fromEntries(
  Object.entries(tokens.color).map(([name, meta]) => [name, meta.value]),
) as Record<keyof typeof tokens.color, string>;

export const BRAND_NAME = "Paintoor";
export const BRAND_TAGLINE = "Har deewar, bharose ke saath.";
export const SUPPORTED_LOCALES = ["en", "hi", "gu"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];