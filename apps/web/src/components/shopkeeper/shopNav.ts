/* Shopkeeper workspace navigation config — one place so the sidebar, the
   mobile bottom nav and the view router never drift apart. */
import type { IconName } from "@/components/Icons";

export type ShopView =
  | "overview"
  | "orders"
  | "chat"
  | "catalog"
  | "stock"
  | "sales"
  | "profile"
  | "settings";

export const SHOP_NAV: { group: string; items: { id: ShopView; icon: IconName; label: string }[] }[] = [
  { group: "sw.nav.ws", items: [
    { id: "overview", icon: "home", label: "sw.v.overview" },
    { id: "orders", icon: "cart", label: "sw.v.orders" },
    { id: "chat", icon: "chat", label: "sw.v.chat" },
  ] },
  { group: "sw.nav.ops", items: [
    { id: "catalog", icon: "box", label: "sw.v.catalog" },
    { id: "stock", icon: "package", label: "sw.v.stock" },
  ] },
  { group: "sw.nav.biz", items: [
    { id: "sales", icon: "chart", label: "sw.v.sales" },
    { id: "profile", icon: "store", label: "sw.v.profile" },
    { id: "settings", icon: "gear", label: "sw.v.settings" },
  ] },
];

/* Six thumb targets on phones; settings lives behind the profile view and
   the overview's own links (same destination, fewer icons). */
export const SHOP_MOBILE: { id: ShopView; icon: IconName; label: string }[] = [
  { id: "overview", icon: "home", label: "sw.m.home" },
  { id: "orders", icon: "cart", label: "sw.m.orders" },
  { id: "catalog", icon: "box", label: "sw.m.products" },
  { id: "chat", icon: "chat", label: "sw.m.chat" },
  { id: "sales", icon: "chart", label: "sw.m.sales" },
  { id: "profile", icon: "store", label: "sw.m.store" },
];