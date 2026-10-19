/* Demo-phase request store (localStorage). Production: POST /v1/requests. */
import type { Session } from "./session";

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
  status: "open";
  at: number;
};

const KEY = "gs_requests";
const CHANGE = "gs:requests-changed";

export function getRequests(): ServiceRequest[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as ServiceRequest[]) : [];
  } catch {
    return [];
  }
}

export function addRequest(input: Omit<ServiceRequest, "id" | "status" | "at">) {
  const next = [...getRequests(), { ...input, id: `req_${Date.now()}`, status: "open" as const, at: Date.now() }];
  try {
    localStorage.setItem(KEY, JSON.stringify(next));
    window.dispatchEvent(new CustomEvent(CHANGE));
  } catch {
    /* private mode */
  }
  return next[next.length - 1];
}

export function onRequestsChange(cb: () => void) {
  window.addEventListener(CHANGE, cb);
  return () => window.removeEventListener(CHANGE, cb);
}

export type { Session };