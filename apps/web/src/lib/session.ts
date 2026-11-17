/* Demo-phase session store — PER TAB (sessionStorage), plus an optional
   "remember this device" mirror in localStorage so a brand-new tab can pick
   the saved identity up. Production: JWT + httpOnly refresh cookie. */
import type { Role } from "@/components/auth/types";

export type Session = {
  role: Role;
  name: string;
  mode: "signup" | "login";
  at: number;
  /** Answers typed into the signup form (zone, experience, GSTIN, ...).
      Absent for a plain log-in, so every reader must treat it as optional. */
  data?: Record<string, string>;
};

const KEY = "gs_session";
const REMEMBER = "gs_session_remember";
const CHANGE = "gs:session-changed";

export function getSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(KEY) ?? localStorage.getItem(REMEMBER);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session) {
  try {
    sessionStorage.setItem(KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent(CHANGE));
  } catch {
    /* private mode */
  }
}

/** "Remember this device" — a new tab picks up the saved identity at once. */
export function setRemembered(session: Session | null) {
  try {
    if (session) localStorage.setItem(REMEMBER, JSON.stringify(session));
    else localStorage.removeItem(REMEMBER);
  } catch {
    /* private mode */
  }
}

export function clearSession() {
  try {
    sessionStorage.removeItem(KEY);
    localStorage.removeItem(REMEMBER);
    window.dispatchEvent(new CustomEvent(CHANGE));
  } catch {
    /* private mode */
  }
}

export function onSessionChange(cb: () => void) {
  window.addEventListener(CHANGE, cb);
  return () => window.removeEventListener(CHANGE, cb);
}

/* Checkout intent: a guest who taps "Place order" in the public cart keeps
   the basket (pt_cart is shared with the dashboard) and lands in the Paint
   Store right after logging in, so the same lines continue under a named
   account instead of a guest checkout minting an untraceable order. */
const CHECKOUT = "pt_checkout_intent";

export function setCheckoutIntent(on: boolean) {
  try {
    if (on) sessionStorage.setItem(CHECKOUT, "1");
    else sessionStorage.removeItem(CHECKOUT);
  } catch {
    /* private mode */
  }
}

/** Read-once: the workspace consumes it as its landing view. */
export function takeCheckoutIntent(): boolean {
  try {
    const on = sessionStorage.getItem(CHECKOUT) === "1";
    sessionStorage.removeItem(CHECKOUT);
    return on;
  } catch {
    return false;
  }
}