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
/** Official company identity (client-provided, 20 Oct 2026). */
export const company = {
  legalName: "Paintoor™ India (OPC) Pvt. Ltd.",
  registeredAddress:
    "Regd. Off. B/C-1, R-6, D.M Singh Industrial Compound, Opp. Shraddha Bldg. N-3, Thakur Complex, Kandivali East, Mumbai - 400101",
  phoneDisplay: "+91 97023 88055",
  phoneTel: "+919702388055",
  emails: {
    info: "Info@Paintoor.in",
    support: "Support@Paintoor.in",
    partner: "Partner@Paintoor.in",
    career: "Career@Paintoor.in",
  },
} as const;