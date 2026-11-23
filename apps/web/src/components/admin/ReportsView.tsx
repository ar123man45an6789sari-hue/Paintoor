/* ReportsView — the moderation queue: seeded demo incidents (fraud,
   pricing, quality, review abuse) with resolve/dismiss actions. Queue
   badges in the sidebar and bottom nav read the open count. */
"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon, type IconName } from "@/components/Icons";
import { dismissIncident, getAdmin, onAdminChange, resolveIncident } from "@/lib/adminState";
import type { Incident } from "@/lib/adminState";

const KIND_ICON: Record<Incident["kind"], IconName> = {
  fraud: "alert",
  pricing: "rupee",
  quality: "brush",
  review: "star",
};

type Filter = "open" | "resolved" | "dismissed" | "all";

export function ReportsView({ onToast }: { onToast: (msg: string) => void }) {
  const { t } = useI18n();
  const [tick, setTick] = useState(0);
  const [filter, setFilter] = useState<Filter>("open");

  useEffect(() => onAdminChange(() => setTick((v) => v + 1)), []);

  const admin = getAdmin();
  void tick;
  const counts = {
    open: admin.incidents.filter((i) => i.status === "open").length,
    resolved: admin.incidents.filter((i) => i.status === "resolved").length,
    dismissed: admin.incidents.filter((i) => i.status === "dismissed").length,
  };
  const shown = admin.incidents.filter((i) => filter === "all" || i.status === filter);

  const filters: { id: Filter; label: string; n?: number }[] = [
    { id: "open", label: t("ad.rep.open"), n: counts.open },
    { id: "resolved", label: t("ad.rep.resolved"), n: counts.resolved },
    { id: "dismissed", label: t("ad.rep.dismissed"), n: counts.dismissed },
    { id: "all", label: t("ad.rep.all") },
  ];

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("ad.rep.eye")}</p>
      <div className="mt-1">
        <h2 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("ad.rep.h")}</h2>
        <p className="mt-1 text-sm font-bold text-muted">{t("ad.rep.sub")}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-1.5" role="tablist" aria-label={t("ad.rep.filters")}>
        {filters.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`min-h-10 rounded-pill border-2 px-3.5 py-1.5 text-xs font-extrabold transition-colors ${
              filter === f.id ? "border-saffron bg-saffron text-snow" : "border-line bg-white text-muted hover:border-saffron hover:text-saffron"
            }`}
          >
            {f.label}
            {f.n !== undefined && f.n > 0 && (
              <span className={`ml-1.5 rounded-pill px-1.5 text-[10px] font-black ${filter === f.id ? "bg-snow/25" : "bg-saffron/15 text-saffron"}`}>{f.n}</span>
            )}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2.5">
        {shown.map((inc) => (
          <article key={inc.id} className={`rounded-card border border-line bg-white p-4 shadow-card ${inc.status === "open" ? "" : "opacity-70"}`}>
            <div className="flex flex-wrap items-start gap-3">
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-control ${inc.status === "open" ? "bg-saffron text-snow" : "bg-saffron/10 text-saffron"}`}>
                <Icon name={KIND_ICON[inc.kind]} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1 basis-[200px]">
                <h3 className="text-sm font-extrabold text-navy">
                  {t(`ad.rep.kind.${inc.kind}`)} · {inc.subject}
                </h3>
                <p className="mt-0.5 text-xs font-semibold leading-relaxed text-muted">{inc.detail}</p>
                <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-muted">
                  {new Date(inc.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                  {inc.status !== "open" && ` · ${t(`ad.rep.st.${inc.status}`)}`}
                </p>
              </div>
              {inc.status === "open" && (
                <div className="flex shrink-0 gap-1.5">
                  <button
                    type="button"
                    onClick={() => { resolveIncident(inc.id); onToast(t("ad.rep.toastResolved")); }}
                    className="min-h-10 rounded-control bg-saffron px-3 py-2 text-xs font-extrabold text-snow hover:shadow-lift"
                  >
                    <Icon name="check" className="mr-1 inline h-3.5 w-3.5" />
                    {t("ad.rep.resolve")}
                  </button>
                  <button
                    type="button"
                    onClick={() => { dismissIncident(inc.id); onToast(t("ad.rep.toastDismissed")); }}
                    className="min-h-10 rounded-control border-2 border-line px-3 py-2 text-xs font-extrabold text-navy hover:border-saffron hover:text-saffron"
                  >
                    {t("ad.rep.dismiss")}
                  </button>
                </div>
              )}
            </div>
          </article>
        ))}
        {shown.length === 0 && (
          <div className="rounded-card border-2 border-dashed border-line bg-white p-6 text-center">
            <Icon name="shieldCheck" className="mx-auto h-8 w-8 text-[#0E9F6E]" />
            <p className="mt-2 font-extrabold text-navy">{t("ad.rep.empty")}</p>
          </div>
        )}
      </div>
    </div>
  );
}