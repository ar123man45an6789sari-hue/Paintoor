/* mock-api v2 — multi-city seeds; MSW handlers + OpenAPI wiring land in S8-S13. */
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