/* Demo-phase provider state (localStorage): online switch, decline reasons and
   payout placeholders. Production: PATCH /v1/providers/me/availability. */
import type { ProviderProfile } from "./providers";

export type ProviderState = {
  online: boolean;
  declinedReasons: Record<string, number>;
  todayEarnings: number;
  weekEarnings: number;
  inEscrow: number;
  pendingPayout: number;
  /** Earnings for the last 14 days — the chart on the Earnings tab reads this. */
  history: { date: string; amount: number }[];
    /** Per-request job progress set from the Work tab (S10). */
jobProgress: Record<string, "started" | "completed">;
};

const KEY = "gs_provider_state";
const CHANGE = "gs:provider-state-changed";

/** Seed numbers so the dashboard never looks empty during a demo. */
function seedHistory(): { date: string; amount: number }[] {
  const out: { date: string; amount: number }[] = [];
  const base = [0, 1200, 0, 2400, 1800, 0, 3100, 900, 0, 2600, 2200, 1500, 0, 2340];
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ date: d.toISOString().slice(0, 10), amount: base[13 - i] ?? 0 });
  }
  return out;
}

function defaultState(): ProviderState {
  return {
    online: true,
    declinedReasons: {},
    todayEarnings: 2340,
    weekEarnings: 11200,
    inEscrow: 18600,
    pendingPayout: 8400,
    history: seedHistory(),
    jobProgress: {},
  };
}

function emit() {
  window.dispatchEvent(new CustomEvent(CHANGE));
}

export function getProviderState(): ProviderState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaultState(), ...(JSON.parse(raw) as Partial<ProviderState>) } : defaultState();
  } catch {
    return defaultState();
  }
}

export function setProviderState(patch: Partial<ProviderState>) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...getProviderState(), ...patch }));
    emit();
  } catch {
    /* private mode */
  }
}

export function toggleOnline(): boolean {
  const next = !getProviderState().online;
  setProviderState({ online: next });
  return next;
}

export function recordDecline(reason: string) {
  const reasons = getProviderState().declinedReasons;
  setProviderState({ declinedReasons: { ...reasons, [reason]: (reasons[reason] ?? 0) + 1 } });
}

export function onProviderStateChange(cb: () => void) {
  const handler = () => cb();
  window.addEventListener(CHANGE, handler);
  /* Live cross-tab: browser fires `storage` in every OTHER tab on LS change. */
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE, handler);
    window.removeEventListener("storage", handler);
  };
}

/** Demo helper — drops a matching customer request into the marketplace so the
    leads deck always has something to show an evaluator. */
export function addDemoRequest(profile: ProviderProfile) {
  const samples = [
    "Two bedrooms need repainting, walls have small cracks and one damp patch near the window.",
    "Living hall plus passage, old paint is flaking. Looking for a clean royale finish.",
    "Ceiling and three walls of the study need a fresh coat before the festival week.",
  ];
  return {
    customer: "Ramesh Joshi",
    city: profile.city,
    zone: profile.zone,
    category: profile.skills[0] ?? "painting",
    description: samples[Math.floor(Math.random() * samples.length)] ?? samples[0],
    photos: ["wall-1.jpg", "wall-2.jpg"],
    budget: "s",
    material: true,
    date: "",
    slot: "f",
  };
}
export function setJobProgress(requestId: string, status: "started" | "completed") {
  const map = getProviderState().jobProgress ?? {};
  setProviderState({ jobProgress: { ...map, [requestId]: status } });
}