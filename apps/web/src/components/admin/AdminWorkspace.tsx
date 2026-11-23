/* AdminWorkspace — the platform's control room: grouped sidebar on desktop,
   six-tab bottom nav on mobile, a demo-mode card and one router for the
   eight admin views. Reads the existing demo stores (seeds, requests,
   escrow, shop state) and writes only its own adminState flags — no role
   dashboard is touched until Phase 2.7 wires this to the real database. */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon, type IconName } from "@/components/Icons";
import { getAdmin, onAdminChange } from "@/lib/adminState";
import { ADMIN_MOBILE, ADMIN_NAV, type AdminView } from "./adminNav";
import { AdminTopBar } from "./AdminTopBar";
import { CommandView } from "./CommandView";
import { UsersView } from "./UsersView";
import { ShopsView } from "./ShopsView";
import { AdminOrdersView } from "./AdminOrdersView";
import { MoneyView } from "./MoneyView";
import { ReportsView } from "./ReportsView";
import { ContentView } from "./ContentView";
import { AdminSettingsView } from "./AdminSettingsView";

export function AdminWorkspace({ onLock }: { onLock: () => void }) {
  const { t } = useI18n();
  const [view, setView] = useState<AdminView>("command");
  const [openIncidents, setOpenIncidents] = useState(0);
  const [actionCount, setActionCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const reload = useCallback(() => {
    const a = getAdmin();
    setOpenIncidents(a.incidents.filter((i) => i.status === "open").length);
    setActionCount(a.log.length);
  }, []);

  useEffect(() => {
    reload();
    return onAdminChange(reload);
  }, [reload]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  const badgeFor = (id: AdminView): number => (id === "reports" ? openIncidents : 0);

  return (
    <div className="mx-auto w-full max-w-7xl px-3 pb-28 pt-5 md:px-6 lg:pb-8">
      <AdminTopBar onLock={onLock} />
      <div className="grid items-start gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar — desktop only */}
        <aside className="sticky top-20 hidden lg:block" aria-label={t("ad.nav.aria")}>
          <nav className="rounded-card border border-line bg-white p-3 shadow-card">
            {ADMIN_NAV.map((g) => (
              <div key={g.group}>
                <p className="mt-3 px-3 pb-1 text-[10px] font-black uppercase tracking-[0.16em] text-muted first:mt-0">{t(g.group)}</p>
                {g.items.map((item) => {
                  const badge = badgeFor(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setView(item.id)}
                      aria-current={view === item.id ? "page" : undefined}
                      className={`flex min-h-11 w-full items-center gap-2.5 rounded-control px-3 py-2.5 text-sm font-extrabold transition-colors ${
                        view === item.id ? "bg-saffron text-snow" : "text-muted hover:bg-chuna hover:text-navy"
                      }`}
                    >
                      <Icon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                      <span className="flex-1 text-left">{t(item.label)}</span>
                      {badge > 0 && (
                        <span className={`rounded-pill px-2 py-0.5 text-[10px] font-black ${view === item.id ? "bg-snow/25 text-snow" : "bg-saffron/15 text-saffron"}`}>{badge}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* Demo-mode honesty card */}
          <div className="mt-4 rounded-card border border-line bg-white p-4 shadow-card">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">{t("ad.card.h")}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-black text-navy">
              <Icon name="info" className="h-4 w-4 text-saffron" />
              {t("ad.card.demo")}
            </p>
            <p className="mt-0.5 text-xs font-bold text-muted">{t("ad.card.demoSub")}</p>
            <p className="mt-2 text-[11px] font-extrabold text-saffron">{t("ad.card.actions", { n: actionCount })}</p>
          </div>
        </aside>

        {/* Views */}
        <main className="min-w-0">
          {view === "command" && <CommandView go={setView} />}
          {view === "users" && <UsersView onToast={setToast} />}
          {view === "reports" && <ReportsView onToast={setToast} />}
          {view === "shops" && <ShopsView onToast={setToast} />}
          {view === "orders" && <AdminOrdersView />}
          {view === "money" && <MoneyView onToast={setToast} />}
          {view === "content" && <ContentView onToast={setToast} />}
          {view === "settings" && <AdminSettingsView onToast={setToast} />}
        </main>
      </div>

      {/* Bottom nav — mobile / tablet */}
      <nav
        aria-label={t("ad.nav.aria")}
        className="fixed inset-x-0 bottom-0 z-40 flex gap-1 overflow-x-auto border-t border-line bg-white px-2 py-1.5 lg:hidden"
      >
        {ADMIN_MOBILE.map((item) => {
          const badge = badgeFor(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              aria-current={view === item.id ? "page" : undefined}
              className={`relative flex min-h-14 min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 rounded-control px-2 py-1 text-[10px] font-extrabold transition-colors ${
                view === item.id ? "bg-saffron/10 text-saffron" : "text-muted"
              }`}
            >
              <Icon name={item.icon} className="h-5 w-5" />
              {t(item.label)}
              {badge > 0 && <span className="absolute right-2 top-1.5 rounded-pill bg-saffron px-1.5 text-[9px] font-black text-snow">{badge}</span>}
            </button>
          );
        })}
      </nav>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-toast w-[min(92vw,420px)] -translate-x-1/2 rounded-control bg-navy px-4 py-3 text-center text-sm font-bold text-snow shadow-lift lg:bottom-6">
          {toast}
        </div>
      )}
    </div>
  );
}