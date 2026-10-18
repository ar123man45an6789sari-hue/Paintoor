/* mock-api v1 — seeds only; MSW handlers + OpenAPI wiring land in Session 6. */
import providers from "./seeds/vadodara/providers.json";
import shops from "./seeds/vadodara/shops.json";

/** Demo-phase data access. Production replaces this module with NestJS
 *  services over PostgreSQL — same shapes, same names. */
export const seed = {
  city: "vadodara",
  providers,
  shops,
};

export type SeedProvider = (typeof providers)[number];
export type SeedShop = (typeof shops)[number];