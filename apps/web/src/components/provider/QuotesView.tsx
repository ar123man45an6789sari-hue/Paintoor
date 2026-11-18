/* QuotesView — every itemized quote the partner has sent, newest first,
   with its live outcome (waiting / accepted) read from the requests store. */
"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { getRequest, onRequestsChange } from "@/lib/requests";
import type { ServiceRequest } from "@/lib/requests";
import { allQuotes, onPartnerChange } from "@/lib/partner";
import type { PartnerQuote } from "@/lib/partner";
import type { ProviderProfile } from "@/lib/providers";

export function QuotesView({ profile, onOpenJobs }: { profile: ProviderProfile; onOpenJobs: () => void }) {
  const { t } = useI18n();
  const [rows, setRows] = useState<{ q: PartnerQuote; r?: ServiceRequest }[]>([]);

  function reload() {
    setRows(allQuotes().map((q) => ({ q, r: getRequest(q.requestId) })));
  }

  useEffect(() => {
    reload();
    const offR = onRequestsChange(reload);
    const offP = onPartnerChange(reload);
    return () => { offR(); offP(); };
  }, []);

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("pw.qs.eyebrow")}</p>
      <h2 className="mt-1 text-2xl font-black tracking-[-0.02em] text-navy">{t("pw.qs.h")}</h2>
      <p className="mt-1 text-sm font-bold text-muted">{t("pw.qs.sub")}</p>

      {rows.length === 0 ? (
        <div className="mt-4 rounded-card border-2 border-dashed border-line bg-white p-6 text-center">
          <Icon name="receipt" className="mx-auto h-8 w-8 text-saffron" />
          <p className="mt-2 font-extrabold text-navy">{t("pw.qs.empty")}</p>
        </div>
      ) : (
        <div className="mt-4 divide-y divide-line overflow-hidden rounded-card border border-line bg-white shadow-card">
          {rows.map(({ q, r }) => {
            const accepted = !!r && (r.status === "accepted" || r.status === "completed") && r.acceptedBy === profile.id;
            const total = q.labour + q.material;
            return (
              <div key={q.id} className="flex flex-wrap items-center gap-3 p-4 md:p-5">
                <div className="min-w-0 flex-1">
                  <b className="text-sm font-extrabold text-navy">
                    {t(`sk.${r?.category ?? "painting"}`)} · {r?.customer ?? t("pw.qs.unknown")}
                  </b>
                  <p className="mt-0.5 text-xs font-semibold text-muted">
                    {new Date(q.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {t("pw.qs.days", { n: q.days })} · {t("pw.q.itemized")}
                    {q.note ? ` · ${q.note}` : ""}
                  </p>
                  <span className={`mt-1.5 inline-block rounded-pill px-2.5 py-0.5 text-[11px] font-black ${accepted ? "bg-ink text-snow" : "bg-saffron/15 text-saffron"}`}>
                    {accepted ? (
                      <><Icon name="checkCircle" className="mr-1 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("pw.qs.accepted")}</>
                    ) : (
                      <><Icon name="clock" className="mr-1 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("pw.qs.waiting")}</>
                    )}
                  </span>
                </div>
                <div className="text-right">
                  <p className="text-lg font-black tabular-nums text-navy">₹{total.toLocaleString("en-IN")}</p>
                  <p className="text-[11px] font-bold text-muted">{t("pw.qs.split", { l: q.labour.toLocaleString("en-IN"), m: q.material.toLocaleString("en-IN") })}</p>
                </div>
                {accepted && (
                  <button type="button" onClick={onOpenJobs} className="min-h-10 rounded-control border-2 border-line px-3 py-2 text-xs font-extrabold text-navy hover:border-saffron hover:text-saffron">
                    {t("pw.qs.open")}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}