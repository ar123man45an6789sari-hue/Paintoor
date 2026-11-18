/* HistoryView — completed, customer-approved jobs with their site photos,
   final payout and star rating. The inline work record reuses the quote
   breakdown; portfolio sharing is an honest demo until the vault ships. */
"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { getRequests, onRequestsChange } from "@/lib/requests";
import type { ServiceRequest } from "@/lib/requests";
import { updatesFor } from "@/lib/partner";
import type { ProviderProfile } from "@/lib/providers";

const GRAD = "linear-gradient(135deg,#E00048,#A80036)";

function Stars({ n }: { n: number }) {
  return (
    <span className="inline-flex gap-0.5 align-middle" aria-label={`${n}/5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Icon key={i} name="star" className={`h-4 w-4 ${i <= n ? "text-saffron" : "text-line"}`} />
      ))}
    </span>
  );
}

export function HistoryView({ profile, onToast }: { profile: ProviderProfile; onToast: (msg: string) => void }) {
  const { t } = useI18n();
  const [jobs, setJobs] = useState<ServiceRequest[]>([]);
  const [openRec, setOpenRec] = useState<string | null>(null);

  useEffect(() => {
    const reload = () => {
      setJobs(
        getRequests()
          .filter((r) => r.acceptedBy === profile.id && r.status === "completed")
          .sort((a, b) => b.at - a.at),
      );
    };
    reload();
    return onRequestsChange(reload);
  }, [profile.id]);

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("pw.hist.eyebrow")}</p>
      <h2 className="mt-1 text-2xl font-black tracking-[-0.02em] text-navy">{t("pw.hist.h")}</h2>
      <p className="mt-1 text-sm font-bold text-muted">{t("pw.hist.sub")}</p>

      {jobs.length === 0 ? (
        <div className="mt-4 rounded-card border-2 border-dashed border-line bg-white p-6 text-center">
          <Icon name="history" className="mx-auto h-8 w-8 text-saffron" />
          <p className="mt-2 font-extrabold text-navy">{t("pw.hist.empty")}</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3">
          {jobs.map((r) => {
            const shots = updatesFor(r.id).flatMap((u) => u.photos);
            const cover = shots[0] ?? r.photos[0];
            const total = r.quoteTotal ?? 0;
            const isOpen = openRec === r.id;
            return (
              <article key={r.id} className="rounded-card border border-line bg-white p-4 shadow-card md:p-5">
                <div className="flex flex-wrap items-start gap-3">
                  {cover ? (
                    /* eslint-disable-next-line @next/next/no-img-element -- partner site upload, data URL */
                    <img src={cover} alt="" className="h-16 w-16 shrink-0 rounded-control object-cover" />
                  ) : (
                    <span
                      className="flex h-16 w-16 shrink-0 items-center justify-center rounded-control text-sm font-black text-snow"
                      style={{ background: GRAD }}
                      aria-hidden="true"
                    >
                      {r.customer.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase()}
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <b className="block truncate text-sm font-extrabold text-navy">{r.customer}</b>
                    <p className="text-xs font-semibold text-muted">
                      {r.zone} · {new Date(r.at).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                      {shots.length > 0 ? ` · ${t("pw.hist.photos", { n: shots.length })}` : ""}
                    </p>
                  </div>
                  <span className="rounded-pill bg-[rgba(14,159,110,0.12)] px-2.5 py-0.5 text-[11px] font-black text-[#0E9F6E]">
                    <Icon name="checkCircle" className="mr-1 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />
                    {t("pw.hist.approved")}
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-navy">{t(`sk.${r.category}`)}</h3>
                  <p className="text-lg font-black tabular-nums text-navy">₹{total.toLocaleString("en-IN")}</p>
                </div>
                <p className="mt-1 text-xs font-bold text-muted">
                  {typeof r.rating === "number" && r.rating > 0 ? (
                    <><Stars n={r.rating} /> <span className="ml-1 tabular-nums">{r.rating}.0</span></>
                  ) : (
                    t("pw.hist.norating")
                  )}
                </p>

                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setOpenRec(isOpen ? null : r.id)}
                    className="min-h-10 rounded-control border-2 border-line px-3 py-2 text-xs font-extrabold text-navy hover:border-saffron hover:text-saffron"
                  >
                    <Icon name="receipt" className="mr-1 inline h-3.5 w-3.5" />
                    {t("pw.hist.record")}
                  </button>
                  <button
                    type="button"
                    onClick={() => onToast(t("pw.hist.shareToast"))}
                    className="min-h-10 rounded-control border-2 border-line px-3 py-2 text-xs font-extrabold text-navy hover:border-saffron hover:text-saffron"
                  >
                    <Icon name="sparkle" className="mr-1 inline h-3.5 w-3.5" />
                    {t("pw.hist.share")}
                  </button>
                </div>

                {isOpen && (
                  <div className="mt-3 space-y-1.5 rounded-control bg-chuna p-3 text-xs font-bold text-muted">
                    <p className="flex justify-between gap-2"><span>{t("pw.rec.total")}</span><b className="tabular-nums text-navy">₹{total.toLocaleString("en-IN")}</b></p>
                    <p className="flex justify-between gap-2"><span>{t("pw.rec.advance")}</span><b className="tabular-nums text-navy">₹{(r.advancePaid ?? 0).toLocaleString("en-IN")}</b></p>
                    <p className="flex justify-between gap-2"><span>{t("pw.rec.rating")}</span><b className="text-navy">{typeof r.rating === "number" && r.rating > 0 ? `${r.rating}.0` : "—"}</b></p>
                    <p className="pt-1 text-[11px] font-semibold text-muted">{t("pw.rec.demo")}</p>
                  </div>
                )}
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}