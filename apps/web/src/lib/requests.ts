/* Demo-phase request store (localStorage). Production: REST /v1/requests.

   Status lifecycle
     open        posted, waiting for workers
     interested  a worker accepted the lead (S10 — A→B→C loop)
     accepted    customer hired a worker
     cancelled   customer withdrew the request

   `leads` is the per-worker response map; `acceptedBy` is the worker who took
   the job. Both are optional so S1-S9 records in LocalStorage stay readable. */
import type { Session } from "./session";

export type RequestStatus = "open" | "interested" | "accepted" | "cancelled" | "completed";

export type LeadAction = "interested" | "declined";

export type LeadEntry = { status: LeadAction; at: number; reason?: string };

export type ServiceRequest = {
  id: string;
  customer: string;
  city: string;
  zone: string;
  category: string;
  description: string;
  photos: string[];
  budget: string;
  material: boolean;
  date: string;
  slot: string;
  status: RequestStatus;
  at: number;
  /** Per-worker lead responses, keyed by provider id. */
  leads?: Record<string, LeadEntry>;
  /** Provider id that accepted the lead. */
  acceptedBy?: string | null;
  /** Display name of that provider, so the customer card needs no lookup. */
  acceptedName?: string | null;
  /** Response window opens when the request is posted (Blueprint Ch. 11.3). */
  windowEndsAt?: number;
    /** Booking details captured at hire — S12 (quote → slot → escrow advance). */
  jobOtp?: string | null;
  dateBooked?: string | null;
  slotBooked?: string | null;
  advancePaid?: number | null;
  quoteTotal?: number | null;
  /** Customer's star rating after completion. */
  rating?: number | null;
};

export type RequestDraft = Omit<ServiceRequest, "id" | "status" | "at" | "leads" | "acceptedBy" | "acceptedName" | "windowEndsAt">;

/** Workers get 30 minutes to respond before the lead moves on. */
export const RESPONSE_WINDOW_MIN = 30;

const KEY = "gs_requests";
const CHANGE = "gs:requests-changed";

function emit() {
  window.dispatchEvent(new CustomEvent(CHANGE));
}

/** Old records get the new fields, so nothing downstream needs a null check. */
function normalize(item: ServiceRequest): ServiceRequest {
  return { ...item, leads: item.leads ?? {}, acceptedBy: item.acceptedBy ?? null, acceptedName: item.acceptedName ?? null };
}

function save(next: ServiceRequest[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    emit();
  } catch {
    /* private mode */
  }
}

export function getRequests(): ServiceRequest[] {
  try {
    const raw = localStorage.getItem(KEY);
    const list: ServiceRequest[] = raw ? (JSON.parse(raw) as ServiceRequest[]) : [];
    return list.map(normalize);
  } catch {
    return [];
  }
}

export function getRequest(id: string): ServiceRequest | undefined {
  return getRequests().find((r) => r.id === id);
}

export function addRequest(input: RequestDraft): ServiceRequest {
  const created: ServiceRequest = {
    ...input,
    id: `req_${Date.now()}`,
    status: "open",
    at: Date.now(),
    leads: {},
    acceptedBy: null,
    acceptedName: null,
    windowEndsAt: Date.now() + RESPONSE_WINDOW_MIN * 60_000,
  };
  save([...getRequests(), created]);
  return created;
}

/** A worker took the lead: open → interested, and the customer gets notified. */
export function acceptLead(id: string, providerId: string, providerName: string): ServiceRequest | undefined {
  const at = Date.now();
  let updated: ServiceRequest | undefined;
  const next = getRequests().map((r) => {
    if (r.id !== id) return r;
    updated = {
      ...r,
      status: r.status === "open" ? ("interested" as RequestStatus) : r.status,
      leads: { ...(r.leads ?? {}), [providerId]: { status: "interested" as LeadAction, at } },
      acceptedBy: providerId,
      acceptedName: providerName,
    };
    return updated;
  });
  if (updated) save(next);
  return updated;
}

/** A worker passed on the lead: the request stays open for everyone else,
    and the reason feeds future matching (Blueprint Ch. 11.3). */
export function declineLead(id: string, providerId: string, reason: string): ServiceRequest | undefined {
  const at = Date.now();
  let updated: ServiceRequest | undefined;
  const next = getRequests().map((r) => {
    if (r.id !== id) return r;
    updated = { ...r, leads: { ...(r.leads ?? {}), [providerId]: { status: "declined" as LeadAction, at, reason } } };
    return updated;
  });
  if (updated) save(next);
  return updated;
}

export function cancelRequest(id: string) {
  save(getRequests().map((r) => (r.id === id ? { ...r, status: "cancelled" as RequestStatus } : r)));
}

/** Customer hired the worker who accepted — completes A → B → C. */
export function hireRequest(id: string) {
  save(getRequests().map((r) => (r.id === id ? { ...r, status: "accepted" as RequestStatus } : r)));
}

export function interestedCount(r: ServiceRequest): number {
  return Object.values(r.leads ?? {}).filter((l) => l.status === "interested").length;
}

export function declinedCount(r: ServiceRequest): number {
  return Object.values(r.leads ?? {}).filter((l) => l.status === "declined").length;
}

/** Has this worker already responded to this request? */
export function leadStateOf(r: ServiceRequest, providerId: string): LeadEntry | undefined {
  return r.leads?.[providerId];
}

export function onRequestsChange(cb: () => void) {
  const handler = () => cb();
  window.addEventListener(CHANGE, handler);
  /* Live cross-tab: browser fires `storage` in every OTHER tab on LS change. */
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE, handler);
    window.removeEventListener("storage", handler);
  };
}
/** 4-digit job OTP the customer reads out at site start (Blueprint Ch. 09.7). */
export function makeOtp(): string {
  return String(Math.floor(1000 + Math.random() * 9000));
}

export type BookingDetails = { date: string; slot: string; advance: number; total: number };

/** Quote accept → slot lock → advance into escrow. Completes A → B → C. */
export function hireWithBooking(id: string, details: BookingDetails): ServiceRequest | undefined {
  let updated: ServiceRequest | undefined;
  const next = getRequests().map((r) => {
    if (r.id !== id) return r;
    updated = {
      ...r,
      status: "accepted",
      dateBooked: details.date,
      slotBooked: details.slot,
      advancePaid: details.advance,
      quoteTotal: details.total,
      jobOtp: makeOtp(),
    };
    return updated;
  });
  if (updated) save(next);
  return updated;
}

/** Provider marked the work done — customer side moves to Completed + review. */
export function completeRequest(id: string) {
  save(getRequests().map((r) => (r.id === id ? { ...r, status: "completed" as RequestStatus } : r)));
}

export function reviewRequest(id: string, stars: number) {
  save(getRequests().map((r) => (r.id === id ? { ...r, rating: stars } : r)));
}

export type { Session };