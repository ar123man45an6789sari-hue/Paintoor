/* SalesPanel v1 — sales counters, 14-day chart, recent settlements. */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { getShopState, onShopStateChange } from "@/lib/shopState";
import type { ShopState } from "@/lib/shopState";

export function SalesPanel() {
  const { t } = useI18n();
  const [state, setState] = useState<ShopState | null>(null);

  const reload = useCallback(() => setState(getShopState()), []);

  useEffect(() => {
    reload();
    return onShopStateChange(reload);
  }, [reload]);

  if (!state) return null;
  const max = Math.max(...state.history.map((h) => h.amount), 1);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-navy">💰 {t("sh.salesH")}</h2>

      <div className="rounded-card border border-line bg-white p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">{t("sh.chartH")}</p>
        <div className="mt-4 flex h-28 items-end gap-1.5">
          {state.history.map((h) => (
            <div
              key={h.date}
              title={`${h.date}: ₹${h.amount}`}
              className="flex-1 rounded-t-sm"
              style={{
                height: `${Math.max(4, (h.amount / max) * 100)}%`,
                background: h.amount > 0 ? "rgb(var(--c-neem))" : "rgb(var(--c-line))",
              }}
            />
          ))}
        </div>
      </div>

      <div className="rounded-card border border-line bg-white p-5 shadow-card">
        <p className="text-xs font-bold uppercase tracking-wider text-muted">{t("sh.settleH")}</p>
        <ul className="mt-3 space-y-2">
          {state.settlements.slice(0, 6).map((s) => (
            <li key={s.id} className="flex items-center justify-between text-sm font-semibold text-ink">
              <span>✅ {s.label}</span>
              <span className="font-black tabular-nums text-navy">₹{s.amount.toLocaleString("en-IN")}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 rounded-control bg-chuna px-3 py-2 text-xs font-semibold text-muted">💰 {t("sh.settleNext")}</p>
      </div>
    </div>
  );
}