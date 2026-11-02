/* Demo-phase selected-city store (per browser). Production replaces this
   with a geo-IP default and per-city packs. The bookable city list is not
   stored here: the marketplace and the wizard derive it from the seed
   providers, so a city can never be offered without a partner in it. */
const KEY = "gs_city";
const CHANGE = "gs:city-changed";

export function getCity(): string {
  try {
    return localStorage.getItem(KEY) ?? "Mumbai";
  } catch {
    return "Mumbai";
  }
}

export function setCity(city: string) {
  try {
    localStorage.setItem(KEY, city);
    window.dispatchEvent(new CustomEvent(CHANGE));
  } catch {
    /* private mode */
  }
}

export function onCityChange(cb: () => void) {
  window.addEventListener(CHANGE, cb);
  return () => window.removeEventListener(CHANGE, cb);
}

/** Nearest live city to given coordinates (haversine). */
export function nearestCity(lat: number, lng: number): string {
  const CENTERS: Record<string, [number, number]> = {
    Mumbai: [19.0760, 72.8777],
    Ahmedabad: [23.0225, 72.5714],
    Surat: [21.1702, 72.8311],
    Indore: [22.7196, 75.8573],
    Amritsar: [31.634, 74.8723],
    Chennai: [13.0827, 80.2707],
  };
  let best = "Mumbai";
  let bestD = Infinity;
  for (const [city, [clat, clng]] of Object.entries(CENTERS)) {
    const d = Math.hypot(clat - lat, clng - lng);
    if (d < bestD) {
      bestD = d;
      best = city;
    }
  }
  return best;
}