/* Live shop layer — a signed-in shopkeeper reads and writes the cloud database
   through /api/shop (RLS-scoped reads, DEFINER-function writes). Without a
   shopkeeper session the demo store keeps serving the showcase. */
import { getSession } from "./session";

export type LiveProduct = {
  id: string;
  brand: string;
  name: string;
  category: string;
  finish: string;
  sizeL: string;
  pricePaise: number;
  mrpPaise: number;
  stock: number;
  listed: boolean;
  removedByAdmin: boolean;
  imageUrl: string | null;
  hasImage: boolean;
  createdAt: string;
};

export type LiveOrderItem = {
  productId: string;
  qty: number;
  product: { id: string; name: string; brand: string };
};

export type LiveOrder = {
  id: string;
  buyerId: string;
  buyerName: string;
  jobId: string | null;
  zone: string;
  totalPaise: number;
  status: "new" | "accepted" | "delivered";
  windowEndsAt: string | null;
  createdAt: string;
  items: LiveOrderItem[];
};

export type LiveShop = {
  id: string;
  name: string;
  address: string;
  city: string;
  zone: string;
  gstin: string | null;
  blocked: boolean;
  ratingAvg: string;
  reviewCount: number;
  products: LiveProduct[];
  orders: LiveOrder[];
};

export type ShopDetails = {
  name: string;
  address?: string;
  city: string;
  zone?: string;
  gstin?: string;
};

export type ProductDraft = {
  id?: string;
  brand?: string;
  name: string;
  category: string;
  finish?: string;
  sizeL: number;
  pricePaise: number;
  mrpPaise?: number;
  stock: number;
  listed: boolean;
  imageUrl?: string;
};

export type ApiResult<T> = { ok: true; data: T } | { ok: false; error: string };

export function liveShop(): boolean {
  const s = getSession();
  return s !== null && s.role === "shopkeeper";
}

export function inr(paise: number): string {
  return `Rs ${(paise / 100).toLocaleString("en-IN")}`;
}

/* Database guard codes become sentences a shopkeeper can act on. */
const MESSAGES: Record<string, string> = {
  NO_SHOP: "Save your shop details first, then add products.",
  KYC_NOT_APPROVED: "KYC verification is pending. You can save drafts now; publishing starts once an admin approves your shop.",
  SHOP_BLOCKED: "This shop is blocked. Contact Paintoor support.",
  PROFILE_BLOCKED: "This account is blocked. Contact Paintoor support.",
  GSTIN_ALREADY_USED: "That GSTIN is already registered to another shop.",
  NOT_YOUR_PRODUCT: "That product belongs to another shop.",
  REMOVED_BY_ADMIN: "An admin removed this product, so it stays locked until it is restored.",
  BAD_PRODUCT_NAME: "Product name needs at least 2 characters.",
  BAD_PRICE: "Price must be more than zero.",
  MRP_BELOW_PRICE: "MRP cannot be lower than the selling price.",
  BAD_STOCK: "Stock cannot be negative.",
  BAD_SIZE: "Pack size must be more than zero litres or kilograms.",
  STOCK_CANNOT_GO_NEGATIVE: "Not enough stock for that change.",
  ORDER_NOT_FOUND: "That order no longer exists.",
  NOT_YOUR_ORDER: "That order belongs to another shop.",
  ALREADY_DELIVERED: "This order is already delivered.",
  BAD_TRANSITION: "Accept the order before marking it delivered.",
  PRODUCT_UNAVAILABLE: "That product is not available from this shop right now.",
  OUT_OF_STOCK: "Not enough stock left for that quantity.",
  BAD_IMAGE_TYPE: "Use a JPG, PNG or WebP photo.",
  IMAGE_TOO_LARGE: "Photo must be under 3 MB.",
  EMPTY_IMAGE: "That photo file is empty.",
  PRODUCT_IN_ORDERS: "This product is part of past orders, so it cannot be deleted. Unlist it instead and it disappears from the platform.",
  network: "Network problem. Check the connection and try again.",
};

export function explain(code: string): string {
  const key = code.split(":")[0].trim();
  if (MESSAGES[key]) return code.startsWith("OUT_OF_STOCK") ? code.replace("OUT_OF_STOCK:", "Not enough stock:") : MESSAGES[key];
  return key;
}

async function post<T>(url: string, body: unknown): Promise<ApiResult<T>> {
  try {
    const r = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    });
    const j = (await r.json().catch(() => null)) as ({ ok: boolean; error?: string } & T) | null;
    if (!r.ok || !j || !j.ok) return { ok: false, error: j?.error ?? `http_${r.status}` };
    return { ok: true, data: j };
  } catch {
    return { ok: false, error: "network" };
  }
}

export async function fetchShop(): Promise<LiveShop | null> {
  try {
    const r = await fetch("/api/shop", { cache: "no-store" });
    if (!r.ok) return null;
    const j = (await r.json()) as { ok: boolean; shop: LiveShop | null };
    return j.ok ? j.shop : null;
  } catch {
    return null;
  }
}

export function saveShopDetails(input: ShopDetails) {
  return post<{ shopId: string }>("/api/shop", input);
}

export function saveProduct(input: ProductDraft) {
  return post<{ productId: string }>("/api/shop/products", input);
}

export function adjustStock(productId: string, delta: number) {
  return post<{ stock: number }>(`/api/shop/products/${productId}/stock`, { delta });
}

export function setOrderStatus(orderId: string, status: "accepted" | "delivered") {
  return post<{ status: string }>(`/api/shop/orders/${orderId}/status`, { status });
}
export function deleteProduct(productId: string) {
  return post<{ ok: boolean }>(`/api/shop/products/${productId}/delete`, {});
}