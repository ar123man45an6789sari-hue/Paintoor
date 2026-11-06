/* One-shot location sensing. First attempt that wins:
   1. GPS coordinates -> reverse geocode: exact city, anywhere in the world
   2. GPS coordinates -> offline nearest city (service unreachable)
   3. No permission or no GPS -> IP-based lookup, same free endpoint, no prompt
   4. Everything offline -> pilot default; the visitor can always pick manually
   The decision is stored, so the browser is asked for permission at most once
   per browser profile. sensePlace never throws. */
import { nearestOfflineCity, setPlace, slugify, type Place } from "./city";

const API = "https://api.bigdatacloud.net/data/reverse-geocode-client";

interface BdcReply {
  city?: string;
  locality?: string;
  principalSubdivision?: string;
  countryName?: string;
  lookupSource?: string;
}

async function lookup(lat?: number, lng?: number): Promise<BdcReply | null> {
  try {
    const q = new URLSearchParams();
    if (lat !== undefined && lng !== undefined) {
      q.set("latitude", String(lat));
      q.set("longitude", String(lng));
    }
    q.set("localityLanguage", "en");
    const res = await fetch(API + "?" + q.toString(), { cache: "no-store" });
    if (!res.ok) return null;
    return (await res.json()) as BdcReply;
  } catch {
    return null;
  }
}

function gps(): Promise<{ lat: number; lng: number } | null> {
  return new Promise((resolve) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      resolve(null);
      return;
    }
    let done = false;
    const finish = (v: { lat: number; lng: number } | null) => {
      if (!done) {
        done = true;
        resolve(v);
      }
    };
    navigator.geolocation.getCurrentPosition(
      (pos) => finish({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => finish(null),
      { timeout: 6000, maximumAge: 600000 },
    );
    setTimeout(() => finish(null), 7000);
  });
}

function placeFrom(name: string, region: string, country: string, source: Place["source"]): Place {
  return { name, slug: slugify(name), region, country, source, at: Date.now() };
}

/** Resolves the visitor's place and stores the decision. Never throws. */
export async function sensePlace(): Promise<Place> {
  const coords = await gps();
  if (coords) {
    const r = await lookup(coords.lat, coords.lng);
    const name = r?.city || r?.locality || r?.principalSubdivision;
    if (name) {
      const p = placeFrom(name, r?.principalSubdivision ?? "", r?.countryName ?? "", "gps");
      setPlace(p);
      return p;
    }
    const p = placeFrom(nearestOfflineCity(coords.lat, coords.lng), "", "", "gps");
    setPlace(p);
    return p;
  }
  const ip = await lookup();
  const ipName = ip?.city || ip?.locality || ip?.principalSubdivision;
  if (ipName) {
    const p = placeFrom(ipName, ip?.principalSubdivision ?? "", ip?.countryName ?? "", "ip");
    setPlace(p);
    return p;
  }
  const p = placeFrom("Mumbai", "Maharashtra", "India", "manual");
  setPlace(p);
  return p;
}
