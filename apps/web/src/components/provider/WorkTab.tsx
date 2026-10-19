/* WorkTab v1 — today's job card: OTP start, complete, status chip.
   GPS check-in and milestone photos arrive in S11 (Blueprint Ch. 11.2 #8). */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { getRequests, onRequestsChange } from "@/lib/requests";
import type { ServiceRequest } from "@/lib/requests";
import type { ProviderProfile } from "@/lib/providers";
import { getProviderState, onProviderStateChange, setJobProgress } from "@/lib/providerstate";

/** Stable 4-digit job OTP per request — the customer reads it out on site. */
function otpFor(id: string): string {
  let sum = 7;
  for (let i = 0; i < id.length; i += 1) sum = (sum * 31 + id.charCodeAt(i)) % 9000;
  return String(sum + 1000);
}

export function WorkTab({ profile }: { profile: ProviderProfile }) {
  const { lang, t } = useI18n();
  const [jobs, setJobs] = useState<ServiceRequest[]>([]);
  const [progress, setProgress] = useState<Record<string, "started" | "completed">>({});

  const reload = useCallback(() => {
    setJobs(
      getRequests().filter(
        (r) => r.acceptedBy === profile.id && (r.status === "interested" || r.status === "accepted"),
      ),
    );
    setProgress(getProviderState().jobProgress ?? {});
  }, [profile.id]);

  useEffect(() => {
    reload();
    const offReq = onRequestsChange(reload);
    const offState = onProviderStateChange(reload);
    return () => {
      offReq();
      offState();
    };
  }, [reload]);

  const locale = lang === "hi" ? "hi-IN" : lang === "gu" ? "gu-IN" : "en-IN";

  if (jobs.length === 0) {
    return (
      <div className="rounded-card border-2 border-dashed border-line bg-white p-10 text-center">
        <p className="text-3xl">🧰</p>
        <p className="mt-2 font-extrabold text-navy">{t("pd.noJob")}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-navy">{t("pd.workH")}</h2>
       {jobs.map((job) => {
        const stored = progress[job.id];
        const state = stored === "started" || stored === "completed" ? stored : "scheduled";
        return (
          <article key={job.id} className="rounded-card border border-line bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-extrabold text-navy">
                {job.customer} · {job.zone}
              </h3>
              <span
                className={`rounded-pill px-3 py-1 text-[11px] font-black ${
                  state === "completed"
                    ? "bg-neem/15 text-neem"
                    : state === "started"
                      ? "bg-saffron/15 text-saffron"
                      : "bg-haldi/20 text-navy"
                }`}
              >
                {state === "completed" ? t("pd.jobDone") : state === "started" ? t("pd.jobStarted") : t("pd.jobScheduled")}
              </span>
            </div>
            <p className="mt-1 text-xs font-semibold text-muted">
              {t(`sk.${job.category}`)} ·{" "}
              {job.date
                ? new Date(`${job.date}T00:00:00`).toLocaleDateString(locale, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : t("pd.anyDate")}{" "}
              · {t(`slot.${job.slot}`)}
            </p>

            <div className="mt-4 flex items-center gap-4 rounded-control border-2 border-dashed border-line bg-chuna px-4 py-3">
              <span className="text-xs font-extrabold uppercase tracking-wider text-muted">{t("pd.otp")}</span>
              <span className="font-mono text-2xl font-black tracking-[0.3em] text-navy">{otpFor(job.id)}</span>
            </div>

            <div className="mt-4 flex gap-3">
              {state === "scheduled" && (
                <button
                  type="button"
                  onClick={() => setJobProgress(job.id, "started")}
                  className="min-h-12 flex-1 rounded-control bg-saffron px-4 py-3 text-sm font-extrabold text-white hover:shadow-lift"
                >
                  ▶ {t("pd.start")}
                </button>
              )}
              {state === "started" && (
                <button
                  type="button"
                  onClick={() => setJobProgress(job.id, "completed")}
                  className="min-h-12 flex-1 rounded-control bg-neem px-4 py-3 text-sm font-extrabold text-white hover:shadow-lift"
                >
                  ✓ {t("pd.complete")}
                </button>
              )}
              {state === "completed" && (
                <p className="min-h-12 flex-1 rounded-control bg-neem/10 px-4 py-3 text-center text-sm font-extrabold text-neem">
                  ✅ {t("pd.jobDone")}
                </p>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}