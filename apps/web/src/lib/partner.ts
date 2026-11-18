/* Partner workspace store — sent quotes, daily job updates, extension
   requests, work-start dates and the hero avatar. Demo-phase persistence
   (localStorage gs_partner) following the same change-event pattern as the
   other stores; production swaps in /v1/providers/me/* endpoints. */

import { localDayKey } from "./services";

export type PartnerQuote = {
  id: string;
  requestId: string;
  /** Labour portion in rupees — quotes are itemized by design. */
  labour: number;
  material: number;
  days: number;
  note: string;
  at: number;
};

export type DayUpdate = {
  at: number;
  text: string;
  /** Data URLs picked on site; the customer sees them through chat. */
  photos: string[];
  /** Optional data URL of a voice note attached to the update. */
  voice?: string;
};

export type Extension = {
  days: number;
  reason: string;
  /** Schedule changes only after the customer approves — until then: pending. */
  status: "pending" | "approved";
  at: number;
};

export type PartnerState = {
  avatar: string;
  quotes: PartnerQuote[];
  updates: Record<string, DayUpdate[]>;
  extensions: Record<string, Extension>;
  /** requestId -> local day key when work actually started on site. */
  starts: Record<string, string>;
};

const KEY = "gs_partner";
const CHANGE = "gs:partner-changed";

function defaultState(): PartnerState {
  return { avatar: "", quotes: [], updates: {}, extensions: {}, starts: {} };
}

export function getPartnerState(): PartnerState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaultState(), ...(JSON.parse(raw) as Partial<PartnerState>) } : defaultState();
  } catch {
    return defaultState();
  }
}

export function setPartnerState(patch: Partial<PartnerState>) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...getPartnerState(), ...patch }));
    window.dispatchEvent(new CustomEvent(CHANGE));
  } catch {
    /* private mode */
  }
}

export function onPartnerChange(cb: () => void) {
  const handler = () => cb();
  window.addEventListener(CHANGE, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE, handler);
    window.removeEventListener("storage", handler);
  };
}

export function setPartnerAvatar(dataUrl: string) {
  setPartnerState({ avatar: dataUrl });
}

/* ---- quotes ---- */

export function addQuote(q: Omit<PartnerQuote, "id" | "at">): PartnerQuote {
  const quote: PartnerQuote = { ...q, id: `q_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, at: Date.now() };
  setPartnerState({ quotes: [...getPartnerState().quotes, quote] });
  return quote;
}

export function quotesFor(requestId: string): PartnerQuote[] {
  return getPartnerState().quotes.filter((q) => q.requestId === requestId);
}

export function allQuotes(): PartnerQuote[] {
  return getPartnerState().quotes.slice().sort((a, b) => b.at - a.at);
}

/* ---- daily updates ---- */

export function addUpdate(requestId: string, u: Omit<DayUpdate, "at">) {
  const st = getPartnerState();
  const list = st.updates[requestId] ?? [];
  setPartnerState({ updates: { ...st.updates, [requestId]: [...list, { ...u, at: Date.now() }] } });
}

export function updatesFor(requestId: string): DayUpdate[] {
  return getPartnerState().updates[requestId] ?? [];
}

/* ---- extensions ---- */

export function requestExtension(requestId: string, days: number, reasonKey: string) {
  const st = getPartnerState();
  setPartnerState({ extensions: { ...st.extensions, [requestId]: { days, reason: reasonKey, status: "pending", at: Date.now() } } });
}

export function extensionFor(requestId: string): Extension | undefined {
  return getPartnerState().extensions[requestId];
}

/* ---- work starts and day maths ---- */

export function markStart(requestId: string) {
  const st = getPartnerState();
  if (!st.starts[requestId]) setPartnerState({ starts: { ...st.starts, [requestId]: localDayKey(new Date()) } });
}

/** 1-based day count since the on-site start, capped at the planned total. */
export function dayNumberOf(requestId: string, totalDays: number, completed: boolean): number {
  if (completed) return totalDays;
  const start = getPartnerState().starts[requestId];
  if (!start) return 0;
  const [sy, sm, sd] = start.split("-").map(Number);
  const s = new Date(sy ?? 2026, (sm ?? 1) - 1, sd ?? 1);
  const now = new Date();
  const diff = Math.floor((now.setHours(0, 0, 0, 0) - s.setHours(0, 0, 0, 0)) / 86_400_000) + 1;
  return Math.min(Math.max(diff, 1), totalDays);
}

/** Planned days for a job: the accepted quote's estimate, else a demo default. */
export function plannedDays(requestId: string, fallback = 4): number {
  const qs = quotesFor(requestId);
  const last = qs[qs.length - 1];
  return last && last.days > 0 ? last.days : fallback;
}