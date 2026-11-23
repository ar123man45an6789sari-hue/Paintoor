/* ShopsView — marketplace supervision: the five pilot stores at a glance,
   then every product with a price-anomaly flag (more than 35% over its
   category average) and remove/restore controls. Removals are adminState
   demo flags — the storefront keeps its own behaviour until Phase 2.7
   enforces them server-side. */
"use client";

import { useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { PRODUCTS, STORES } from "@/lib/marketplace";
import { getAdmin, onAdminChange, toggleListing } from "@/lib/adminState";

export function ShopsView({ onToast }: { onToast: (msg: string) => void }) {
  const { t } = useI18n();
  const [tick, setTick] = useState(0);

  useEffect(() => onAdminChange(() => setTick((v) => v + 1)), []);

  const admin = getAdmin();
  void tick;

  /* Average price per category so an outlier listing can be flagged. */
  const catAvg = useMemo(() => {
    const sums: Record<string, { total: number; n: number }> = {};
    for (const p of PRODUCTS) {
      sums[p.cat] = sums[p.cat] ?? { total: 0, n: 0 };
      sums[p.cat].total += p.price;
      sums[p.cat].n += 1;
    }
    const avg: Record<string, number> = {};
    for (const [cat, v] of Object.entries(sums)) avg[cat] = v.total / v.n;
    return avg;
  }, []);

  const removedCount = useMemo(
    () => PRODUCTS.filter((p) => admin.removed[String(p.id)]).length,
    [admin],
  );

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("ad.shop.eye")}</p>
      <div className="mt-1">
        <h2 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("ad.shop.h")}</h2>
        <p className="mt-1 text-sm font-bold text-muted">{t("ad.shop.sub", { stores: STORES.length, products: PRODUCTS.length })}</p>
      </div>

      {/* Stores */}
      <div className="mt-4 grid gap-2.5 sm:grid-cols-2">
        {STORES.map((s) => (
          <article key={s.id} className="flex items-center gap-3 rounded-card border border-line bg-white p-3.5 shadow-card">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-saffron/10 text-saffron">
              <Icon name="store" className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <h3 className="truncate text-sm font-extrabold text-navy">{s.n}</h3>
              <p className="truncate text-xs font-semibold text-muted">{s.a}</p>
            </div>
            <span className="shrink-0 text-right">
              <span className="flex items-center justify-end gap-1 text-xs font-black text-navy">
                <Icon name="star" className="h-3 w-3 text-saffron" />
                {s.r}
              </span>
              <span className="block text-[10px] font-bold text-muted">{t("ad.shop.reviews", { n: s.rv })}</span>
            </span>
          </article>
        ))}
      </div>

      {/* Listings */}
      <div className="mt-5 flex items-end justify-between gap-2">
        <h3 className="text-sm font-black text-navy">{t("ad.shop.listings")}</h3>
        {removedCount > 0 && (
          <span className="rounded-pill bg-saffron/15 px-2.5 py-0.5 text-[11px] font-black text-saffron">
            {t("ad.shop.removedN", { n: removedCount })}
          </span>
        )}
      </div>
      <div className="mt-2.5 space-y-2.5">
        {PRODUCTS.map((p) => {
          const removed = Boolean(admin.removed[String(p.id)]);
          const anomaly = p.price > catAvg[p.cat] * 1.35;
          return (
            <article key={p.id} className={`flex flex-wrap items-center gap-3 rounded-card border border-line bg-white p-3.5 shadow-card ${removed ? "opacity-60" : ""}`}>
              <div className="min-w-0 flex-1 basis-[180px]">
                <h4 className="truncate text-sm font-extrabold text-navy">
                  {p.n}
                  {removed && <span className="ml-2 rounded-pill bg-[rgba(199,0,60,0.12)] px-2 py-0.5 text-[10px] font-black text-[#C7003C]">{t("ad.shop.removed")}</span>}
                  {!removed && anomaly && (
                    <span className="ml-2 rounded-pill bg-[rgba(199,119,0,0.12)] px-2 py-0.5 text-[10px] font-black text-[#C77700]">{t("ad.shop.anomaly")}</span>
                  )}
                </h4>
                <p className="truncate text-xs font-semibold text-muted">
                  {p.b} · {p.cat} · {t("ad.shop.avg", { n: Math.round(catAvg[p.cat]).toLocaleString("en-IN") })}
                </p>
              </div>
              <span className="shrink-0 rounded-pill bg-ink/8 px-2.5 py-1 text-xs font-black tabular-nums text-navy">
                ₹{p.price.toLocaleString("en-IN")}
              </span>
              <button
                type="button"
                onClick={() => { toggleListing(String(p.id), p.n); onToast(removed ? t("ad.shop.toastRestore", { name: p.n }) : t("ad.shop.toastRemove", { name: p.n })); }}
                className={`min-h-10 shrink-0 rounded-control px-3 py-2 text-xs font-extrabold ${
                  removed
                    ? "border-2 border-line text-navy hover:border-[#0E9F6E] hover:text-[#0E9F6E]"
                    : "bg-saffron text-snow hover:shadow-lift"
                }`}
              >
                <Icon name={removed ? "undo" : "trash"} className="mr-1 inline h-3.5 w-3.5" />
                {removed ? t("ad.shop.restore") : t("ad.shop.remove")}
              </button>
            </article>
          );
        })}
      </div>
    </div>
  );
}