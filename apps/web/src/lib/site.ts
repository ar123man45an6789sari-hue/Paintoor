import { LIVE_CITY_NAMES } from "@paintoor/mock-api";

/* Single source of truth for the public origin. robots.ts, sitemap.ts and
   every generateMetadata read this, so the day the custom domain goes live
   the whole site updates from one line. */
export const SITE_URL = "https://paintoor-three.vercel.app";

export const SITE_NAME = "Paintoor";

/* City copy that stays grammatical whether the launch list holds one city or
   twenty, so opening Vadodara next never leaves "our pilot city" stranded
   beside two names. Metadata reads these; nothing hardcodes a city. */
export const CITIES_TEXT = LIVE_CITY_NAMES.join(", ");

export const PILOT_CITY_LINE =
  LIVE_CITY_NAMES.length === 1
    ? `${LIVE_CITY_NAMES[0]}, our pilot city`
    : `${CITIES_TEXT} — our pilot cities`;