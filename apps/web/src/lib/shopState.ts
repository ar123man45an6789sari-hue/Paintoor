/* Demo-phase shopkeeper store (localStorage): catalog, orders, sales.
   Production: GET /v1/shops/me + POST /v1/orders/:id/accept + delivery webhooks.
   Order SLA: shops get 2 hours to accept (Blueprint Ch. 09.7). */
import { seed } from "@paintoor/mock-api";

export type ShopProduct = {
  id: string;
  name: string;
  brand: string;
  category: string;
  unit: string;
  price: number;
  stock: number;
  lowStockAt: number;
};

export type ShopOrderItem = { productId: string; qty: number };

export type ShopOrder = {
  id: string;
  providerName: string;
  jobRef: string;
  zone: string;
  items: ShopOrderItem[];
  total: number;
  status: "new" | "accepted" | "delivered";
  at: number;
  windowEndsAt: number;
};

export type ShopProfile = {
  id: string;
  name: string;
  city: string;
  zone: string;
  categories: string[];
  rating: number;
  gstin: string;
};

export type ShopState = {
  todaySales: number;
  weekSales: number;
  products: ShopProduct[];
  orders: ShopOrder[];
  settlements: { id: string; label: string; amount: number; at: number }[];
  history: { date: string; amount: number }[];
};

const KEY = "gs_shop_state";
const CHANGE = "gs:shop-state-changed";
const SLA_MIN = 120;

function defaultCatalog(): ShopProduct[] {
  return [
    { id: "p01", name: "Apex Exterior Paint 10L", brand: "Asian Paints", category: "paints", unit: "bucket", price: 3450, stock: 12, lowStockAt: 4 },
    { id: "p02", name: "Royale Matt 5L", brand: "Asian Paints", category: "paints", unit: "bucket", price: 4120, stock: 8, lowStockAt: 3 },
    { id: "p03", name: "WeatherCoat 10L", brand: "Berger", category: "paints", unit: "bucket", price: 3280, stock: 6, lowStockAt: 3 },
    { id: "p04", name: "Beauty Gold 5L", brand: "Nerolac", category: "paints", unit: "bucket", price: 2890, stock: 10, lowStockAt: 4 },
    { id: "p05", name: "Exterior Primer 10L", brand: "Asian Paints", category: "paints", unit: "bucket", price: 1980, stock: 14, lowStockAt: 5 },
    { id: "p06", name: "Wall Putty 20kg", brand: "Birla White", category: "paints", unit: "bag", price: 1240, stock: 9, lowStockAt: 4 },
    { id: "p07", name: "Thinner 5L", brand: "Asian Paints", category: "paints", unit: "can", price: 780, stock: 4, lowStockAt: 4 },
    { id: "p08", name: "PVC Wire 1.5sq · 90m", brand: "Finolex", category: "hardware", unit: "coil", price: 2350, stock: 7, lowStockAt: 3 },
    { id: "p09", name: "MCB 32A", brand: "Havells", category: "hardware", unit: "pc", price: 485, stock: 15, lowStockAt: 5 },
    { id: "p10", name: "Switch Board 12-way", brand: "Anchor", category: "hardware", unit: "pc", price: 640, stock: 5, lowStockAt: 3 },
    { id: "p11", name: "CPVC Pipe 1in · 3m", brand: "Astral", category: "sanitary", unit: "pc", price: 410, stock: 20, lowStockAt: 6 },
    { id: "p12", name: "Brass Tap", brand: "Parryware", category: "sanitary", unit: "pc", price: 615, stock: 3, lowStockAt: 4 },
    { id: "p13", name: "Teflon Tape", brand: "Generic", category: "sanitary", unit: "roll", price: 35, stock: 40, lowStockAt: 10 },
  ];
}

function defaultHistory(): { date: string; amount: number }[] {
  const out: { date: string; amount: number }[] = [];
  const base = [4200, 0, 6800, 3100, 0, 9400, 5200, 0, 7600, 4800, 0, 11200, 6300, 8400];
  for (let i = 13; i >= 0; i -= 1) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    out.push({ date: d.toISOString().slice(0, 10), amount: base[13 - i] ?? 0 });
  }
  return out;
}

