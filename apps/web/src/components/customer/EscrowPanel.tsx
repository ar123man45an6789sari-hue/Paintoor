/* Escrow wallet — held balance, the three milestones, the protection rules
   and the payout card for the live job.

   Every money action (release / refund / dispute) goes through the OtpModal;
   the demo accepts any six digits and says so. Releasing a milestone flips
   only that milestone — the held total is derived, never hardcoded. The
   payout card reads the live job's first crew, so it can never disagree
   with the jobs board. */
"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { inr, SEED_JOB } from "@/lib/jobs";
import {
  ESCROW_RULE_KEYS,
  heldOf,
  SEED_ESCROW,
  type EscrowAccount,
  type MilestoneState,
  type OtpMode,
} from "@/lib/escrow";
import { OtpModal } from "@/components/customer/OtpModal";
import { initialsOf } from "@/lib/profile";

const GRAD = "linear-gradient(135deg,#E00048,#A80036)";

function StatePill({ state }: { state: MilestoneState }) {
  const { t } = useI18n();
  if (state === "released") {
    return (
      <span className="rounded-pill bg-ink/15 px-2.5 py-0.5 text-[10px] font-extrabold text-ink">
        {t("cd.esc.released")}
      </span>
    );
  }
  if (state === "held") {
    return (
      <span className="rounded-pill bg-[rgba(199,119,0,0.12)] px-2.5 py-0.5 text-[10px] font-extrabold text-[#C77700]">
        {t("cd.esc.heldpill")}
      </span>
    );
  }
  return (
    <span className="rounded-pill bg-chuna px-2.5 py-0.5 text-[10px] font-extrabold text-muted">
      {t("cd.esc.pending")}
    </span>
  );
}

export function EscrowPanel() {
  const { t } = useI18n();
  const [acct, setAcct] = useState<EscrowAccount>(SEED_ESCROW);
  const [otp, setOtp] = useState<{ mode: OtpMode; milestoneId?: string } | null>(null);
  const [note, setNote] = useState<{ mode: OtpMode } | null>(null);

  const held = heldOf(acct);
  const pctHeld = Math.round((held / acct.total) * 100);
  const crew = SEED_JOB.crews[0];

  function verified() {
    if (!otp) return;
    if (otp.mode === "release" && otp.milestoneId) {
      const id = otp.milestoneId;
      setAcct((a) => ({
        ...a,
        milestones: a.milestones.map((m) => (m.id === id ? { ...m, state: "released" as MilestoneState } : m)),
      }));
    }
    setNote({ mode: otp.mode });
    setOtp(null);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("cd.nav.escrow")}</h1>
        <p className="mt-1 text-sm font-bold text-muted">{t("cd.esc.sub")}</p>
      </div>

      {/* Wallet */}
      <section className="relative overflow-hidden rounded-card text-snow shadow-card" style={{ background: GRAD }}>
        <div className="relative p-5">
          <p className="text-xs font-extrabold uppercase tracking-[0.14em] text-snow/80">{t("cd.esc.held")}</p>
          <p className="mt-1 text-3xl font-black tracking-[-0.02em]">{inr(held)}</p>
          <p className="mt-1 text-xs font-bold text-snow/80">{t("cd.esc.of", { n: inr(acct.total), id: acct.jobId })}</p>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-snow/25">
            <div className="h-full rounded-full bg-snow" style={{ width: `${pctHeld}%` }} />
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setOtp({ mode: "refund" })}
              className="rounded-control bg-snow px-3.5 py-2 text-xs font-extrabold text-saffron transition-opacity hover:opacity-90"
            >
              {t("cd.esc.refund")}
            </button>
            <button
              type="button"
              onClick={() => setOtp({ mode: "dispute" })}
              className="rounded-control border border-snow/60 px-3.5 py-2 text-xs font-extrabold text-snow transition-colors hover:bg-snow/10"
            >
              {t("cd.esc.dispute")}
            </button>
          </div>
        </div>
        <Icon name="wallet" className="absolute -bottom-4 -right-3 h-28 w-28 text-snow/10" />
      </section>

      {note && (
        <p className="flex items-center gap-2 rounded-control border border-line bg-white px-3 py-2 text-xs font-extrabold text-navy shadow-card">
          <Icon
            name={note.mode === "dispute" ? "alert" : "checkCircle"}
            className={`h-4 w-4 ${note.mode === "dispute" ? "text-[#C77700]" : "text-ink"}`}
          />
          {t(`cd.esc.note.${note.mode === "release" ? "released" : note.mode}`)}
        </p>
      )}

      {/* Milestones */}
      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <h2 className="text-sm font-extrabold text-navy">{t("cd.esc.milestones")}</h2>
        <div className="mt-3 space-y-3">
          {acct.milestones.map((m) => (
            <div key={m.id} className="flex flex-wrap items-center gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-pill ${
                  m.state === "released" ? "bg-ink/15 text-ink" : "bg-chuna text-muted"
                }`}
              >
                <Icon name={m.state === "released" ? "check" : "lock"} className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-extrabold text-navy">
                  {t(m.key)} · {m.pct}%
                </span>
                <span className="block text-xs font-bold text-muted">{inr(m.amount)}</span>
              </span>
              <StatePill state={m.state} />
              {m.state === "held" && (
                <button
                  type="button"
                  onClick={() => setOtp({ mode: "release", milestoneId: m.id })}
                  className="rounded-control bg-saffron px-3 py-1.5 text-xs font-extrabold text-snow transition-opacity hover:opacity-90"
                >
                  {t("cd.esc.release")}
                </button>
              )}
              {m.state === "pending" && (
                <span className="text-[10px] font-extrabold text-muted">{t("cd.esc.locked")}</span>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Rules */}
      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <h2 className="flex items-center gap-2 text-sm font-extrabold text-navy">
          <Icon name="shieldCheck" className="h-4 w-4 text-saffron" />
          {t("cd.esc.rules")}
        </h2>
        <ol className="mt-3 space-y-2.5">
          {ESCROW_RULE_KEYS.map((k, i) => (
            <li key={k} className="flex items-start gap-2.5">
              <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-pill bg-saffron text-[10px] font-black text-snow">
                {i + 1}
              </span>
              <span className="text-sm font-bold text-muted">{t(k)}</span>
            </li>
          ))}
        </ol>
      </section>

      {/* Payout — same numbers the jobs board shows for this crew */}
      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <h2 className="text-sm font-extrabold text-navy">{t("cd.esc.payout")}</h2>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill text-xs font-black text-snow"
            style={{ background: GRAD }}
            aria-hidden="true"
          >
            {initialsOf(crew.name)}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block text-sm font-extrabold text-navy">{crew.name}</span>
            <span className="block text-xs font-bold text-muted">
              {crew.payoutId} · {crew.bankLabel}
            </span>
          </span>
          <span className="shrink-0 text-sm font-black text-navy">{inr(crew.amount)}</span>
        </div>
      </section>

      {otp && <OtpModal mode={otp.mode} onClose={() => setOtp(null)} onVerified={verified} />}
    </div>
  );
}