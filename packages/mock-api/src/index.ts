/* mock-api: multi-city demo seeds; MSW handlers and OpenAPI wiring are future work. */
import providers from "./seeds/providers.json";
import shops from "./seeds/shops.json";

export const seed = { providers, shops };

export type SeedProvider = (typeof providers)[number];
export type SeedShop = (typeof shops)[number];
/** Skills live on the platform today (client: painting-first launch). */
export const LAUNCH_SKILLS = ["painting"];

export function isLiveSkill(skill: string): boolean {
  return LAUNCH_SKILLS.includes(skill);
}

/** Cities Paintoor books today — the launch list, and the ONLY gate between
 *  "pilot" and "all over India". Every live-city surface derives from it: the
 *  city page and its honest "not live yet" state, the sitemap, the search hint,
 *  the post-job wizard, the hero badge, the landing marquee, the partner
 *  filters and the SEO copy — so none of them can drift apart.
 *
 *  Opening a city needs no code change: set NEXT_PUBLIC_LAUNCH_CITIES
 *  (locally in apps/web/.env.local, or in the Vercel project settings) to a
 *  comma-separated list, e.g. "Mumbai,Vadodara", and rebuild. Seed rows
 *  already exist for Mumbai, Vadodara, Surat, Ahmedabad, Amritsar, Chennai
 *  and Indore; a brand-new city only needs its partner rows added. */
const LAUNCH_LIST = (process.env.NEXT_PUBLIC_LAUNCH_CITIES ?? "Mumbai")
  .split(",")
  .map((city) => city.trim())
  .filter(Boolean);

export const PILOT_CITIES = LAUNCH_LIST.length > 0 ? LAUNCH_LIST : ["Mumbai"];

export function isPilotCity(city: string): boolean {
  const want = city.trim().toLowerCase();
  return PILOT_CITIES.some((c) => c.toLowerCase() === want);
}

/** Bookable partners: launch skill AND pilot city. */
export const liveProviders = seed.providers.filter(
  (p) => p.skills.some(isLiveSkill) && isPilotCity(p.city),
);

/** Shops in the launch cities, for the shopkeeper demo dashboard. */
export const liveShops = seed.shops.filter((s) => isPilotCity(s.city));

/** Display names of the bookable cities — sorted, de-duplicated. */
export const LIVE_CITY_NAMES = Array.from(new Set(liveProviders.map((p) => p.city))).sort();