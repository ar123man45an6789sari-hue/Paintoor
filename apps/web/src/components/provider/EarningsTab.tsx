/* EarningsTab v1 — escrow split, 14-day chart, payout history, payout request. */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { getProviderState, onProviderStateChange } from "@/lib/providerstate";
import type { ProviderState } from "@/lib/providerstate";

export function EarningsTab() {
  const { t } = useI18n();
  const [state, setState] = useState<ProviderState | null>(null);
  const [toast, setToast] = useState<string | null>(null);

  const reload = useCallback(() => setState(getProviderState()), []);

  useEffect(() => {
    reload();
    return onProviderStateChange(reload);
  }, [reload]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  if (!state) return null;
  const max = Math.max(...state.history.map((h) => h.amount), 1);
  const paid = state.history.filter((h) => h.amount > 0).slice(-4).reverse();

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-navy">{t("pd.earnH")}</h2>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">{t("pd.inEscrow")}</p>
          <p className="mt-1 text-3xl font-black tabular-nums text-neem">₹{state.inEscrow.toLocaleString("en-IN")}</p>
        </div>
        <div className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-xs font-bold uppercase tracking-wider text-muted">{t("pd.pendingPayout")}</p>
          <p className="mt-1 text-3xl font-black tabular-nums text-navy">₹{state.pendingPayout.toLocaleString("en-IN")}</p>
          <p className="mt-1 text-xs font-semibold text-muted">
            💰 {t("pd.payoutLine", { amount: state.pendingPayout.toLocaleString("en-IN"), when: t("pd.payoutWhen") })}
          </p>
        </div>
      </div>

      <div className="rounded-card border border-line bg-white p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">{t("pd.chartH")}</p>
        <div className="mt-4 flex h-28 items-end gap-1.5">
          {state.history.map((h) => (
            <div
              key={h.date}
              title={`${h.date}: ₹${h.amount}`}
              className="flex-1 rounded-t-pill"
              style={{
                height: `${Math.max(4, (h.amount / max) * 100)}%`,
                background: h.amount > 0 ? "rgb(var(--c-saffron))" : "rgb(var(--c-line))",
              }}
            />
          ))}
        </div>
      </div>

      <div className="rounded-card border border-line bg-white p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">{t("pd.payoutHist")}</p>
        <ul className="mt-3 space-y-2">
          {paid.map((p) => (
            <li key={p.date} className="flex items-center justify-between text-sm font-semibold text-ink">
              <span>✅ {t("pd.paidOn", { date: p.date })}</span>
              <span className="font-black tabular-nums text-navy">₹{p.amount.toLocaleString("en-IN")}</span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={() => setToast(t("pd.payoutReq"))}
          className="mt-4 min-h-12 w-full rounded-control bg-saffron px-4 py-3 text-sm font-extrabold text-snow hover:shadow-lift"
        >
          💸 {t("pd.requestPayout")}
        </button>
      </div>

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-toast w-[min(92vw,420px)] -translate-x-1/2 rounded-control bg-navy px-4 py-3 text-center text-sm font-bold text-snow shadow-lift">
          {toast}
        </div>
      )}
    </div>
  );
}