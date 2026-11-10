/* Tiny event bus: any component can open the auth modal
   (hero CTA, header buttons, landing role lenses) without prop drilling.
   An optional role skips the role picker and lands straight on that
   role's form, keeping the Register / Log in tabs available. */
import type { AuthMode, Role } from "@/components/auth/types";

const EVENT = "gs:auth";

export type AuthRequest = { mode: AuthMode; role: Role | null };

export function requestAuth(mode: AuthMode, role?: Role) {
  window.dispatchEvent(new CustomEvent<AuthRequest>(EVENT, { detail: { mode, role: role ?? null } }));
}

export function onAuthRequest(cb: (req: AuthRequest) => void) {
  const handler = (e: Event) => cb((e as CustomEvent<AuthRequest>).detail);
  window.addEventListener(EVENT, handler);
  return () => window.removeEventListener(EVENT, handler);
}