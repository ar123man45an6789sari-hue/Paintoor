/* Tiny event bus: any component can open the auth modal
   (hero CTA, header buttons, mobile sign-in) without prop drilling. */
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