function defaultState(): ShopState {
  return {
    todaySales: 8400,
    weekSales: 46300,
    products: defaultCatalog(),
    orders: [],
    settlements: [
      { id: "st1", label: "Sunil Verma", amount: 4690, at: Date.now() - 86_400_000 },
      { id: "st2", label: "Dinesh Patel", amount: 1230, at: Date.now() - 172_800_000 },
    ],
    history: defaultHistory(),
  };
}

function emit() {
  window.dispatchEvent(new CustomEvent(CHANGE));
}

export function getShopState(): ShopState {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? { ...defaultState(), ...(JSON.parse(raw) as Partial<ShopState>) } : defaultState();
  } catch {
    return defaultState();
  }
}

export function setShopState(patch: Partial<ShopState>) {
  try {
    localStorage.setItem(KEY, JSON.stringify({ ...getShopState(), ...patch }));
    emit();
  } catch {
    /* private mode */
  }
}

export function onShopStateChange(cb: () => void) {
  const handler = () => cb();
  window.addEventListener(CHANGE, handler);
  /* Live cross-tab: browser fires `storage` in every OTHER tab on LS change. */
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(CHANGE, handler);
    window.removeEventListener("storage", handler);
  };
}

/** Signed-up store name → seeded shop profile (same trick as providers). */
export function getShopProfile(name: string): ShopProfile {
  const n = name.toLowerCase();
  const match =
    seed.shops.find((s) => {
      const parts = s.name.toLowerCase().split(/\s+/);
      return parts.some((part) => part.length > 3 && n.includes(part));
    }) ?? seed.shops[0];
  return {
    id: match.id,
    name: name.trim() || match.name,
    city: match.city,
    zone: match.zone,
    categories: match.categories,
    rating: match.rating_avg,
    gstin: "24AAACG1234F1Z5",
  };
}

export function acceptOrder(id: string) {
  const state = getShopState();
  setShopState({ orders: state.orders.map((o) => (o.id === id ? { ...o, status: "accepted" as const } : o)) });
}

/** Delivery decrements stock and lands the amount in today's sales. */
export function deliverOrder(id: string) {
  const state = getShopState();
  const order = state.orders.find((o) => o.id === id);
  if (!order || order.status !== "accepted") return;
  const products = state.products.map((p) => {
    const item = order.items.find((it) => it.productId === p.id);
    return item ? { ...p, stock: Math.max(0, p.stock - item.qty) } : p;
  });
  setShopState({
    products,
    orders: state.orders.map((o) => (o.id === id ? { ...o, status: "delivered" as const } : o)),
    todaySales: state.todaySales + order.total,
    weekSales: state.weekSales + order.total,
    settlements: [
      { id: order.id, label: order.providerName, amount: order.total, at: Date.now() },
      ...state.settlements,
    ].slice(0, 12),
  });
}

export function changeStock(productId: string, delta: number) {
  const state = getShopState();
  setShopState({
    products: state.products.map((p) =>
      p.id === productId ? { ...p, stock: Math.max(0, p.stock + delta) } : p,
    ),
  });
}

/** Demo helper — a worker's material order lands on the counter. */
export function addDemoOrder(profile: ShopProfile): ShopOrder {
  const state = getShopState();
  const available = state.products.filter((p) => p.stock > 2);
  const items: ShopOrderItem[] = available.slice(0, 3).map((p, i) => ({ productId: p.id, qty: (i % 2) + 1 }));
  const priceOf = (pid: string) => state.products.find((p) => p.id === pid)?.price ?? 0;
  const order: ShopOrder = {
    id: `ord_${Date.now()}`,
    providerName: seed.providers[Math.floor(Math.random() * seed.providers.length)].name,
    jobRef: `JOB-${String(Date.now()).slice(-6)}`,
    zone: profile.zone,
    items,
    total: items.reduce((sum, it) => sum + priceOf(it.productId) * it.qty, 0),
    status: "new",
    at: Date.now(),
    windowEndsAt: Date.now() + SLA_MIN * 60_000,
  };
  setShopState({ orders: [order, ...state.orders] });
  return order;
}