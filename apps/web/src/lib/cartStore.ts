/* Global cart store — marketplace cards, the header badge and the cart
   drawer all read/write one list. Persisted to localStorage so a basket
   survives page hops and refreshes; a tiny event bus lets any component
   (side rails, calculator) pop the drawer open. */
import { useSyncExternalStore } from "react";

export type CartLine = { key: string; title: string; meta: string; price: number; storeId: string; qty: number };

const KEY = "pt_cart";
const EMPTY: CartLine[] = [];
let lines: CartLine[] = [];
const subs = new Set<() => void>();

if (typeof window !== "undefined") {
  try {
    const raw = window.localStorage.getItem(KEY);
    lines = raw ? (JSON.parse(raw) as CartLine[]) : [];
  } catch {
    lines = [];
  }

  /* Cross-tab sync: another tab writing the basket is re-read here so the
     last writer never silently wins (matches every other store). */
  window.addEventListener("storage", (e) => {
    if (e.key !== KEY) return;
    try {
      lines = e.newValue ? (JSON.parse(e.newValue) as CartLine[]) : [];
    } catch {
      lines = [];
    }
    subs.forEach((fn) => fn());
  });
}

function emit() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(lines));
  } catch {
    /* private mode */
  }
  subs.forEach((fn) => fn());
}

export function subscribe(cb: () => void) {
  subs.add(cb);
  return () => {
    subs.delete(cb);
  };
}
export function getCart(): CartLine[] {
  return lines;
}
export function useCart(): CartLine[] {
  return useSyncExternalStore(subscribe, getCart, () => EMPTY);
}
export function cartCount(list: CartLine[]): number {
  return list.reduce((a, l) => a + l.qty, 0);
}
export function addLine(line: CartLine) {
  const old = lines.find((l) => l.key === line.key);
  /* Merging refreshes title/meta/price from the newest add: the latest
     quote for a key always wins, so a stale price can never survive. */
  lines = old ? lines.map((l) => (l.key === line.key ? { ...line, qty: Math.min(99, l.qty + line.qty) } : l)) : [...lines, line];
  emit();
}
export function setQty(key: string, d: number) {
  lines = lines.flatMap((l) => (l.key !== key ? [l] : l.qty + d <= 0 ? [] : [{ ...l, qty: Math.min(99, l.qty + d) }]));
  emit();
}
export function removeLine(key: string) {
  lines = lines.filter((l) => l.key !== key);
  emit();
}
export function clearCart() {
  lines = [];
  emit();
}

/* "Open the cart" request bus — the Header owns the drawer instance. */
const OPEN = "pt:cart-open";
export function requestCartOpen() {
  window.dispatchEvent(new Event(OPEN));
}
export function onCartOpen(cb: () => void) {
  const h = () => cb();
  window.addEventListener(OPEN, h);
  return () => window.removeEventListener(OPEN, h);
}