/* ShopShell v1 — the digital counter: sales on top, order count chip, four tabs.
   Blueprint Ch. 12 + 23.2 (SHOP shell: counter-like, clear accounts). */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { getShopProfile, getShopState, onShopStateChange } from "@/lib/shopState";
import { OrdersQueue } from "./OrdersQueue";
import { CatalogGrid } from "./CatalogGrid";
import { SalesPanel } from "./SalesPanel";

type Tab = "counter" | "catalog" | "sales" | "shop";

const TABS: { id: Tab; key: string; emoji: string }[] = [
  { id: "counter", key: "sh.tab.counter", emoji: "🛒" },
  { id: "catalog", key: "sh.tab.catalog", emoji: "📦" },
  { id: "sales", key: "sh.tab.sales", emoji: "💰" },
  { id: "shop", key: "sh.tab.profile", emoji: "🏪" },
];

export function ShopShell({ name }: { name: string }) {
  const { t } = useI18n();
  const profile = useMemo(() => getShopProfile(name), [name]);
  const [tab, setTab] = useState<Tab>("counter");
  const [today, setToday] = useState(0);
  const [week, setWeek] = useState(0);
  const [newOrders, setNewOrders] = useState(0);

  const reload = useCallback(() => {
    const s = getShopState();
    setToday(s.todaySales);
    setWeek(s.weekSales);
    setNewOrders(s.orders.filter((o) => o.status === "new").length);
  }, []);

  useEffect(() => {
    reload();
    return onShopStateChange(reload);
  }, [reload]);

  return (
    <div className="space-y-5">
      <div
        className="rounded-sheet p-6 text-white shadow-card"
        style={{ background: "linear-gradient(150deg,#182028,#10151a)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-black">{profile.name}</h1>
            <p className="mt-0.5 text-xs font-semibold text-white/85">
              {profile.zone}, {profile.city} · ⭐ {profile.rating} · {t("sh.gstin")}: {profile.gstin}
            </p>
          </div>
          <span className="rounded-pill bg-white/20 px-4 py-2 text-sm font-extrabold">
            🛎 {t("sh.ordersNew", { count: newOrders })}
          </span>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-card bg-white/15 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-white/80">{t("sh.salesToday")}</p>
            <p className="mt-1 text-3xl font-black tabular-nums">₹{today.toLocaleString("en-IN")}</p>
          </div>
          <div className="rounded-card bg-white/15 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-white/80">{t("sh.salesWeek")}</p>
            <p className="mt-1 text-3xl font-black tabular-nums">₹{week.toLocaleString("en-IN")}</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 rounded-control bg-chuna p-1" role="tablist" aria-label={t("dash.s")}>
        {TABS.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={tab === x.id}
            onClick={() => setTab(x.id)}
            className={`min-h-12 flex-1 rounded-control px-3 py-2 text-sm font-extrabold transition-colors ${
              tab === x.id ? "border-neem bg-neem text-white" : "border-line bg-white text-muted hover:text-navy"
            }`}
          >
            <span aria-hidden="true">{x.emoji}</span> {t(x.key)}
          </button>
        ))}
      </div>

      {tab === "counter" && <OrdersQueue profile={profile} />}
      {tab === "catalog" && <CatalogGrid />}
      {tab === "sales" && <SalesPanel />}
      {tab === "shop" && (
        <div className="rounded-card border border-line bg-white p-6 shadow-card">
          <h2 className="text-xl font-black text-navy">🏪 {t("sh.shopH")}</h2>
          <p className="mt-2 text-sm font-semibold text-muted">
            {profile.zone}, {profile.city} · ⭐ {profile.rating}
          </p>
          <p className="mt-1 text-sm font-semibold text-muted">
            {t("sh.gstin")}: {profile.gstin}
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.categories.map((c) => (
              <span key={c} className="rounded-pill border border-line bg-chuna px-3 py-1 text-xs font-bold text-navy">
                {t(`shcat.${c}`)}
              </span>
            ))}
            <span className="rounded-pill border border-line bg-neem/10 px-3 py-1 text-xs font-bold text-neem">
              ✅ {t("sh.kycOk")}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}