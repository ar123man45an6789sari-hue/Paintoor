/* ShopWorkspace — the shopkeeper's premium shell: grouped sidebar on
   desktop, six-tab bottom nav on mobile, a marketplace-status card and one
   router for the eight store views. Replaces ShopShell; orders, catalogue,
   sales and the store profile keep reading lib/shopState, while flow extras
   (ready-time, packed, declines, chat, prefs) live in lib/shopflow. */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon, type IconName } from "@/components/Icons";
import { getShopProfile, getShopState, onShopStateChange } from "@/lib/shopState";
import { getFlow, onFlowChange } from "@/lib/shopflow";
import { SHOP_MOBILE, SHOP_NAV, type ShopView } from "./shopNav";
import { OverviewView } from "./OverviewView";
import { OrdersView } from "./OrdersView";
import { ChatView } from "./ChatView";
import { CatalogView } from "./CatalogView";
import { StockView } from "./StockView";
import { SalesView } from "./SalesView";
import { ProfileView } from "./ProfileView";
import { SettingsView } from "./SettingsView";
import { LiveCatalog } from "./LiveCatalog";
import { LiveShopOrders } from "./LiveShopOrders";
import { liveShop } from "@/lib/liveShop";

export function ShopWorkspace({ name, signup }: { name: string; signup?: Record<string, string> }) {
  const { t } = useI18n();
  const profile = useMemo(() => getShopProfile(name, signup), [name, signup]);
  const [view, setView] = useState<ShopView>("overview");
  const [chatId, setChatId] = useState<string | null>(null);
  const [orderCount, setOrderCount] = useState(0);
  const [threadCount, setThreadCount] = useState(0);
  const [completeness, setCompleteness] = useState(60);
  const [toast, setToast] = useState<string | null>(null);

  const reload = useCallback(() => {
    const s = getShopState();
    const flow = getFlow();
    setOrderCount(s.orders.filter((o) => o.status === "new" && !flow.declines[o.id]).length);
    setThreadCount(Object.keys(flow.threads).length);
    setCompleteness(60 + (profile.gstin ? 26 : 0) + (profile.categories.length >= 2 ? 14 : 0));
  }, [profile]);

  useEffect(() => {
    reload();
    const offS = onShopStateChange(reload);
    const offF = onFlowChange(reload);
    return () => { offS(); offF(); };
  }, [reload]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  const onMessage = useCallback((orderId: string) => {
    setChatId(orderId);
    setView("chat");
  }, []);

  const badgeFor = (id: ShopView): number =>
    id === "orders" ? orderCount : id === "chat" ? threadCount : 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-3 pb-28 pt-5 md:px-6 lg:pb-8">
      <div className="grid items-start gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar — desktop only */}
        <aside className="sticky top-20 hidden lg:block" aria-label={t("sw.nav.aria")}>
          <nav className="rounded-card border border-line bg-white p-3 shadow-card">
            {SHOP_NAV.map((g) => (
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

          {/* Marketplace status */}
          <div className="mt-4 rounded-card border border-line bg-white p-4 shadow-card">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">{t("sw.mk.h")}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm font-black text-navy">
              <Icon name="eye" className="h-4 w-4 text-saffron" />
              {t("sw.mk.visible")}
            </p>
            <p className="mt-0.5 text-xs font-bold text-muted">{t("sw.mk.completeness", { n: completeness })}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-pill bg-chuna">
              <div className="h-full rounded-pill bg-saffron transition-all duration-500" style={{ width: `${completeness}%` }} />
            </div>
            <button
              type="button"
              onClick={() => setView("profile")}
              className="mt-2.5 text-[11px] font-extrabold text-saffron underline underline-offset-2"
            >
              {t("sw.mk.cta")}
            </button>
          </div>
        </aside>

        {/* Views */}
        <main className="min-w-0">
          {view === "overview" && <OverviewView profile={profile} go={setView} />}
          {view === "orders" && (liveShop() ? <LiveShopOrders /> : <OrdersView profile={profile} onMessage={onMessage} onToast={setToast} />)}
          {view === "chat" && <ChatView focusOrderId={chatId ?? undefined} />}
         {view === "catalog" && (liveShop() ? <LiveCatalog /> : <CatalogView go={setView} />)}
         {view === "stock" && (liveShop() ? <LiveCatalog section="stock" /> : <StockView />)}
          {view === "sales" && <SalesView />}
          {view === "profile" && (
            <div className="space-y-5">
              {/* Settings stays one tap away on phones, where the bottom nav
                  keeps only the six hottest views. */}
              <div className="grid grid-cols-2 gap-2 lg:hidden">
                {([
                  { id: "stock", icon: "package", label: "sw.v.stock" },
                  { id: "settings", icon: "gear", label: "sw.v.settings" },
                ] as { id: ShopView; icon: IconName; label: string }[]).map((x) => (
                  <button
                    key={x.id}
                    type="button"
                    onClick={() => setView(x.id)}
                    className="flex min-h-16 flex-col items-center justify-center gap-1 rounded-control border border-line bg-white text-[10px] font-extrabold text-muted shadow-card transition-colors hover:text-saffron"
                  >
                    <Icon name={x.icon} className="h-5 w-5" />
                    {t(x.label)}
                  </button>
                ))}
              </div>
              <ProfileView profile={profile} go={setView} />
            </div>
          )}
          {view === "settings" && <SettingsView onToast={setToast} />}
        </main>
      </div>

      {/* Bottom nav — mobile / tablet */}
      <nav
        aria-label={t("sw.nav.aria")}
        className="fixed inset-x-0 bottom-0 z-40 flex gap-1 overflow-x-auto border-t border-line bg-white px-2 py-1.5 lg:hidden"
      >
        {SHOP_MOBILE.map((item) => {
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