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
    shortName: "Paintoor™ India",
  registeredOffice:
    "B/C-1, R-6, D.M Singh Industrial Compound, Opp. Shraddha Bldg. N-3, Thakur Complex, Kandivali East, Mumbai - 400101",
  registeredAddress:
    "Shop No - 07, Krishna Gokul Garden Co-operative Housing Society Limited, Opposite - BMC Parking, Next to MMRDA Market, Thakur Complex, Kandivali East, Mumbai - 400101",
  phoneDisplay: "+91 97023 88055",
  phoneTel: "+919702388055",
  emails: {
        info: "info@paintoor.in",
        support: "support@paintoor.in",
        partner: "partner@paintoor.in",
        career: "career@paintoor.in",
  },
} as const;
/** Powered-by line and walk-in help centre (client-provided, 29 Oct 2026). */
export const poweredBy = "KHAKI | KrypTech™ (India) Pvt. Ltd.";
/** Official social handles. Empty url = icon renders but stays inactive
 *  until the client hands over the live handle. */
export const socials = [
  { id: "instagram", label: "Instagram", url: "" },
  { id: "facebook", label: "Facebook", url: "" },
  { id: "x", label: "X (Twitter)", url: "" },
  { id: "telegram", label: "Telegram", url: "" },
  { id: "youtube", label: "YouTube", url: "" },
] as const;

export const helpCentre = {
  label: "Authorized On-boarding & Help Centre",
  address:
    "Shop No - 07, Krishna Gokul Garden Co-operative Housing Society Limited, Opposite - BMC Parking, Next to MMRDA Market, Thakur Complex, Kandivali East, Mumbai - 400101",
} as const;