/* Demo-phase request store (localStorage). Production: REST /v1/requests.

   Status lifecycle
     open        posted, waiting for workers
     interested  a worker accepted the lead (S10 — A→B→C loop)
     accepted    customer hired a worker
     cancelled   customer withdrew the request
     completed work finished and rated (S11)

   `leads` is the per-worker response map; `acceptedBy` is the worker who took
   the job. Both are optional so S1-S9 records in LocalStorage stay readable. */
import type { Session } from "./session";
import { getSession } from "./session";

export type RequestStatus = "open" | "interested" | "accepted" | "cancelled" | "completed";

export type LeadAction = "interested" | "declined";

export type LeadEntry = { status: LeadAction; at: number; reason?: string };

export type ServiceRequest = {
  id: string;
  customer: string;
  city: string;
  zone: string;
  /** Nearby landmark typed by the customer (optional). */
  landmark?: string;
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
   /** Response window opens when the request is posted (the A to B to C loop). */
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
    id: `req_${crypto.randomUUID()}`,
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
       acceptedBy: r.acceptedBy ?? providerId,
      acceptedName: r.acceptedName ?? providerName,
    };
    return updated;
  });
  if (updated) save(next);
  return updated;
}

/** A worker passed on the lead: the request stays open for everyone else,
    and the reason feeds future matching. */
export function declineLead(id: string, providerId: string, reason: string): ServiceRequest | undefined {
  const at = Date.now();
  let updated: ServiceRequest | undefined;
  const next = getRequests().map((r) => {
    if (r.id !== id) return r;
       updated = {
      ...r,
      leads: { ...(r.leads ?? {}), [providerId]: { status: "declined" as LeadAction, at, reason } },
      /* A partner who declines must not stay displayed as the accepted one. */
      acceptedBy: r.acceptedBy === providerId ? null : r.acceptedBy,
      acceptedName: r.acceptedBy === providerId ? null : r.acceptedName,
    };
    return updated;
  });
  if (updated) save(next);
  return updated;
}

export function cancelRequest(id: string) {
  if (liveRequests()) {
    /* DB is the source of truth; a 409 (already cancelled) is fine —
       the re-sync simply shows the real state. */
    void fetch(`/api/requests/${id}/cancel`, { method: "POST" }).finally(() => {
      void syncRequests();
    });
    return;
  }
  save(getRequests().map((r) => (r.id === id ? { ...r, status: "cancelled" as RequestStatus } : r)));
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
/** 4-digit job OTP the customer reads out at site start. */
export function makeOtp(): string {
   const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return String(1000 + (buf[0] % 9000));
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

/* ---------- live mode (Module 2.4) ----------
   Signed-in = this store mirrors the cloud DB through /api/requests
   (RLS-scoped reads, DEFINER-fn writes). No session = pure demo seeds
   until the launch cleanup deletes them. */

export function liveRequests(): boolean {
  return getSession() !== null;
}

function bucketFor(paise: number): string {
  if (paise <= 5_000_000) return "e";
  if (paise <= 20_000_000) return "s";
  return "p";
}

type LiveLead = { partnerId: string; partnerName?: string; status: string; at: string };
type LiveRequest = {
  id: string;
  city: string;
  zone: string;
  category: string;
  description: string;
  budgetPaise: number;
  materialNeeded: boolean;
  preferredDate: string | null;
  slot: string | null;
  status: RequestStatus;
  createdAt: string;
  acceptedPartnerId: string | null;
  leads: LiveLead[];
  job: unknown;
};

/** Pull the signed-in customer's real requests into the store. */
export async function syncRequests(): Promise<boolean> {
  if (!liveRequests()) return false;
  try {
    const r = await fetch("/api/requests");
    if (!r.ok) return false;
    const j = (await r.json()) as { ok: boolean; requests: LiveRequest[] };
    if (!j.ok) return false;
    const me = getSession();
    const mapped: ServiceRequest[] = j.requests.map((x) => {
      const accepted = x.leads.find((l) => l.partnerId === x.acceptedPartnerId);
      return normalize({
        id: x.id,
        customer: me?.name ?? "You",
        city: x.city,
        zone: x.zone,
        category: x.category,
        description: x.description,
        photos: [],
        budget: bucketFor(x.budgetPaise),
        material: x.materialNeeded,
        date: x.preferredDate ? String(x.preferredDate).slice(0, 10) : "",
        slot: x.slot ?? "f",
        status: x.status,
        at: new Date(x.createdAt).getTime(),
        leads: Object.fromEntries(
          x.leads.map((l) => [
            l.partnerId,
            {
              status: (l.status === "declined" ? "declined" : "interested") as LeadAction,
              at: new Date(l.at).getTime(),
            },
          ]),
        ),
        acceptedBy: x.acceptedPartnerId,
        acceptedName: accepted?.partnerName ?? null,
      });
    });
    save(mapped);
    return true;
  } catch {
    return false;
  }
}

/** Signed-in posting writes a real DB row; the store re-syncs after. */
export async function addRequestLive(input: {
  city: string;
  zone: string;
  category: string;
  description: string;
  budget: string;
  material: boolean;
  date: string;
  slot: string;
}): Promise<boolean> {
  if (!liveRequests()) return false;
  const budgetPaise = input.budget === "e" ? 5_000_000 : input.budget === "s" ? 15_000_000 : 30_000_000;
  try {
    const r = await fetch("/api/requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        city: input.city,
        zone: input.zone,
        category: input.category,
        description: input.description,
        budgetPaise,
        materialNeeded: input.material,
        preferredDate: input.date || undefined,
        slot: input.slot,
      }),
    });
    if (!r.ok) return false;
    await syncRequests();
    return true;
  } catch {
    return false;
  }
}