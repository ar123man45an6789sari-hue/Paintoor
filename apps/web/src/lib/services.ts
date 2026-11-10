/* Services catalogue + crew maths for the /services page. Labour rates are
   per sq ft; day estimates scale with area and crew size. Frontend-only:
   crews, slots and bookings (localStorage pt_bookings) are showcase mocks. */

export type Service = {
  id: string; rate: number; prod: number; rating: number; jobs: number;
  grad: [string, string]; surface: string; coats: number;
};

export const SERVICES: Service[] = [
  { id: "interior", rate: 26, prod: 320, rating: 4.8, jobs: 412, grad: ["#f7c9d9", "#e00048"], surface: "interior", coats: 2 },
  { id: "exterior", rate: 32, prod: 260, rating: 4.7, jobs: 186, grad: ["#fbdce6", "#a80036"], surface: "exterior", coats: 2 },
  { id: "waterproof", rate: 58, prod: 180, rating: 4.8, jobs: 97, grad: ["#f4cfd9", "#8f002e"], surface: "exterior", coats: 2 },
  { id: "wood", rate: 46, prod: 220, rating: 4.6, jobs: 143, grad: ["#f9d3de", "#c2003f"], surface: "wood", coats: 2 },
  { id: "texture", rate: 85, prod: 120, rating: 4.9, jobs: 64, grad: ["#f2c4d3", "#a80036"], surface: "interior", coats: 1 },
  { id: "refresh", rate: 22, prod: 420, rating: 4.7, jobs: 238, grad: ["#fbdce6", "#e00048"], surface: "interior", coats: 1 },
];

export const serviceOf = (id: string): Service => SERVICES.find((s) => s.id === id) ?? SERVICES[0];

/* sq ft a crew paints per day ≈ service productivity × crew heads. */
export const crewDays = (sv: Service, area: number, crew: number): number =>
  Math.max(1, Math.ceil(area / (sv.prod * crew)));

export const CREWS = [
  { name: "Ramesh Yadav", rating: 4.9, jobs: 212, langs: "HI · GU", since: 2016 },
  { name: "Salim Pathan", rating: 4.8, jobs: 176, langs: "HI · UR · GU", since: 2018 },
  { name: "Dinesh Prajapati", rating: 4.7, jobs: 143, langs: "GU · HI", since: 2020 },
];

/* Next n days as bookable slots (tomorrow onwards). */
export type Slot = { key: string; label: string };
export function nextSlots(n = 7): Slot[] {
  const out: Slot[] = [];
  for (let i = 1; i <= n; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push({
      key: d.toISOString().slice(0, 10),
      label: d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" }),
    });
  }
  return out;
}

export const DAYPARTS = ["am", "pm", "eve"] as const;
export type DayPart = (typeof DAYPARTS)[number];

/* A saved booking (localStorage pt_bookings). */
export type Booking = {
  id: string; svc: string; area: number; crew: number; store: string;
  total: number; slot: string; part: DayPart; wa: boolean; at: number;
};

export function readBookings(): Booking[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("pt_bookings");
    const v = raw ? (JSON.parse(raw) as Booking[]) : [];
    return Array.isArray(v) ? v : [];
  } catch {
    return [];
  }
}

export function saveBookings(list: Booking[]) {
  try { window.localStorage.setItem("pt_bookings", JSON.stringify(list)); } catch { /* private mode */ }
}