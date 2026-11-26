/* Live partner jobs — real DB jobs with day/progress updates through the
   advance_job DEFINER function (Module 2.5). */
"use client";

import { useCallback, useEffect, useState } from "react";

type Milestone = { id: string; seq: number; labelKey: string; pct: number; amountPaise: number; state: string };
type LiveJob = {
  id: string;
  code: string;
  city: string;
  addressLabel: string;
  totalPaise: number;
  day: number;
  totalDays: number;
  pct: number;
  status: string;
  customerName: string;
  milestones: Milestone[];
};

const inr = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;
const label = (key: string) => key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, " ");

export function LivePartnerJobs() {
  const [jobs, setJobs] = useState<LiveJob[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/partner/jobs")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setJobs(j && j.ok ? (j.jobs as LiveJob[]) : []))
      .catch(() => setJobs([]));
  }, []);
  useEffect(load, [load]);

  async function save(job: LiveJob, day: number, pct: number) {
    setBusy(job.id);
    try {
      await fetch(`/api/partner/jobs/${job.id}/progress`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ day, pct }),
      });
    } finally {
      setBusy(null);
      load();
    }
  }

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <header>
        <h2 className="text-lg font-extrabold text-navy dark:text-snow">My jobs</h2>
        <p className="text-xs font-semibold text-muted">Update day and progress — the database validates every step.</p>
      </header>
      {jobs === null && <p className="text-sm font-bold text-muted">Loading…</p>}
      {jobs !== null && jobs.length === 0 && (
        <div className="rounded-card border border-line bg-white p-8 text-center shadow-card dark:bg-navy">
          <p className="text-sm font-extrabold text-navy dark:text-snow">No jobs yet</p>
          <p className="mt-1 text-xs font-semibold text-muted">Respond to open requests in the Postbox to get hired.</p>
        </div>
      )}
      {jobs?.map((job) => (
        <JobCard key={job.id} job={job} busy={busy === job.id} onSave={save} />
      ))}
    </div>
  );
}

function JobCard({
  job,
  busy,
  onSave,
}: {
  job: LiveJob;
  busy: boolean;
  onSave: (j: LiveJob, day: number, pct: number) => Promise<void>;
}) {
  const [day, setDay] = useState(job.day);
  const [pct, setPct] = useState(job.pct);
  const dirty = day !== job.day || pct !== job.pct;
  return (
    <article className="rounded-card border border-line bg-white p-5 shadow-card dark:bg-navy">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="text-base font-extrabold text-navy dark:text-snow">
          {job.code} <span className="text-xs font-bold text-muted">· {job.customerName}</span>
        </h3>
        <span
          className={`rounded-pill border px-2.5 py-1 text-[10px] font-extrabold ${
            job.status === "live" ? "border-saffron text-saffron" : "border-line text-muted"
          }`}
        >
          {job.status}
        </span>
      </div>
      <p className="mt-1 text-xs font-semibold text-muted">
        {job.addressLabel}, {job.city} · {inr(job.totalPaise)}
      </p>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-pill bg-chuna">
        <div className="h-full rounded-pill bg-saffron" style={{ width: `${Math.min(100, job.pct)}%` }} />
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs font-extrabold text-navy dark:text-snow">
          Day
          <input
            type="number"
            min={1}
            max={job.totalDays}
            value={day}
            onChange={(e) => setDay(Number(e.target.value))}
            className="min-h-10 w-16 rounded-control border-2 border-line bg-white px-2 text-center text-xs font-extrabold tabular-nums text-navy dark:bg-transparent dark:text-snow"
          />
          <span className="text-muted">/ {job.totalDays}</span>
        </label>
        <label className="flex flex-1 items-center gap-2 text-xs font-extrabold text-navy dark:text-snow">
          Progress
          <input type="range" min={0} max={100} value={pct} onChange={(e) => setPct(Number(e.target.value))} className="flex-1" />
          <span className="w-10 text-right tabular-nums">{pct}%</span>
        </label>
        <button
          type="button"
          disabled={!dirty || busy}
          onClick={() => void onSave(job, day, pct)}
          className="rounded-control bg-saffron px-4 py-1.5 text-xs font-extrabold text-snow hover:shadow-lift disabled:opacity-40"
        >
          Save update
        </button>
      </div>
      <ul className="mt-4 flex flex-wrap gap-2">
        {job.milestones.map((m) => (
          <li key={m.id} className="rounded-pill border border-line bg-chuna px-3 py-1 text-[10px] font-extrabold text-muted">
            {m.seq}. {label(m.labelKey)} · {m.pct}% · {label(m.state)}
          </li>
        ))}
      </ul>
    </article>
  );
}