/* NotificationBell v1 — header bell with unread badge and a dropdown panel.
   Reads the demo notification store; production swaps in a socket feed. */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { getProviderProfile } from "@/lib/providers";
import { getSession, onSessionChange } from "@/lib/session";
import type { Session } from "@/lib/session";
import {
  clearNotifications,
  getNotifications,
  markAllRead,
  onNotificationsChange,
  unreadCount,
} from "@/lib/notifications";
import type { AppNotification } from "@/lib/notifications";

export function NotificationBell() {
  const { lang, t } = useI18n();
  const [session, setSession] = useState<Session | null>(null);
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);

    const reload = useCallback(() => {
    const current = getSession();
    setSession(current);
    if (!current) return;
    const pid = current.role === "provider" ? getProviderProfile(current.name).id : null;
    setItems(getNotifications(current.role, pid));
    setUnread(unreadCount(current.role, pid));
  }, []);

  useEffect(() => {
    reload();
    const offSession = onSessionChange(reload);
    const offNotif = onNotificationsChange(reload);
    return () => {
      offSession();
      offNotif();
    };
  }, [reload]);

  if (!session) return null;
   const pid = session.role === "provider" ? getProviderProfile(session.name).id : null;
  const locale = lang === "hi" ? "hi-IN" : lang === "gu" ? "gu-IN" : "en-IN";

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={t("notif.title")}
        onClick={() => setOpen((v) => !v)}
        className="relative flex h-9 w-9 items-center justify-center rounded-pill border border-line bg-chuna text-base transition-colors hover:border-saffron"
      >
        🔔
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-pill bg-danger px-1 text-xs font-black text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <>
          <button
            type="button"
            aria-label={t("notif.close")}
            onClick={() => setOpen(false)}
            className="fixed inset-0 z-40 cursor-default"
          />
          <div className="absolute right-0 top-11 z-50 w-[min(88vw,340px)] rounded-card border border-line bg-white p-2 shadow-card">
            <p className="px-2 py-1 text-xs font-black uppercase tracking-wider text-muted">{t("notif.title")}</p>
            {items.length === 0 ? (
              <p className="px-2 py-6 text-center text-sm text-muted">{t("notif.empty")}</p>
            ) : (
              <ul className="max-h-72 space-y-1 overflow-y-auto">
                {items.map((n) => (
                  <li key={n.id} className={`rounded-control px-2 py-2 ${n.read ? "" : "bg-haldi/15"}`}>
                    <p className="text-sm font-extrabold text-navy">{t(n.titleKey, n.params)}</p>
                    <p className="mt-0.5 text-xs text-muted">{t(n.bodyKey, n.params)}</p>
                    <p className="mt-0.5 text-xs font-bold text-muted">
                      {new Date(n.at).toLocaleString(locale, {
                        day: "numeric",
                        month: "short",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-1 flex gap-2 border-t border-line pt-2">
              <button
                type="button"
                onClick={() => markAllRead(session.role, pid)}
                className="min-h-11 flex-1 rounded-control border border-line px-2 py-1.5 text-xs font-extrabold text-muted hover:border-navy hover:text-navy"
              >
                {t("notif.markRead")}
              </button>
              <button
                type="button"
                onClick={() => clearNotifications(session.role)}
                className="min-h-11 rounded-control border border-line px-2 py-1.5 text-xs font-extrabold text-muted hover:border-danger hover:text-danger"
              >
                {t("notif.clear")}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}