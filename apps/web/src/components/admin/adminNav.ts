/* Admin workspace navigation config — one place so the sidebar, the mobile
   bottom nav and the view router never drift apart. */
import type { IconName } from "@/components/Icons";

export type AdminView =
  | "command"
  | "users"
  | "reports"
  | "shops"
  | "orders"
  | "money"
  | "content"
  | "settings";

export const ADMIN_NAV: { group: string; items: { id: AdminView; icon: IconName; label: string }[] }[] = [
  { group: "ad.nav.command", items: [
    { id: "command", icon: "monitor", label: "ad.v.command" },
    { id: "users", icon: "users", label: "ad.v.users" },
    { id: "reports", icon: "shield", label: "ad.v.reports" },
  ] },
  { group: "ad.nav.platform", items: [
    { id: "shops", icon: "store", label: "ad.v.shops" },
    { id: "orders", icon: "briefcase", label: "ad.v.orders" },
  ] },
  { group: "ad.nav.business", items: [
    { id: "money", icon: "wallet", label: "ad.v.money" },
    { id: "content", icon: "palette", label: "ad.v.content" },
  ] },
  { group: "ad.nav.system", items: [
    { id: "settings", icon: "gear", label: "ad.v.settings" },
  ] },
];

/* Six thumb targets on phones; content and settings sit behind the command
   centre's own tiles (same destinations, fewer icons). */
export const ADMIN_MOBILE: { id: AdminView; icon: IconName; label: string }[] = [
  { id: "command", icon: "monitor", label: "ad.m.command" },
  { id: "users", icon: "users", label: "ad.m.users" },
  { id: "shops", icon: "store", label: "ad.m.shops" },
  { id: "orders", icon: "briefcase", label: "ad.m.orders" },
  { id: "money", icon: "wallet", label: "ad.m.money" },
  { id: "reports", icon: "shield", label: "ad.m.reports" },
];