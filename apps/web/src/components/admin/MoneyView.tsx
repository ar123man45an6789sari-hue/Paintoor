/* MoneyView — the money monitor: the seeded escrow account with its three
   milestones, admin hold toggles, commission maths and the shopkeeper
   settlement ledger. Holds are demo flags here; real money movement only
   arrives with the verified Razorpay integration in Phase 3 — the card
   copy says exactly that. */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { SEED_ESCROW, heldOf } from "@/lib/escrow";
import { inr } from "@/lib/jobs";
import { getShopState, onShopStateChange } from "@/lib/shopState";
import type { ShopState } from "@/lib/shopState";
import { getAdmin, onAdminChange, toggleHold } from "@/lib/adminState";

const COMMISSION_PCT = 10;

export function MoneyView({ onToast }: { onToast: (msg: string) => void }) {
  const { t } = useI18n();
  const [tick, setTick] = useState(0);
  const [shop, setShop] = useState<ShopState | null>(null);

  const reload = useCallback(() => setShop(getShopState()), []);
  useEffect(() => {
    reload();
    const offA = onAdminChange(() => setTick((v) => v + 1));
    const offS = onShopStateChange(reload);
    return () => { offA(); offS(); };
  }, [reload]);

  const admin = getAdmin();
  void tick;
  const released = SEED_ESCROW.milestones.filter((m) => m.state === "released").reduce((a, m) => a + m.amount, 0);

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("ad.money.eye")}</p>
      <div className="mt-1">
        <h2 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("ad.money.h")}</h2>
        <p className="mt-1 text-sm font-bold text-muted">{t("ad.money.sub")}</p>
      </div>

      {/* Escrow totals */}
      <div className="mt-4 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-card border border-line bg-white p-4 shadow-card">
          <p className="text-xs font-bold text-muted">{t("ad.money.jobTotal")}</p>
          <p className="mt-1 text-xl font-black tabular-nums text-navy">{inr(SEED_ESCROW.total)}</p>
          <p className="text-[10px] font-extrabold text-muted">{SEED_ESCROW.jobId}</p>
        </div>
        <div className="rounded-card border border-line bg-white p-4 shadow-card">
          <p className="text-xs font-bold text-muted">{t("ad.money.released")}</p>
          <p className="mt-1 text-xl font-black tabular-nums text-[#0E9F6E]">{inr(released)}</p>
        </div>
        <div className="rounded-card border border-line bg-white p-4 shadow-card">
          <p className="text-xs font-bold text-muted">{t("ad.money.held")}</p>
          <p className="mt-1 text-xl font-black tabular-nums text-saffron">{inr(heldOf(SEED_ESCROW))}</p>
        </div>
        <div className="rounded-card border border-line bg-white p-4 shadow-card">
          <p className="text-xs font-bold text-muted">{t("ad.money.commission")}</p>
          <p className="mt-1 text-xl font-black tabular-nums text-navy">{inr(Math.round((released * COMMISSION_PCT) / 100))}</p>
          <p className="text-[10px] font-extrabold text-muted">{t("ad.money.commissionNote", { n: COMMISSION_PCT })}</p>
        </div>
      </div>

      {/* Milestones */}
      <section className="mt-4 rounded-card border border-line bg-white p-5 shadow-card">
        <h3 className="text-sm font-black text-navy">{t("ad.money.milestones")}</h3>
        <ul className="mt-3 space-y-2.5">
          {SEED_ESCROW.milestones.map((m) => {
            const held = Boolean(admin.holds[m.id]);
            return (
              <li key={m.id} className="flex flex-wrap items-center gap-3 rounded-control border border-line p-3">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-pill bg-saffron/10 text-[11px] font-black text-saffron">
                  {m.pct}%
                </span>
                <div className="min-w-0 flex-1 basis-[160px]">
                  <b className="block truncate text-sm font-extrabold text-navy">{t(m.key)}</b>
                  <span className="block text-xs font-semibold text-muted">
                    {inr(m.amount)} · {t(`ad.money.st.${m.state}`)}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => { toggleHold(m.id, `${SEED_ESCROW.jobId} ${m.pct}%`); onToast(held ? t("ad.money.toastHoldOff") : t("ad.money.toastHoldOn")); }}
                  className={`min-h-10 shrink-0 rounded-control px-3 py-2 text-xs font-extrabold ${
                    held
                      ? "bg-[rgba(199,119,0,0.12)] text-[#C77700] hover:opacity-80"
                      : "border-2 border-line text-navy hover:border-saffron hover:text-saffron"
                  }`}
                >
                  <Icon name={held ? "pause" : "play"} className="mr-1 inline h-3.5 w-3.5" />
                  {held ? t("ad.money.onHold") : t("ad.money.hold")}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="mt-3 flex items-start gap-2 rounded-control bg-chuna px-3 py-2.5 text-[11px] font-bold leading-relaxed text-muted">
          <Icon name="info" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-saffron" />
          {t("ad.money.honest")}
        </p>
      </section>

      {/* Shop settlements */}
      {shop && (
        <section className="mt-4 rounded-card border border-line bg-white p-5 shadow-card">
          <h3 className="text-sm font-black text-navy">{t("ad.money.settlements")}</h3>
          {shop.settlements.length === 0 ? (
            <p className="mt-3 rounded-control bg-chuna p-4 text-center text-xs font-bold text-muted">{t("ad.money.noSettle")}</p>
          ) : (
            <ul className="mt-3 divide-y divide-line">
              {shop.settlements.slice(0, 8).map((s) => (
                <li key={s.id} className="flex items-center gap-3 py-2.5 text-sm font-semibold text-ink first:pt-0 last:pb-0">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-[rgba(14,159,110,0.12)] text-[#0E9F6E]">
                    <Icon name="checkCircle" className="h-4 w-4" />
                  </span>
                  <span className="min-w-0 flex-1 truncate font-extrabold text-navy">{s.label}</span>
                  <span className="shrink-0 font-black tabular-nums text-navy">{inr(s.amount)}</span>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </div>
  );
}