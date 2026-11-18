/* PartnerDash — the landing view: live stat cards, jobs in motion, the
   freshest postbox lead and a computed next-best-action nudge. Every number
   comes from the demo stores; nothing is staged for show. */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon, type IconName } from "@/components/Icons";
import { getRequests, onRequestsChange } from "@/lib/requests";
import type { ServiceRequest } from "@/lib/requests";
import { getProviderState, onProviderStateChange } from "@/lib/providerstate";
import { onPartnerChange, updatesFor } from "@/lib/partner";
import { distanceKm, openLeadsFor } from "@/lib/providers";
import type { ProviderProfile } from "@/lib/providers";
import { localDayKey } from "@/lib/services";
import { JobCard, jobStateOf } from "./JobsView";
import { PartnerHero } from "./PartnerHero";

function StatCard({ icon, value, label, detail }: { icon: IconName; value: string; label: string; detail?: string }) {
  return (
    <article className="rounded-card border border-line bg-white p-4 shadow-card">
      <span className="flex h-9 w-9 items-center justify-center rounded-control bg-saffron/10 text-saffron">
        <Icon name={icon} className="h-[18px] w-[18px]" />
      </span>
      <p className="mt-2.5 text-2xl font-black tabular-nums text-navy">{value}</p>
      <p className="text-xs font-bold text-muted">{label}</p>
      {detail && <p className="mt-1 text-[11px] font-extrabold text-saffron">{detail}</p>}
    </article>
  );
}

