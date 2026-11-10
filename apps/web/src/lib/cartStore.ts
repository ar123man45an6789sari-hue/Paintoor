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
  lines = old ? lines.map((l) => (l.key === line.key ? { ...l, qty: l.qty + line.qty } : l)) : [...lines, line];
  emit();
}
export function setQty(key: string, d: number) {
  lines = lines.flatMap((l) => (l.key !== key ? [l] : l.qty + d <= 0 ? [] : [{ ...l, qty: l.qty + d }]));
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