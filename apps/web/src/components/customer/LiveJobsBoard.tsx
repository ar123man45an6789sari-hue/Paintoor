/* Live jobs board — real database jobs for the signed-in customer
   (Module 2.4). Replaces the demo board whenever a real session exists;
   the empty state stays honest until the first hire. */
"use client";

import { useEffect, useState } from "react";

type Milestone = {
  id: string;
  seq: number;
  labelKey: string;
  pct: number;
  amountPaise: number;
  state: string;
  releasedAt: string | null;
};

type LiveJob = {
  id: string;
  code: string;
  city: string;
  addressLabel: string;
  totalPaise: number;
  day: number;
  totalDays: number;
  pct: number;
  startedAt: string;
  endsAt: string;
  status: string;
  partnerName: string;
  milestones: Milestone[];
};

const STATE_STYLE: Record<string, string> = {
  released: "border-saffron bg-saffron/10 text-saffron",
  held: "border-line bg-chuna text-muted",
  pending: "border-line bg-chuna text-muted",
  admin_hold: "border-danger bg-chuna text-danger",
};

const inr = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;
const label = (key: string) => key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");
const day = (iso: string) => new Date(iso).toLocaleDateString("en-IN", { day: "numeric", month: "short" });

export function LiveJobsBoard() {
  const [jobs, setJobs] = useState<LiveJob[] | null>(null);

  useEffect(() => {
    let on = true;
    fetch("/api/jobs")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => {
        if (on) setJobs(j && j.ok ? (j.jobs as LiveJob[]) : []);
      })
      .catch(() => {
        if (on) setJobs([]);
      });
    return () => {
      on = false;
    };
  }, []);

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <header>
        <h2 className="text-lg font-extrabold text-navy dark:text-snow">My jobs</h2>
        <p className="text-xs font-semibold text-muted">Live progress from the database — updated on every visit.</p>
      </header>

      {jobs === null && <p className="text-sm font-bold text-muted">Loading…</p>}

      {jobs !== null && jobs.length === 0 && (
        <div className="rounded-card border border-line bg-white p-8 text-center shadow-card dark:bg-navy">
          <p className="text-sm font-extrabold text-navy dark:text-snow">No jobs yet</p>
          <p className="mt-1 text-xs font-semibold text-muted">
            Post a request and hire a partner — live day-by-day progress will appear here.
          </p>
        </div>
      )}

      {jobs?.map((job) => (
        <article key={job.id} className="rounded-card border border-line bg-white p-5 shadow-card dark:bg-navy">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h3 className="text-base font-extrabold text-navy dark:text-snow">
              {job.code} <span className="text-xs font-bold text-muted">· {job.partnerName}</span>
            </h3>
            <span className="text-xs font-extrabold tabular-nums text-saffron">
              Day {job.day} of {job.totalDays} · {job.pct}%
            </span>
          </div>
          <p className="mt-1 text-xs font-semibold text-muted">
            {job.addressLabel}, {job.city} · {day(job.startedAt)} → {day(job.endsAt)} · {inr(job.totalPaise)}
          </p>
          <div className="mt-3 h-2 w-full overflow-hidden rounded-pill bg-chuna">
            <div className="h-full rounded-pill bg-saffron" style={{ width: `${Math.min(100, job.pct)}%` }} />
          </div>
          <ul className="mt-4 space-y-2">
            {job.milestones.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 rounded-control border border-line px-3 py-2">
                <span className="text-xs font-extrabold text-navy dark:text-snow">
                  {m.seq}. {label(m.labelKey)} <span className="font-bold text-muted">· {m.pct}%</span>
                </span>
                <span className={`rounded-pill border px-2.5 py-1 text-[10px] font-extrabold ${STATE_STYLE[m.state] ?? STATE_STYLE.pending}`}>
                  {label(m.state)} · {inr(m.amountPaise)}
                </span>
              </li>
            ))}
          </ul>
        </article>
      ))}
    </div>
  );
}