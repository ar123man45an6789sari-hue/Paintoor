/* Customer profile store — demo phase (localStorage).

   One shared record behind the hero avatar, the profile drawer and (later)
   the settings panel, so a photo upload appears everywhere at once.
   Cross-tab sync via the storage event, same-tab sync via a window event.
   Production: the same shape arrives from the accounts API. */

import { useCallback, useEffect, useRef, useState } from "react";

export type AlertKey =
  | "photos"
  | "escrow"
  | "arrival"
  | "voice"
  | "sms"
  | "email"
  | "offers";

export type Address = { id: string; label: string; line: string; primary: boolean };

export type Profile = {
  name: string;
  email: string;
  phone: string;
  city: string;
  photo: string; // data URL, empty = initials
  addresses: Address[];
  twoStep: boolean;
  alerts: Record<AlertKey, boolean>;
};

const KEY = "pt_dash_profile_v1";
const EVENT = "pt:profile";

const SEED: Profile = {
  name: "Rahul Gupta",
  email: "rahul.gupta@gmail.com",
  phone: "+91 98250 41123",
  city: "Vadodara",
  photo: "",
  addresses: [
    { id: "a1", label: "Home", line: "302, Shanti Residency, Alkapuri, Vadodara", primary: true },
    { id: "a2", label: "Parents", line: "14, Gokul Row Houses, Karelibaug, Vadodara", primary: false },
  ],
  twoStep: true,
  alerts: { photos: true, escrow: true, arrival: true, voice: true, sms: false, email: true, offers: false },
};

function isValid(p: unknown): p is Profile {
  if (typeof p !== "object" || p === null) return false;
  const o = p as Record<string, unknown>;
  return typeof o.name === "string" && Array.isArray(o.addresses) && typeof o.alerts === "object";
}

function read(): Profile {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (!raw) return SEED;
    const parsed: unknown = JSON.parse(raw);
    return isValid(parsed) ? parsed : SEED;
  } catch {
    return SEED;
  }
}

/** Shared profile state; writes persist and notify every listener. */
export function useProfile(): [Profile, (up: (p: Profile) => Profile) => void] {
  const [profile, setState] = useState<Profile>(SEED);
  const ref = useRef(profile);
  ref.current = profile;

  useEffect(() => {
    const sync = () => {
      const next = read();
      ref.current = next;
      setState(next);
    };
    sync();
    window.addEventListener("storage", sync);
    window.addEventListener(EVENT, sync);
    return () => {
      window.removeEventListener("storage", sync);
      window.removeEventListener(EVENT, sync);
    };
  }, []);

  const update = useCallback((up: (p: Profile) => Profile) => {
    const next = up(ref.current);
    ref.current = next;
    try {
      window.localStorage.setItem(KEY, JSON.stringify(next));
    } catch {
      /* storage full or blocked — the demo continues in memory */
    }
    window.dispatchEvent(new Event(EVENT));
    setState(next);
  }, []);

  return [profile, update];
}

/** "Rahul Gupta" -> "RG"; falls back to a single letter or "?". */
export function initialsOf(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  return (parts[0][0] + (parts[1]?.[0] ?? "")).toUpperCase();
}

export const MAX_PHOTO_BYTES = 2 * 1024 * 1024;

/** JPG/PNG up to 2 MB -> data URL; anything else resolves { ok: false }. */
export function readPhotoFile(file: File): Promise<{ ok: true; dataUrl: string } | { ok: false }> {
  if (file.type !== "image/jpeg" && file.type !== "image/png") return Promise.resolve({ ok: false });
  if (file.size > MAX_PHOTO_BYTES) return Promise.resolve({ ok: false });
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(typeof r.result === "string" ? { ok: true, dataUrl: r.result } : { ok: false });
    r.onerror = () => resolve({ ok: false });
    r.readAsDataURL(file);
  });
}