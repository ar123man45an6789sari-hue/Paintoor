/* ProfileTab v1 — Skill Passport, scorecard, rate card, availability, KYC. */
"use client";

import { useI18n } from "@/i18n";
import { BADGE_LABELS, RATE_UNIT_LABEL, levelKeyFor, paiseToRupees } from "@/lib/providers";
import type { ProviderProfile } from "@/lib/providers";

const SCORE_ROWS: { key: string; value: number }[] = [
  { key: "sc.rating", value: 92 },
  { key: "sc.completion", value: 96 },
  { key: "sc.response", value: 88 },
  { key: "sc.onTime", value: 94 },
  { key: "sc.quoteAccept", value: 71 },
  { key: "sc.disputes", value: 100 },
  { key: "sc.profile", value: 85 },
  { key: "sc.repeat", value: 64 },
];

const FREE_DAYS = [1, 2, 4, 5, 6];

export function ProfileTab({ profile }: { profile: ProviderProfile }) {
  const { t } = useI18n();
  const total = Math.round(SCORE_ROWS.reduce((sum, r) => sum + r.value, 0) / SCORE_ROWS.length);

  return (
    <div className="space-y-4">
      <div className="rounded-card border border-line bg-white p-6 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-xl font-black text-navy">📜 {t("pd.skillPassport")}</h2>
          <span className="rounded-pill bg-saffron/15 px-3 py-1 text-xs font-black text-saffron">
            {t("pd.level")}: {t(levelKeyFor(profile.jobsDone))}
          </span>
        </div>
        <p className="mt-2 text-sm font-semibold text-muted">
          {t("pd.yearsExp", { n: profile.experience })} · {t("pd.jobsDone", { n: profile.jobsDone })} ·{" "}
          {t("pd.reviews", { n: profile.reviews })}
        </p>
        <p className="mt-2 text-sm italic text-ink">“{profile.quote}”</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {profile.badges.map((b) => (
            <span key={b} className="rounded-pill border border-line bg-chuna px-3 py-1 text-[11px] font-bold text-navy">
              {BADGE_LABELS[b] ?? b}
            </span>
          ))}
          <span className="rounded-pill border border-line bg-neem/10 px-3 py-1 text-[11px] font-bold text-neem">
            ✅ {t("pd.kycOk")}
          </span>
        </div>
      </div>

      <div className="rounded-card border border-line bg-white p-6 shadow-card">
        <div className="flex items-center justify-between">
          <h3 className="font-extrabold text-navy">📊 {t("pd.scorecard")}</h3>
          <span className="text-2xl font-black tabular-nums text-saffron">{total}</span>
        </div>
        <div className="mt-4 space-y-3">
          {SCORE_ROWS.map((row) => (
            <div key={row.key}>
              <div className="flex justify-between text-xs font-bold text-muted">
                <span>{t(row.key)}</span>
                <span className="tabular-nums">{row.value}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-pill bg-chuna">
                <div className="h-full rounded-pill bg-saffron" style={{ width: `${row.value}%` }} />
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 rounded-control bg-chuna px-3 py-2 text-xs font-semibold text-muted">💡 {t("sc.tip")}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-card border border-line bg-white p-6 shadow-card">
          <h3 className="font-extrabold text-navy">💼 {t("pd.rateCard")}</h3>
          <p className="mt-2 text-2xl font-black tabular-nums text-navy">
            {paiseToRupees(profile.rateMin)} – {paiseToRupees(profile.rateMax)}
            <span className="text-sm font-bold text-muted"> {RATE_UNIT_LABEL[profile.unit] ?? profile.unit}</span>
          </p>
          <p className="mt-2 text-xs font-semibold text-muted">
            🗺 {profile.zone}, {profile.city}
          </p>
        </div>
        <div className="rounded-card border border-line bg-white p-6 shadow-card">
          <h3 className="font-extrabold text-navy">📅 {t("pd.availability")}</h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {[0, 1, 2, 3, 4, 5, 6].map((d) => {
              const free = FREE_DAYS.includes(d);
              return (
                <span
                  key={d}
                  className={`rounded-pill px-3 py-1.5 text-[11px] font-black ${
                    free ? "bg-neem/15 text-neem" : "bg-chuna text-muted"
                  }`}
                >
                  {t(`pd.d${d}`)} · {free ? t("pd.free") : t("pd.busy")}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}