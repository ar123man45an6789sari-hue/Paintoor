/* SalesView — money in, money settled: today/week counters, the 14-day
   bar trend and the verified bank settlement ledger with the next-payout
   note. All numbers come from shopState (delivery is the only writer). */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { getShopState, onShopStateChange } from "@/lib/shopState";
import type { ShopState } from "@/lib/shopState";

export function SalesView() {
  const { t } = useI18n();
  const [state, setState] = useState<ShopState | null>(null);

  const reload = useCallback(() => setState(getShopState()), []);
  useEffect(() => {
    reload();
    return onShopStateChange(reload);
  }, [reload]);

  if (!state) return null;
  const max = Math.max(...state.history.map((h) => h.amount), 1);
  const settled = state.settlements.reduce((a, s) => a + s.amount, 0);

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("sw.sales.eye")}</p>
      <div className="mt-1">
        <h2 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("sw.sales.h")}</h2>
        <p className="mt-1 text-sm font-bold text-muted">{t("sw.sales.sub")}</p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-card border border-line bg-white p-4 shadow-card">
          <p className="text-xs font-bold text-muted">{t("sh.salesToday")}</p>
          <p className="mt-1 text-xl font-black tabular-nums text-navy">₹{state.todaySales.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-card border border-line bg-white p-4 shadow-card">
          <p className="text-xs font-bold text-muted">{t("sh.salesWeek")}</p>
          <p className="mt-1 text-xl font-black tabular-nums text-navy">₹{state.weekSales.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-card border border-line bg-white p-4 shadow-card">
          <p className="text-xs font-bold text-muted">{t("sw.sales.settled")}</p>
          <p className="mt-1 text-xl font-black tabular-nums text-navy">₹{settled.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-card border border-line bg-white p-4 shadow-card">
          <p className="text-xs font-bold text-muted">{t("sw.sales.pending")}</p>
          <p className="mt-1 text-xl font-black tabular-nums text-saffron">
            ₹{Math.max(0, state.weekSales - settled).toLocaleString("en-IN")}
          </p>
        </div>
      </div>

      <section className="mt-4 rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex items-end justify-between gap-2">
          <h3 className="text-sm font-black text-navy">{t("sh.chartH")}</h3>
          <span className="text-[11px] font-extrabold text-muted">{t("sw.sales.chartNote")}</span>
        </div>
        <div className="mt-4 flex h-32 items-end gap-1.5" role="img" aria-label={t("sh.chartH")}>
          {state.history.map((h) => (
            <div
              key={h.date}
              title={`${h.date}: ₹${h.amount.toLocaleString("en-IN")}`}
              className="flex-1 rounded-t-pill"
              style={{
                height: `${Math.max(4, (h.amount / max) * 100)}%`,
                background: h.amount > 0 ? "rgb(var(--c-neem))" : "rgb(var(--c-line))",
              }}
            />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px] font-extrabold text-muted">
          <span>{state.history[0]?.date.slice(5)}</span>
          <span>{state.history[state.history.length - 1]?.date.slice(5)}</span>
        </div>
      </section>

      <section className="mt-4 rounded-card border border-line bg-white p-5 shadow-card">
        <h3 className="text-sm font-black text-navy">{t("sh.settleH")}</h3>
        <ul className="mt-3 divide-y divide-line">
          {state.settlements.slice(0, 8).map((s) => (
            <li key={s.id} className="flex items-center gap-3 py-2.5 text-sm font-semibold text-ink first:pt-0 last:pb-0">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-[rgba(14,159,110,0.12)] text-[#0E9F6E]">
                <Icon name="checkCircle" className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <b className="block truncate font-extrabold text-navy">{s.label}</b>
                <span className="block text-xs font-bold text-muted">
                  {t("sw.sales.verified")} · {new Date(s.at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                </span>
              </span>
              <span className="shrink-0 font-black tabular-nums text-navy">₹{s.amount.toLocaleString("en-IN")}</span>
            </li>
          ))}
          {state.settlements.length === 0 && (
            <li className="py-3 text-center text-xs font-extrabold text-muted">{t("sw.sales.noSettle")}</li>
          )}
        </ul>
        <p className="mt-3 flex items-center gap-2 rounded-control bg-chuna px-3 py-2 text-xs font-semibold text-muted">
          <Icon name="rupee" className="h-3.5 w-3.5 shrink-0 text-saffron" />
          {t("sh.settleNext")}
        </p>
      </section>
    </div>
  );
}