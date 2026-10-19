/* Demo-phase notification store (localStorage + window events) — same shape the
   production socket feed will emit, so only the transport changes later. */
import type { Role } from "@/components/auth/types";

export type NotificationKind =
  | "lead_accepted"
  | "lead_declined"
  | "new_lead"
  | "request_cancelled"
  | "system";

export type AppNotification = {
  id: string;
  kind: NotificationKind;
  /** Which role this notification is addressed to. */
  audience: Role;
  titleKey: string;
  bodyKey: string;
  params?: Record<string, string | number>;
  requestId?: string;
  at: number;
  read: boolean;
};

const KEY = "gs_notifications";
const CHANGE = "gs:notifications-changed";
const MAX_ITEMS = 50;

function emit() {
  window.dispatchEvent(new CustomEvent(CHANGE));
}

export function getNotifications(audience?: Role): AppNotification[] {
  try {
    const raw = localStorage.getItem(KEY);
    const all: AppNotification[] = raw ? (JSON.parse(raw) as AppNotification[]) : [];
    const list = audience ? all.filter((n) => n.audience === audience) : all;
    return list.slice().sort((a, b) => b.at - a.at);
  } catch {
    return [];
  }
}

export function unreadCount(audience: Role): number {
  return getNotifications(audience).filter((n) => !n.read).length;
}

function persist(next: AppNotification[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(next.slice(0, MAX_ITEMS)));
    emit();
  } catch {
    /* private mode */
  }
}

export function pushNotification(input: Omit<AppNotification, "id" | "at" | "read">) {
  const item: AppNotification = { ...input, id: `ntf_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, at: Date.now(), read: false };
  persist([item, ...getNotifications()]);
  return item;
}

export function markAllRead(audience: Role) {
  persist(getNotifications().map((n) => (n.audience === audience ? { ...n, read: true } : n)));
}

export function clearNotifications(audience: Role) {
  persist(getNotifications().filter((n) => n.audience !== audience));
}

export function onNotificationsChange(cb: () => void) {
  window.addEventListener(CHANGE, cb);
  return () => window.removeEventListener(CHANGE, cb);
}