/* Demo-phase session store — PER TAB (sessionStorage), plus an optional
   "remember this device" mirror in localStorage so a brand-new tab can pick
   the saved identity up. Production: JWT + httpOnly refresh cookie. */
import type { Role } from "@/components/auth/types";

export type Session = {
  role: Role;
  name: string;
  mode: "signup" | "login";
  at: number;
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

/** "Remember this device" — naya tab khulte hi saved identity mil jaayegi. */
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