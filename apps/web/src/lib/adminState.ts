/* Admin demo state (localStorage): the control-room decisions an admin
   makes — blocks, KYC verdicts, listing removals, escrow holds, incident
   resolutions, banner toggles and an audit log. Everything here is a local
   demo flag until Phase 2.7 wires the panel to the real database; the UI
   always says so (ad.demo chip). Own key, own event bus — never touches
   the role stores' semantics. */

export type Incident = {
  id: string;
  kind: "fraud" | "pricing" | "quality" | "review";
  subject: string;
  detail: string;
  at: number;
  status: "open" | "resolved" | "dismissed";
};

export type LogEntry = { at: number; text: string };

export type AdminState = {
  passcode: string;
  blocked: Record<string, string>; // id -> reason key
  kyc: Record<string, "approved" | "rejected">;
  removed: Record<string, boolean>; // product id -> removed from listing
  holds: Record<string, boolean>; // escrow milestone id -> admin hold
  incidents: Incident[];
  banners: Record<string, boolean>; // banner id -> live
  log: LogEntry[];
};

const KEY = "gs_admin_state";
const CHANGE = "gs:admin-changed";
export const DEMO_PASSCODE = "paintoor-admin";

const SEED_INCIDENTS: Incident[] = [
  {
    id: "inc-1",
    kind: "fraud",
    subject: "Suresh K. (partner)",
    detail: "Three customers report advance taken, then unreachable for 9 days.",
    at: Date.now() - 86_400_000 * 2,
    status: "open",
  },
  {
    id: "inc-2",
    kind: "pricing",
    subject: "WeatherCoat 10L (shop listing)",
    detail: "Listed 38% above the marketplace average for the same pack.",
    at: Date.now() - 86_400_000,
    status: "open",
  },
  {
    id: "inc-3",
    kind: "quality",
    subject: "Job PT-2481 (escrow)",
    detail: "Customer raised finish complaint before milestone 2 release.",
    at: Date.now() - 3_600_000 * 8,
    status: "open",
  },
  {
    id: "inc-4",
    kind: "review",
    subject: "Review on Rang Paints & Hardware",
    detail: "Abusive language reported by the shop owner.",
    at: Date.now() - 86_400_000 * 4,
    status: "resolved",
  },
];

const DEFAULT_STATE: AdminState = {
  passcode: DEMO_PASSCODE,
  blocked: {},
  kyc: {},
  removed: {},
  holds: {},
  incidents: SEED_INCIDENTS,
  banners: { announce: true, festival: false },
  log: [],
};

function emit() {
  window.dispatchEvent(new CustomEvent(CHANGE));
}

export function getAdmin(): AdminState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STATE, incidents: [...SEED_INCIDENTS], log: [] };
    const saved = JSON.parse(raw) as Partial<AdminState>;
    return {
      ...DEFAULT_STATE,
      ...saved,
      blocked: saved.blocked ?? {},
      kyc: saved.kyc ?? {},
      removed: saved.removed ?? {},
      holds: saved.holds ?? {},
      incidents: saved.incidents ?? [...SEED_INCIDENTS],
      banners: { ...DEFAULT_STATE.banners, ...(saved.banners ?? {}) },
      log: saved.log ?? [],
    };
  } catch {
    return { ...DEFAULT_STATE, incidents: [...SEED_INCIDENTS], log: [] };
  }
}

export function setAdmin(patch: Partial<AdminState>) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...getAdmin(), ...patch }));
    emit();
  } catch {
    /* private mode */
  }
}

export function onAdminChange(cb: () => void) {
  const handler = () => cb();
  window.addEventListener(CHANGE, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE, handler);
    window.removeEventListener("storage", handler);
  };
}

/** Every write action stamps the audit log — the panel keeps its own diary. */
function logIt(text: string) {
  const a = getAdmin();
  setAdmin({ log: [{ at: Date.now(), text }, ...a.log].slice(0, 50) });
}

export function isBlocked(id: string): boolean {
  return Boolean(getAdmin().blocked[id]);
}

export function toggleBlock(id: string, label: string) {
  const a = getAdmin();
  if (a.blocked[id]) {
    const next = { ...a.blocked };
    delete next[id];
    setAdmin({ blocked: next });
    logIt(`Unblocked ${label}`);
  } else {
    setAdmin({ blocked: { ...a.blocked, [id]: "ad.blk.reason" } });
    logIt(`Blocked ${label}`);
  }
}

export function setKyc(id: string, verdict: "approved" | "rejected") {
  const a = getAdmin();
  setAdmin({ kyc: { ...a.kyc, [id]: verdict } });
  logIt(`KYC ${verdict}: ${id}`);
}

export function toggleListing(productId: string, name: string) {
  const a = getAdmin();
  const next = !a.removed[productId];
  setAdmin({ removed: { ...a.removed, [productId]: next } });
  logIt(next ? `Removed listing ${name}` : `Restored listing ${name}`);
}

export function toggleHold(milestoneId: string, jobLabel: string) {
  const a = getAdmin();
  const next = !a.holds[milestoneId];
  setAdmin({ holds: { ...a.holds, [milestoneId]: next } });
  logIt(next ? `Escrow hold ON ${jobLabel}` : `Escrow hold OFF ${jobLabel}`);
}

export function resolveIncident(id: string) {
  const a = getAdmin();
  setAdmin({ incidents: a.incidents.map((i) => (i.id === id ? { ...i, status: "resolved" as const } : i)) });
  logIt(`Incident resolved: ${id}`);
}

export function dismissIncident(id: string) {
  const a = getAdmin();
  setAdmin({ incidents: a.incidents.map((i) => (i.id === id ? { ...i, status: "dismissed" as const } : i)) });
  logIt(`Incident dismissed: ${id}`);
}

export function setBanner(id: string, on: boolean) {
  const a = getAdmin();
  setAdmin({ banners: { ...a.banners, [id]: on } });
  logIt(`Banner ${id} ${on ? "live" : "paused"}`);
}

export function setPasscode(next: string) {
  setAdmin({ passcode: next });
  logIt("Admin passcode changed");
}

export function resetAdmin() {
  try {
    localStorage.removeItem(KEY);
    emit();
  } catch {
    /* private mode */
  }
}