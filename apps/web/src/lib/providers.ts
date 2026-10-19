/* Provider-side helpers for the demo: who is logged in, which open requests
   match them, and how far away the job is. Production replaces this with
   GET /v1/providers/me + GET /v1/leads (Blueprint Ch. 15 ranking). */
import { seed } from "@gharsahayak/mock-api";
import type { ServiceRequest } from "./requests";

export type SeedProvider = (typeof seed.providers)[number];

export type ProviderProfile = {
  id: string;
  name: string;
  city: string;
  zone: string;
  skills: string[];
  experience: number;
  rating: number;
  reviews: number;
  jobsDone: number;
  badges: string[];
  quote: string;
  rateMin: number;
  rateMax: number;
  unit: string;
  /** True while the signed-up name is not in the seed set. */
  synthetic: boolean;
};

const SKILL_WORDS = ["paint", "electric", "plumb", "carpent", "clean", "waterproof"];
const DEFAULT_SKILL = "painting";

/** First seed provider whose id contains a word from the signed-in name, else a painter. */
function matchSeed(name: string): SeedProvider | undefined {
  const n = name.toLowerCase();
  return (
    seed.providers.find((p) => {
      const parts = p.name.toLowerCase().split(/\s+/);
      return parts.some((part) => part.length > 3 && n.includes(part));
    }) ?? seed.providers.find((p) => p.skills.includes(DEFAULT_SKILL))
  );
}

export function getProviderProfile(name: string): ProviderProfile {
  const match = matchSeed(name);
  const source = match ?? seed.providers[0];
  return {
    id: source.id,
    name: name.trim() || source.name,
    city: source.city,
    zone: source.zone,
    skills: source.skills,
    experience: source.experience_years,
    rating: source.rating_avg,
    reviews: source.rating_count,
    jobsDone: source.jobs_done,
    badges: source.badges,
    quote: source.quote,
    rateMin: source.rate_range_paise.min,
    rateMax: source.rate_range_paise.max,
    unit: source.rate_range_paise.unit,
    synthetic: !match,
  };
}

/** Lead filter v1 — city OR zone matches, and the skill matches the category. */
export function isLeadMatch(profile: ProviderProfile, request: ServiceRequest): boolean {
  const place = request.city === profile.city || request.zone.toLowerCase() === profile.zone.toLowerCase();
  const skill = profile.skills.includes(request.category);
  return place && skill;
}

export function openLeadsFor(profile: ProviderProfile, requests: ServiceRequest[]): ServiceRequest[] {
  return requests
    .filter((r) => r.status === "open" && isLeadMatch(profile, r))
    .sort((a, b) => b.at - a.at);
}

const ZONE_CENTER: Record<string, { lat: number; lng: number }> = {
  alkapuri: { lat: 22.3135, lng: 73.1747 },
  "race course": { lat: 22.3089, lng: 73.1831 },
  akota: { lat: 22.3043, lng: 73.1666 },
  jetalpur: { lat: 22.3033, lng: 73.1758 },
  diwalipura: { lat: 22.2989, lng: 73.1622 },
  subhanpura: { lat: 22.3191, lng: 73.1594 },
  gotri: { lat: 22.3286, lng: 73.1421 },
  sevasi: { lat: 22.3538, lng: 73.1215 },
  bhayli: { lat: 22.3372, lng: 73.1288 },
  vasna: { lat: 22.3452, lng: 73.1352 },
  maneja: { lat: 22.2688, lng: 73.1571 },
  tarsali: { lat: 22.2734, lng: 73.2043 },
  "waghodia road": { lat: 22.3232, lng: 73.2167 },
  harni: { lat: 22.3372, lng: 73.2222 },
  sama: { lat: 22.3466, lng: 73.1988 },
  karelibagh: { lat: 22.3211, lng: 73.2088 },
  fatehgunj: { lat: 22.3145, lng: 73.1978 },
  sayajigunj: { lat: 22.3094, lng: 73.1944 },
  nizampura: { lat: 22.3211, lng: 73.1866 },
  manjalpur: { lat: 22.2766, lng: 73.1944 },
};

const FALLBACK_CENTER = { lat: 22.3072, lng: 73.1812 };

function centerOf(zone: string) {
  return ZONE_CENTER[zone.trim().toLowerCase()] ?? FALLBACK_CENTER;
}

/** Great-circle distance in km, rounded to one decimal. */
export function distanceKm(fromZone: string, toZone: string): number {
  const a = centerOf(fromZone);
  const b = centerOf(toZone);
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(2 * 6371 * Math.asin(Math.sqrt(h)) * 10) / 10;
}

export const paiseToRupees = (paise: number) => "₹" + (paise / 100).toLocaleString("en-IN");