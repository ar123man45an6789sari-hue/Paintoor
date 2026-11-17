/* Job history — the last 30 days of activity across jobs, newest first.

   Retention is the spec rule: entries outside the 30-day window are
   counted and reported as archived, never shown, never deleted. The demo
   timeline is pinned to 16 Oct 2025 (lib/history) so the window does not
   drift with the real clock. */
"use client";

import { useI18n } from "@/i18n";
import { Icon, type IconName } from "@/components/Icons";
import {
  DEMO_TODAY,
  HISTORY_SEED,
  RETENTION_DAYS,
  withinRetention,
  type HistoryKind,
} from "@/lib/history";

const KIND_ICON: Record<HistoryKind, IconName> = {
  post: "note",
  visit: "mapPin",
  pay: "wallet",
  doc: "fileCheck",
  order: "truck",
  crew: "users",
  progress: "sparkle",
  ext: "clock",
};

export function JobHistory() {
  const { lang, t } = useI18n();
  const locale = lang === "hi" ? "hi-IN" : lang === "gu" ? "gu-IN" : "en-IN";

  const shown = HISTORY_SEED.filter((e) => withinRetention(e));
  const archived = HISTORY_SEED.length - shown.length;
  const pinned = new Date(`${DEMO_TODAY}T00:00:00`).toLocaleDateString(locale, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("cd.nav.hist")}</h1>
        <p className="mt-1 text-sm font-bold text-muted">{t("cd.hist.sub")}</p>
      </div>

      {/* Retention banner */}
      <p className="flex flex-wrap items-center gap-2 rounded-control border border-line bg-white px-3 py-2 text-xs font-extrabold text-muted shadow-card">
        <Icon name="history" className="h-4 w-4 text-saffron" />
        {t("cd.hist.window", { n: RETENTION_DAYS })}
        <span className="rounded-pill bg-chuna px-2 py-0.5 text-[10px] font-extrabold text-navy">
          {t("cd.hist.pinned", { d: pinned })}
        </span>
      </p>

      {/* Timeline */}
      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <ol className="space-y-4">
          {shown.map((e) => (
            <li key={e.id} className="flex items-start gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-saffron/10 text-saffron">
                <Icon name={KIND_ICON[e.kind]} className="h-3.5 w-3.5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block text-sm font-bold text-navy">{e.text}</span>
                <span className="mt-0.5 block text-[11px] font-extrabold text-muted">
                  {new Date(`${e.at}T00:00:00`).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                  {" · "}
                  <span className="rounded-pill bg-chuna px-1.5 py-0.5 text-navy">{e.jobId}</span>
                </span>
              </span>
            </li>
          ))}
        </ol>
        {archived > 0 && (
          <p className="mt-4 flex items-center gap-2 border-t border-line pt-3 text-[11px] font-extrabold text-muted">
            <Icon name="package" className="h-3.5 w-3.5" />
            {t("cd.hist.archived", { n: archived })}
          </p>
        )}
      </section>
    </div>
  );
}