/* Selected-place store (per browser). The detected place is cached, so the
   permission prompt and the lookup happen once per browser, not per visit.
   The bookable city list is not stored here: the marketplace and the wizard
   derive it from the seed providers, so a city can never be offered without
   a partner in it. */

export type PlaceSource = "gps" | "ip" | "manual" | "url";

export interface Place {
  name: string; // display city, e.g. "Vadodara"
  slug: string; // url-safe form, e.g. "vadodara"
  region: string; // state or subdivision, e.g. "Gujarat"
  country: string; // e.g. "India"
  source: PlaceSource; // how the name was resolved
  at: number; // epoch ms of the decision
}

const KEY = "gs_city"; // legacy string-only value, kept for older browsers
const PLACE_KEY = "gs_place";
const CHANGE = "gs:city-changed";

export function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function nameFromSlug(slug: string): string {
  return slug
    .split("-")
    .map((w) => (w ? w[0].toUpperCase() + w.slice(1) : w))
    .join(" ");
}

export function getPlace(): Place | null {
  try {
    const raw = localStorage.getItem(PLACE_KEY);
    if (raw) {
      const p = JSON.parse(raw) as Place;
      if (p && typeof p.name === "string" && p.name) return p;
    }
    const legacy = localStorage.getItem(KEY);
    if (legacy) {
      const p: Place = {
        name: legacy,
        slug: slugify(legacy),
        region: "",
        country: "",
        source: "manual",
        at: Date.now(),
      };
      localStorage.setItem(PLACE_KEY, JSON.stringify(p));
      return p;
    }
  } catch {
    /* private mode */
  }
  return null;
}

export function setPlace(p: Place) {
  try {
    localStorage.setItem(PLACE_KEY, JSON.stringify(p));
    localStorage.setItem(KEY, p.name);
    window.dispatchEvent(new CustomEvent(CHANGE));
  } catch {
    /* private mode */
  }
}

/** City label for consumers that only need a name. */
export function getCity(): string {
  return getPlace()?.name ?? "Mumbai";
}

/** Manual pick from the search pill or a dropdown. */
export function setCity(city: string) {
  setPlace({ name: city, slug: slugify(city), region: "", country: "", source: "manual", at: Date.now() });
}

export function onCityChange(cb: () => void) {
  window.addEventListener(CHANGE, cb);
  return () => window.removeEventListener(CHANGE, cb);
}

/* Last-resort offline list. Only used when the device gave coordinates but
   the reverse-geocode service could not be reached. Kept small on purpose. */
const OFFLINE: Record<string, [number, number]> = {
  Mumbai: [19.076, 72.8777],
  "Navi Mumbai": [19.033, 73.0297],
  Thane: [19.2183, 72.9781],
  Delhi: [28.7041, 77.1025],
  Bengaluru: [12.9716, 77.5946],
  Hyderabad: [17.385, 78.4867],
  Ahmedabad: [23.0225, 72.5714],
  Surat: [21.1702, 72.8311],
  Vadodara: [22.3072, 73.1812],
  Rajkot: [22.3039, 70.8022],
  Pune: [18.5204, 73.8567],
  Chennai: [13.0827, 80.2707],
  Kolkata: [22.5726, 88.3639],
  Jaipur: [26.9124, 75.7873],
  Lucknow: [26.8467, 80.9462],
  Kanpur: [26.4499, 80.3319],
  Nagpur: [21.1458, 79.0882],
  Indore: [22.7196, 75.8573],
  Bhopal: [23.2599, 77.4126],
  Patna: [25.5941, 85.1376],
  Chandigarh: [30.7333, 76.7794],
  Amritsar: [31.634, 74.8723],
  Varanasi: [25.3176, 82.9739],
  Kochi: [9.9312, 76.2673],
  Coimbatore: [11.0168, 76.9558],
  Visakhapatnam: [17.6868, 83.2185],
  Guwahati: [26.1445, 91.7362],
  London: [51.5072, -0.1276],
  "New York": [40.7128, -74.006],
  Toronto: [43.6532, -79.3832],
  Dubai: [25.2048, 55.2708],
  Singapore: [1.3521, 103.8198],
  Sydney: [-33.8688, 151.2093],
};

/** Nearest known city to raw coordinates (degree-distance, good enough offline). */
export function nearestOfflineCity(lat: number, lng: number): string {
  let best = "Mumbai";
  let bestD = Infinity;
  for (const [city, [clat, clng]] of Object.entries(OFFLINE)) {
    const d = Math.hypot(clat - lat, clng - lng);
    if (d < bestD) {
      bestD = d;
      best = city;
    }
  }
  return best;
}