export function PartnerDash({
  profile,
  onGo,
  onMessage,
  onToast,
}: {
  profile: ProviderProfile;
  onGo: (view: "jobs" | "postbox" | "earn" | "chat") => void;
  onMessage: (requestId: string) => void;
  onToast: (msg: string) => void;
}) {
  const { t } = useI18n();
  const [state, setState] = useState(() => ({ today: 0, week: 0, escrow: 0, payout: 0, progress: {} as Record<string, "started" | "completed"> }));
  const [jobs, setJobs] = useState<ServiceRequest[]>([]);
  const [leads, setLeads] = useState<ServiceRequest[]>([]);

  const reload = useCallback(() => {
    const s = getProviderState();
    setState({ today: s.todayEarnings, week: s.weekEarnings, escrow: s.inEscrow, payout: s.pendingPayout, progress: s.jobProgress ?? {} });
    const all = getRequests();
    setJobs(all.filter((r) => r.acceptedBy === profile.id && (r.status === "interested" || r.status === "accepted")));
    setLeads(openLeadsFor(profile, all));
  }, [profile]);

  useEffect(() => {
    reload();
    const offR = onRequestsChange(reload);
    const offS = onProviderStateChange(reload);
    const offP = onPartnerChange(reload);
    return () => { offR(); offS(); offP(); };
  }, [reload]);

  const inMotion = useMemo(
    () => jobs.filter((j) => jobStateOf(j, state.progress) !== "completed").slice(0, 2),
    [jobs, state.progress],
  );

  /* Honest nudge ladder: missing proof beats fresh leads beats payout. */
  const nudge = useMemo(() => {
    const today = localDayKey(new Date());
    const missing = inMotion.find((j) => {
      const us = updatesFor(j.id);
      return jobStateOf(j, state.progress) === "progress" && !us.some((u) => localDayKey(new Date(u.at)) === today);
    });
    if (missing) return { icon: "camera" as IconName, title: t("pw.act.proof"), sub: t("pw.act.proofSub", { name: missing.customer }), go: () => onGo("jobs") };
    if (leads.length > 0) return { icon: "box" as IconName, title: t("pw.act.leads"), sub: t("pw.act.leadsSub", { n: leads.length }), go: () => onGo("postbox") };
    if (state.payout > 0) return { icon: "wallet" as IconName, title: t("pw.act.payout"), sub: t("pw.act.payoutSub", { n: state.payout.toLocaleString("en-IN") }), go: () => onGo("earn") };
    return { icon: "checkCircle" as IconName, title: t("pw.act.clear"), sub: t("pw.act.clearSub"), go: () => onGo("jobs") };
  }, [inMotion, leads, state.payout, state.progress, onGo, t]);

  const lead = leads[0];

  return (
    <div className="space-y-5">
      <PartnerHero profile={profile} />

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon="wallet" value={`₹${state.today.toLocaleString("en-IN")}`} label={t("pw.stat.today")} />
        <StatCard icon="trend" value={`₹${state.week.toLocaleString("en-IN")}`} label={t("pw.stat.week")} />
        <StatCard icon="box" value={String(leads.length)} label={t("pw.stat.leads")} detail={t("pw.stat.leadsDetail", { n: leads.length })} />
        <StatCard icon="shield" value={`₹${state.escrow.toLocaleString("en-IN")}`} label={t("pw.stat.release")} detail={t("pw.stat.approval")} />
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        <section>
          <div className="mb-3 flex items-end justify-between gap-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("pw.jobs.glance")}</p>
              <h2 className="mt-0.5 text-xl font-black text-navy">{t("pw.jobs.motion")}</h2>
            </div>
            <button type="button" onClick={() => onGo("jobs")} className="min-h-10 rounded-control border-2 border-line px-3 py-2 text-xs font-extrabold text-navy hover:border-saffron hover:text-saffron">
              {t("pw.allJobs")} <Icon name="arrowRight" className="ml-1 inline h-3.5 w-3.5" />
            </button>
          </div>
          {inMotion.length === 0 ? (
            <div className="rounded-card border-2 border-dashed border-line bg-white p-6 text-center">
              <Icon name="toolbox" className="mx-auto h-8 w-8 text-saffron" />
              <p className="mt-2 font-extrabold text-navy">{t("pd.noJob")}</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {inMotion.map((j) => (
                <JobCard
                  key={j.id}
                  job={j}
                  state={jobStateOf(j, state.progress)}
                  profile={profile}
                  compact
                  onMessage={onMessage}
                  onStart={() => onGo("jobs")}
                  onComplete={() => onGo("jobs")}
                  onToast={onToast}
                />
              ))}
            </div>
          )}
        </section>

        <section>
          <div className="mb-3 flex items-end justify-between gap-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("pw.freshNear")}</p>
              <h2 className="mt-0.5 text-xl font-black text-navy">{t("pw.fresh")}</h2>
            </div>
            <button type="button" onClick={() => onGo("postbox")} className="min-h-10 rounded-control border-2 border-line px-3 py-2 text-xs font-extrabold text-navy hover:border-saffron hover:text-saffron">
              {t("pw.viewAll")} <Icon name="arrowRight" className="ml-1 inline h-3.5 w-3.5" />
            </button>
          </div>
          {lead ? (
            <article className="rounded-card border border-line bg-white p-5 shadow-card">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-chuna text-xs font-black text-navy">
                  {lead.customer.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <b className="text-sm font-extrabold text-navy">{lead.customer}</b>
                  <p className="text-xs font-semibold text-muted">
                    {lead.zone} · {t("pd.distance", { km: distanceKm(profile.zone, lead.zone) })}
                  </p>
                </div>
                <span className="rounded-pill bg-saffron/15 px-2.5 py-0.5 text-[11px] font-black text-saffron">
                  <span className="mr-1 inline-block h-1.5 w-1.5 animate-pulse rounded-pill bg-saffron align-middle" />{t("pw.pb.openQuotes")}
                </span>
              </div>
              <h3 className="mt-3 text-sm font-extrabold text-navy">{t(`sk.${lead.category}`)}</h3>
              <p className="mt-1 line-clamp-2 text-sm font-semibold text-ink">{lead.description}</p>
              <button type="button" onClick={() => onGo("postbox")} className="mt-3 min-h-11 w-full rounded-control bg-saffron px-4 py-2.5 text-sm font-extrabold text-snow hover:shadow-lift">
                <Icon name="receipt" className="mr-1.5 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("pw.pb.quote")}
              </button>
            </article>
          ) : (
            <div className="rounded-card border-2 border-dashed border-line bg-white p-6 text-center">
              <Icon name="box" className="mx-auto h-8 w-8 text-saffron" />
              <p className="mt-2 font-extrabold text-navy">{t("pd.emptyLeads")}</p>
            </div>
          )}
        </section>
      </div>

      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("pw.nextKeep")}</p>
            <h2 className="mt-0.5 text-xl font-black text-navy">{t("pw.next")}</h2>
          </div>
          <span className="rounded-pill bg-saffron/15 px-3 py-1 text-xs font-black text-saffron">
            <Icon name="sparkle" className="mr-1 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("pw.nudge")}
          </span>
        </div>
        <button type="button" onClick={nudge.go} className="mt-4 flex w-full items-center gap-3 rounded-control border-2 border-line bg-chuna p-4 text-left transition-colors hover:border-saffron">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-white text-saffron shadow-card">
            <Icon name={nudge.icon} className="h-5 w-5" />
          </span>
          <span className="min-w-0 flex-1">
            <b className="block text-sm font-extrabold text-navy">{nudge.title}</b>
            <span className="block text-xs font-semibold text-muted">{nudge.sub}</span>
          </span>
          <Icon name="arrowRight" className="h-4 w-4 shrink-0 text-muted" />
        </button>
      </section>
    </div>
  );
}