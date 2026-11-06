/* Is this URL slug a real Indian city? Drives the /[city] guard.

   Paintoor is built for all of India, so every real Indian city renders —
   served or not. Foreign and nonsense slugs get a real 404 instead of an
   endless field of duplicate landing pages.

   Source: indian-cities-json (1,221 cities, 34 states and UTs, MIT,
   data-only — verified to contain no executable code and no dependencies). */
import { cities } from "indian-cities-json";

/* Mirrors slugify() in ./city. Deliberately duplicated rather than imported
   so this module stays dependency-free for the server bundle. */
function slug(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/* The 2019 dataset uses census spellings that differ from what people
   actually type, so both forms resolve. */
const ALIASES: Record<string, string> = {
  mahesana: "mehsana",
  bangalore: "bengaluru",
  bombay: "mumbai",
  "navi-mumbai": "mumbai",
  calcutta: "kolkata",
  poona: "pune",
  mysore: "mysuru",
  mangalore: "mangaluru",
  trivandrum: "thiruvananthapuram",
  baroda: "vadodara",
};

const INDIA: Set<string> = new Set(
  cities.flatMap((c) => {
    const s = slug(c.name);
    return ALIASES[s] ? [s, ALIASES[s]] : [s];
  }),
);

export function isIndianSlug(raw: string): boolean {
  const s = slug(raw);
  if (INDIA.has(s)) return true;
  const alias = ALIASES[s];
  return alias !== undefined && INDIA.has(alias);
}