/* Demo-phase session store. Production replaces this with JWT + httpOnly
   refresh cookie; the shape stays identical so nothing else changes. */
import type { Role } from "@/components/auth/types";

export type Session = {
  role: Role;
  name: string;
  mode: "signup" | "login";
  at: number;
};

const KEY = "gs_session";
const CHANGE = "gs:session-changed";

export function getSession(): Session | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(session: Session) {
  try {
    localStorage.setItem(KEY, JSON.stringify(session));
    window.dispatchEvent(new CustomEvent(CHANGE));
  } catch {
    /* private mode */
  }
}

export function clearSession() {
  try {
    localStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent(CHANGE));
  } catch {
    /* private mode */
  }
}

export function onSessionChange(cb: () => void) {
  window.addEventListener(CHANGE, cb);
  return () => window.removeEventListener(CHANGE, cb);
}