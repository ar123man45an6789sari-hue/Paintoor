/* OverviewView — the store's front counter: open/paused switch, live sales
   stats, the 2-hour SLA queue, low-stock alerts, a trade-update feed and
   the marketplace visibility pills. Every number reads shopState/shopflow. */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon, type IconName } from "@/components/Icons";
import { getShopState, onShopStateChange } from "@/lib/shopState";
import type { ShopOrder, ShopProduct, ShopProfile } from "@/lib/shopState";
import { declineFor, getFlow, onFlowChange, setStoreOpen } from "@/lib/shopflow";
import type { ShopView } from "./shopNav";

const GRAD = "linear-gradient(135deg,#E00048,#A80036)";

function StatCard({ icon, value, label, detail }: { icon: IconName; value: string; label: string; detail?: string }) {
  return (
    <article className="rounded-card border border-line bg-white p-4 shadow-card">
      <span className="flex h-9 w-9 items-center justify-center rounded-control bg-saffron/10 text-saffron">
        <Icon name={icon} className="h-[18px] w-[18px]" />
      </span>
      <p className="mt-2.5 text-2xl font-black tabular-nums text-navy">{value}</p>
      <p className="text-xs font-bold text-muted">{label}</p>
      {detail && <p className="mt-1 text-[11px] font-extrabold text-saffron">{detail}</p>}
    </article>
  );
}

