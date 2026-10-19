/* Demo-phase session store — PER TAB (sessionStorage), so one browser can run
   customer in one tab and worker in another (demo/evaluator workflow).
   Production replaces this with JWT + httpOnly refresh cookie. */
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
    const raw = sessionStorage.getItem(KEY);
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

export function clearSession() {
  try {
    sessionStorage.removeItem(KEY);
    window.dispatchEvent(new CustomEvent(CHANGE));
  } catch {
    /* private mode */
  }
}

export function onSessionChange(cb: () => void) {
  const handler = () => cb();
  window.addEventListener(CHANGE, handler);
  /* Live cross-tab: browser fires `storage` in every OTHER tab on LS change. */
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE, handler);
    window.removeEventListener("storage", handler);
  };
}