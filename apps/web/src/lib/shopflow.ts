
/* Shopkeeper flow store (localStorage): everything the counter needs beyond
   lib/shopState — store open/paused, ready-time promises, packed flags,
   declines, order-linked trade chat, listing toggles and alert prefs.
   Stock and sales still move ONLY through shopState.deliverOrder, so the
   "delivery confirms everything" rule keeps one source of truth. */

export type ShopMsg = { from: "in" | "out"; text: string; at: number };

export type ShopPrefs = { remind: boolean; low: boolean; payout: boolean };

export type ShopHours = { open: string; close: string };

export type ShopFlowState = {
  open: boolean;
  hours: ShopHours;
  ready: Record<string, { mins: number; at: number }>;
  packed: Record<string, boolean>;
  declines: Record<string, { reason: string; at: number }>;
  threads: Record<string, ShopMsg[]>;
  listed: Record<string, boolean>;
  prefs: ShopPrefs;
};

const KEY = "gs_shop_flow";
const CHANGE = "gs:shop-flow-changed";

const DEFAULT_STATE: ShopFlowState = {
  open: true,
  hours: { open: "09:00", close: "21:00" },
  ready: {},
  packed: {},
  declines: {},
  threads: {},
  listed: {},
  prefs: { remind: true, low: true, payout: true },
};

function emit() {
  window.dispatchEvent(new CustomEvent(CHANGE));
}

export function getFlow(): ShopFlowState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return { ...DEFAULT_STATE, prefs: { ...DEFAULT_STATE.prefs } };
    const saved = JSON.parse(raw) as Partial<ShopFlowState>;
    return {
      ...DEFAULT_STATE,
      ...saved,
      prefs: { ...DEFAULT_STATE.prefs, ...(saved.prefs ?? {}) },
      hours: { ...DEFAULT_STATE.hours, ...(saved.hours ?? {}) },
      ready: saved.ready ?? {},
      packed: saved.packed ?? {},
      declines: saved.declines ?? {},
      threads: saved.threads ?? {},
      listed: saved.listed ?? {},
    };
  } catch {
    return { ...DEFAULT_STATE, prefs: { ...DEFAULT_STATE.prefs } };
  }
}

export function setFlow(patch: Partial<ShopFlowState>) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...getFlow(), ...patch }));
    emit();
  } catch {
    /* private mode */
  }
}

export function onFlowChange(cb: () => void) {
  const handler = () => cb();
  window.addEventListener(CHANGE, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE, handler);
    window.removeEventListener("storage", handler);
  };
}

/** Store open/paused — while paused the counter stops taking new orders. */
export function setStoreOpen(open: boolean) {
  setFlow({ open });
}

/** Counter hours shown on the storefront profile. */
export function setHours(hours: ShopHours) {
  setFlow({ hours });
}

/** Ready-time promise confirmed at accept; the painter is notified. */
export function confirmReady(orderId: string, mins: number) {
  const flow = getFlow();
  setFlow({ ready: { ...flow.ready, [orderId]: { mins, at: Date.now() } } });
}

export function setPacked(orderId: string, on: boolean) {
  const flow = getFlow();
  setFlow({ packed: { ...flow.packed, [orderId]: on } });
}

export function declineOrder(orderId: string, reason: string) {
  const flow = getFlow();
  setFlow({ declines: { ...flow.declines, [orderId]: { reason, at: Date.now() } } });
}

export function sendShopMsg(orderId: string, text: string) {
  const flow = getFlow();
  const thread = flow.threads[orderId] ?? [];
  setFlow({ threads: { ...flow.threads, [orderId]: [...thread, { from: "out", text, at: Date.now() }] } });
}

export function threadFor(orderId: string): ShopMsg[] {
  return getFlow().threads[orderId] ?? [];
}

export function readyFor(orderId: string): { mins: number; at: number } | undefined {
  return getFlow().ready[orderId];
}

export function packedFor(orderId: string): boolean {
  return getFlow().packed[orderId] ?? false;
}

export function declineFor(orderId: string): { reason: string; at: number } | undefined {
  return getFlow().declines[orderId];
}

/** Catalogue listing toggle — hidden products stay in stock, off the shelf. */
export function listedFor(productId: string): boolean {
  return getFlow().listed[productId] ?? true;
}

export function setListed(productId: string, on: boolean) {
  const flow = getFlow();
  setFlow({ listed: { ...flow.listed, [productId]: on } });
}

export function setPref(key: keyof ShopPrefs, on: boolean) {
  const flow = getFlow();
  setFlow({ prefs: { ...flow.prefs, [key]: on } });
}