export function OverviewView({
  profile,
  go,
}: {
  profile: ShopProfile;
  go: (v: ShopView) => void;
}) {
  const { t } = useI18n();
  const [today, setToday] = useState(0);
  const [week, setWeek] = useState(0);
  const [orders, setOrders] = useState<ShopOrder[]>([]);
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [open, setOpen] = useState(true);
  const [feed, setFeed] = useState<{ id: string; at: number; icon: IconName; text: string }[]>([]);

  const reload = useCallback(() => {
    const s = getShopState();
    const flow = getFlow();
    setToday(s.todaySales);
    setWeek(s.weekSales);
    setOpen(flow.open);
    setOrders(s.orders);
    setProducts(s.products);
    const events = [
      ...s.settlements.slice(0, 4).map((x) => ({
        id: `st-${x.id}`,
        at: x.at,
        icon: "wallet" as IconName,
        text: t("sw.feed.settle", { name: x.label, n: x.amount.toLocaleString("en-IN") }),
      })),
      ...s.orders
        .filter((o) => o.status !== "new")
        .slice(0, 4)
        .map((o) => ({
          id: `or-${o.id}`,
          at: o.at,
          icon: (o.status === "delivered" ? "truck" : "checkCircle") as IconName,
          text:
            o.status === "delivered"
              ? t("sw.feed.delivered", { name: o.providerName })
              : t("sw.feed.accepted", { name: o.providerName }),
        })),
    ];
    setFeed(events.sort((a, b) => b.at - a.at).slice(0, 5));
  }, [t]);

  useEffect(() => {
    reload();
    const offS = onShopStateChange(reload);
    const offF = onFlowChange(reload);
    return () => { offS(); offF(); };
  }, [reload]);

  const newOrders = useMemo(() => orders.filter((o) => o.status === "new" && !declineFor(o.id)), [orders]);
  const lowList = useMemo(() => products.filter((p) => p.stock <= p.lowStockAt), [products]);
  const slaMins = useMemo(() => {
    if (newOrders.length === 0) return 0;
    return Math.max(0, Math.ceil((Math.min(...newOrders.map((o) => o.windowEndsAt)) - Date.now()) / 60000));
  }, [newOrders]);

  const completeness = 60 + (profile.gstin ? 26 : 0) + (profile.categories.length >= 2 ? 14 : 0);

  const ghostBtn =
    "min-h-10 rounded-control border-2 border-line px-3 py-2 text-xs font-extrabold text-navy hover:border-saffron hover:text-saffron";

  return (
    <div className="space-y-5">
      {/* Counter hero */}
      <section className="relative overflow-hidden rounded-sheet shadow-card" style={{ background: GRAD }}>
        <div className="relative flex flex-wrap items-center gap-5 p-6 text-snow md:p-8">
          <span className="flex h-[72px] w-[72px] shrink-0 items-center justify-center rounded-pill border-4 border-snow/60 bg-snow/15">
            <Icon name="store" className="h-8 w-8" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-snow/75">{t("sw.hero.eyebrow")}</p>
            <h1 className="mt-0.5 text-2xl font-black tracking-[-0.02em] md:text-3xl">{profile.name}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              <span className="flex items-center gap-1.5 rounded-pill bg-snow/15 px-3 py-1 text-[11px] font-extrabold">
                <Icon name="mapPin" className="h-3.5 w-3.5" />
                {profile.zone}, {profile.city}
              </span>
              <span className="flex items-center gap-1.5 rounded-pill bg-snow/15 px-3 py-1 text-[11px] font-extrabold">
                <Icon name="star" className="h-3.5 w-3.5" />
                {profile.rating}
              </span>
              <span className="flex items-center gap-1.5 rounded-pill bg-snow/15 px-3 py-1 text-[11px] font-extrabold">
                <Icon name="checkCircle" className="h-3.5 w-3.5" />
                {t("sw.visible")}
              </span>
            </div>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
            <button
              type="button"
              role="switch"
              aria-checked={open}
              aria-label={t("sw.set.openAria")}
              onClick={() => setStoreOpen(!open)}
              className="flex items-center gap-2.5 rounded-control bg-snow/15 px-3.5 py-2.5 text-xs font-extrabold transition-colors hover:bg-snow/25"
            >
              <span className={`relative h-6 w-11 shrink-0 rounded-pill ${open ? "bg-[#0E9F6E]" : "bg-snow/30"}`}>
                <span className={`absolute top-0.5 h-5 w-5 rounded-pill bg-white shadow-card transition-all ${open ? "left-[22px]" : "left-0.5"}`} />
              </span>
              {open ? t("sw.open") : t("sw.paused")}
            </button>
            <p className="text-[11px] font-bold text-snow/75">{t("sw.hero.switchHint")}</p>
          </div>
        </div>
      </section>

      {!open && (
        <p className="flex items-center gap-2.5 rounded-control border-2 border-line bg-white px-4 py-3 text-xs font-extrabold text-navy shadow-card">
          <Icon name="alert" className="h-4 w-4 shrink-0 text-saffron" />
          {t("sw.pausedNote")}
          <button type="button" onClick={() => go("settings")} className="ml-auto shrink-0 text-saffron underline underline-offset-2">
            {t("sw.v.settings")}
          </button>
        </p>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon="rupee" value={`₹${today.toLocaleString("en-IN")}`} label={t("sh.salesToday")} />
        <StatCard icon="chart" value={`₹${week.toLocaleString("en-IN")}`} label={t("sh.salesWeek")} />
        <StatCard
          icon="cart"
          value={String(newOrders.length)}
          label={t("sw.stat.orders")}
          detail={newOrders.length > 0 ? t("sw.stat.sla", { mins: slaMins }) : undefined}
        />
        <StatCard
          icon="package"
          value={String(lowList.length)}
          label={t("sw.stat.low")}
          detail={lowList.length > 0 ? t("sw.stat.lowN", { n: lowList.length }) : undefined}
        />
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        {/* Needs your counter */}
        <section className="rounded-card border border-line bg-white p-5 shadow-card">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("sw.att.eye")}</p>
              <h2 className="mt-0.5 text-xl font-black text-navy">{t("sw.att.h")}</h2>
            </div>
            {newOrders.length + lowList.length > 0 && (
              <span className="rounded-pill bg-saffron/15 px-2.5 py-0.5 text-[11px] font-black text-saffron">
                {newOrders.length + lowList.length}
              </span>
            )}
          </div>
          {newOrders.length === 0 && lowList.length === 0 ? (
            <div className="mt-4 flex items-center gap-3 rounded-control bg-chuna p-4">
              <Icon name="checkCircle" className="h-5 w-5 shrink-0 text-[#0E9F6E]" />
              <span className="min-w-0">
                <b className="block text-sm font-extrabold text-navy">{t("sw.att.clear")}</b>
                <span className="block text-xs font-semibold text-muted">{t("sw.att.clearSub")}</span>
              </span>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {newOrders.slice(0, 3).map((o) => {
                const mins = Math.max(0, Math.ceil((o.windowEndsAt - Date.now()) / 60000));
                return (
                  <li key={o.id} className="flex items-center gap-3 py-3 first:pt-0">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-saffron/10 text-saffron">
                      <Icon name="cart" className="h-5 w-5" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <b className="block truncate text-sm font-extrabold text-navy">{t("sw.att.order", { name: o.providerName })}</b>
                      <span className="block truncate text-xs font-semibold text-muted">{t("sw.att.orderSub", { mins })}</span>
                    </span>
                    <button type="button" onClick={() => go("orders")} className="min-h-10 shrink-0 rounded-control bg-saffron px-3.5 py-2 text-xs font-extrabold text-snow hover:shadow-lift">
                      {t("sw.att.accept")}
                    </button>
                  </li>
                );
              })}
              {lowList.slice(0, 3).map((p) => (
                <li key={p.id} className="flex items-center gap-3 py-3 last:pb-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-saffron/10 text-saffron">
                    <Icon name="package" className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-sm font-extrabold text-navy">{t("sw.att.low", { name: p.name })}</b>
                    <span className="block truncate text-xs font-semibold text-muted">{t("sw.att.lowSub", { stock: p.stock, min: p.lowStockAt })}</span>
                  </span>
                  <button type="button" onClick={() => go("stock")} className="min-h-10 shrink-0 rounded-control bg-saffron px-3.5 py-2 text-xs font-extrabold text-snow hover:shadow-lift">
                    {t("sw.att.restock")}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Trade updates */}
        <section className="rounded-card border border-line bg-white p-5 shadow-card">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("sw.feed.eye")}</p>
              <h2 className="mt-0.5 text-xl font-black text-navy">{t("sw.feed.h")}</h2>
            </div>
            <button type="button" onClick={() => go("sales")} className={ghostBtn}>
              {t("sh.salesH")} <Icon name="arrowRight" className="ml-1 inline h-3.5 w-3.5" />
            </button>
          </div>
          <ol className="mt-4 space-y-3.5">
            {feed.map((f) => (
              <li key={f.id} className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-saffron/10 text-saffron">
                  <Icon name={f.icon} className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold leading-snug text-navy">{f.text}</span>
                  <span className="mt-0.5 block text-[11px] font-extrabold text-muted">
                    {new Date(f.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  </span>
                </span>
              </li>
            ))}
          </ol>
          <p className="mt-4 flex items-center gap-2 rounded-control bg-chuna px-3 py-2 text-[11px] font-bold text-muted">
            <Icon name="shield" className="h-3.5 w-3.5 shrink-0 text-saffron" />
            {t("sw.feed.completeness", { n: completeness })}
          </p>
        </section>
      </div>
    </div>
  );
}