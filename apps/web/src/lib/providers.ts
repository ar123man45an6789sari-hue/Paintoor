/* Provider-side helpers for the demo: who is logged in, which open requests
   match them, and how far away the job is. Production replaces this with
   GET /v1/providers/me + GET /v1/leads (ranking rules live here). */
import { seed } from "@paintoor/mock-api";
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

/** Seed profile for the signed-in worker, overridden by what the signup form
        collected (zone, years of experience) so the dashboard shows real answers
        instead of the seed row. */
     export function getProviderProfile(name: string, signup?: Record<string, string>): ProviderProfile {
       const match = matchSeed(name);
       const source = match ?? seed.providers[0];
       const zone = signup?.zone?.trim() || source.zone;
       const experience = Number(signup?.experience_years) || source.experience_years;
       return {
     id: source.id,
     name: name.trim() || source.name,
      city: source.city,
       zone,
     skills: source.skills,
    experience,
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

/** Lead filter — city OR zone matches, and the skill matches the category. */
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

/* Zone centres used only to show a painter how far a lead is. Mumbai is the
   pilot city, so the MMR localities come first and Mumbai is the fallback;
   the other seed cities are listed too so their painters get real numbers
   instead of a default dot in the wrong state. */
const ZONE_CENTER: Record<string, { lat: number; lng: number }> = {
  /* — Mumbai — */
  "andheri west": { lat: 19.1364, lng: 72.8296 },
  "andheri east": { lat: 19.1197, lng: 72.8464 },
  versova: { lat: 19.1317, lng: 72.8214 },
  lokhandwala: { lat: 19.1416, lng: 72.8289 },
  jogeshwari: { lat: 19.1336, lng: 72.8419 },
  "goregaon west": { lat: 19.1615, lng: 72.8481 },
  "goregaon east": { lat: 19.1619, lng: 72.8648 },
  "malad west": { lat: 19.1864, lng: 72.8480 },
  "malad east": { lat: 19.1887, lng: 72.8624 },
  "kandivali west": { lat: 19.2072, lng: 72.8418 },
  "kandivali east": { lat: 19.2090, lng: 72.8620 },
  "borivali west": { lat: 19.2307, lng: 72.8567 },
  "borivali east": { lat: 19.2320, lng: 72.8690 },
  dahisar: { lat: 19.2541, lng: 72.8589 },
  "bandra west": { lat: 19.0596, lng: 72.8295 },
  "bandra east": { lat: 19.0616, lng: 72.8497 },
  "khar west": { lat: 19.0719, lng: 72.8347 },
  "santacruz west": { lat: 19.0836, lng: 72.8411 },
  "vile parle east": { lat: 19.0997, lng: 72.8468 },
  juhu: { lat: 19.1075, lng: 72.8263 },
  powai: { lat: 19.1176, lng: 72.9060 },
  marol: { lat: 19.1163, lng: 72.8731 },
  "kurla west": { lat: 19.0665, lng: 72.8770 },
  "ghatkopar west": { lat: 19.0889, lng: 72.9070 },
  "ghatkopar east": { lat: 19.0900, lng: 72.9170 },
  vikroli: { lat: 19.1095, lng: 72.9260 },
  kanjurmarg: { lat: 19.1270, lng: 72.9330 },
  bhandup: { lat: 19.1480, lng: 72.9340 },
  "mulund west": { lat: 19.1760, lng: 72.9430 },
  chembur: { lat: 19.0509, lng: 72.9019 },
  sion: { lat: 19.0439, lng: 72.8690 },
  "dadar west": { lat: 19.0213, lng: 72.8423 },
  worli: { lat: 19.0176, lng: 72.8300 },
  "lower parel": { lat: 18.9986, lng: 72.8290 },
  mahim: { lat: 19.0400, lng: 72.8400 },
  wadala: { lat: 19.0178, lng: 72.8560 },
  matunga: { lat: 19.0274, lng: 72.8540 },
  byculla: { lat: 18.9745, lng: 72.8403 },
  colaba: { lat: 18.9220, lng: 72.8347 },
  fort: { lat: 18.9388, lng: 72.8354 },
  /* — rest of the Mumbai Metropolitan Region — */
  "thane west": { lat: 19.2000, lng: 72.9700 },
  "thane east": { lat: 19.2100, lng: 72.9900 },
  "ram maruti road": { lat: 19.1970, lng: 72.9720 },
  "mira road": { lat: 19.2819, lng: 72.8693 },
  "bhayander west": { lat: 19.2969, lng: 72.8531 },
  "vasai west": { lat: 19.3816, lng: 72.8180 },
  virar: { lat: 19.4500, lng: 72.8000 },
  "nala sopara": { lat: 19.4200, lng: 72.8200 },
  panvel: { lat: 18.9894, lng: 73.1175 },
  kharghar: { lat: 19.0540, lng: 73.0650 },
  vashi: { lat: 19.0770, lng: 72.9980 },
  nerul: { lat: 19.0300, lng: 73.0200 },
  sanpada: { lat: 19.0640, lng: 73.0130 },
  koparkhairane: { lat: 19.1100, lng: 73.0100 },
  airoli: { lat: 19.1500, lng: 72.9960 },
  kalyan: { lat: 19.2400, lng: 73.1300 },
  dombivli: { lat: 19.2150, lng: 73.0900 },
  ulhasnagar: { lat: 19.2200, lng: 73.1500 },
  badlapur: { lat: 19.1500, lng: 73.2300 },
  palghar: { lat: 19.6950, lng: 72.7680 },
  alibaug: { lat: 18.6411, lng: 72.8792 },
  /* — other live partner cities — */
  bopal: { lat: 23.0520, lng: 72.4600 },
  vesu: { lat: 21.1650, lng: 72.7700 },
  "ranjit avenue": { lat: 31.6500, lng: 74.8600 },
  "t. nagar": { lat: 13.0418, lng: 80.2341 },
  "vijay nagar": { lat: 22.7520, lng: 75.8930 },
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

/* Mumbai (pilot city) is the fallback for an area we do not have a dot for. */
const FALLBACK_CENTER = { lat: 19.0760, lng: 72.8777 };

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
/** Skill Passport level ladder. */
export function levelKeyFor(jobsDone: number): string {
  if (jobsDone >= 500) return "lv.master";
  if (jobsDone >= 300) return "lv.expert";
  if (jobsDone >= 150) return "lv.pro";
  if (jobsDone >= 50) return "lv.verified";
  return "lv.new";
}

export const BADGE_LABELS: Record<string, string> = {
  kyc_verified: "KYC ✓",
  top_rated: "Top rated",
  skill_tested: "Skill tested",
  material_capable: "Material capable",
  fast_responder: "Fast responder",
  certified: "Certified",
};

export const RATE_UNIT_LABEL: Record<string, string> = {
  per_sqft: "/sqft",
  per_visit: "/visit",
  per_day: "/day",
};