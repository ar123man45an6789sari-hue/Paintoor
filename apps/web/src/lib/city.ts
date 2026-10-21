/* Demo-phase selected-city store (per browser). Production: geo-IP default +
   city packs (Blueprint Ch. 40). */
export const LIVE_CITIES = ["Vadodara", "Ahmedabad", "Surat", "Indore", "Amritsar", "Chennai"];
export const SOON_CITIES = ["Bangalore", "Delhi", "Mumbai", "Hyderabad", "Pune", "Gurugram", "Noida"];

const KEY = "gs_city";
const CHANGE = "gs:city-changed";

export function getCity(): string {
  try {
    return localStorage.getItem(KEY) ?? "Vadodara";
  } catch {
    return "Vadodara";
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
    Vadodara: [22.3072, 73.1812],
    Ahmedabad: [23.0225, 72.5714],
    Surat: [21.1702, 72.8311],
    Indore: [22.7196, 75.8573],
    Amritsar: [31.634, 74.8723],
    Chennai: [13.0827, 80.2707],
  };
  let best = "Vadodara";
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