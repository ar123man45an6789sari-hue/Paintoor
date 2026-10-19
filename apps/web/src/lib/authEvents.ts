/* Tiny event bus: koi bhi component auth modal khol sakta hai
   (hero CTA, header buttons, mobile Entrance) bina prop drilling. */
import type { AuthMode } from "@/components/auth/types";

const EVENT = "gs:auth";

export function requestAuth(mode: AuthMode) {
  window.dispatchEvent(new CustomEvent<AuthMode>(EVENT, { detail: mode }));
}

export function onAuthRequest(cb: (mode: AuthMode) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<AuthMode>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}