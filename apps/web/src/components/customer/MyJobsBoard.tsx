/* My jobs board — the multi-crew progress view.

   One job, many crews: a five-step timeline, the extension request card
   (approving grows only that crew's schedule), the global progress bar
   (shared start date) and one collapsible box per crew with its own
   day log. Several boxes can stay open at once for comparison.
   Message / call / video actions arrive with the chat step. */
"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import {
  approveExtension,
  inr,
  jobTimeline,
  SEED_EXTENSION,
  SEED_JOB,
  type Job,
} from "@/lib/jobs";
import { WorkerDayLog } from "@/components/customer/WorkerDayLog";
import { initialsOf } from "@/lib/profile";

const WARN = "#C77700";
const GRAD = "linear-gradient(135deg,#E00048,#A80036)";

/** Crew headshot with an initials fallback — a missing photo never shows a
    broken image box, it degrades to the gradient monogram. */
function CrewAvatar({ photo, name, className }: { photo: string; name: string; className: string }) {
  const [failed, setFailed] = useState(false);
  if (!photo || failed) {
    return (
      <span
        className={`flex items-center justify-center rounded-pill font-black text-snow ${className}`}
        style={{ background: GRAD }}
        aria-label={name}
      >
        {initialsOf(name)}
      </span>
    );
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element -- crew headshots, no optimisation pass yet */
    <img src={photo} alt={name} onError={() => setFailed(true)} className={`${className} object-cover`} />
  );
}

export function MyJobsBoard({
  onOpenChat,
}: {
  onOpenChat?: (crewId: string, mode: "chat" | "call" | "video") => void;
}) {
  const { t } = useI18n();
  const [job, setJob] = useState<Job>(SEED_JOB);
  const [extState, setExtState] = useState<"open" | "approved" | "declined">(SEED_EXTENSION.state);
  const [open, setOpen] = useState<string[]>([]);

  const toggle = (id: string) =>
    setOpen((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));

  const steps = jobTimeline(job);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.02em] text-navy">
          {t("cd.nav.jobs")}
        </h1>
        <p className="mt-1 text-sm font-bold text-muted">{t("cd.jobs.sub")}</p>
      </div>

      {/* Five-step timeline */}
      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <ol className="flex flex-wrap items-center gap-x-1 gap-y-3">
          {steps.map((s, i) => (
            <li key={s.key} className="flex items-center">
              <span className="flex items-center gap-1.5">
                <span
                  className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-pill text-[10px] font-extrabold ${
                    s.state === "done"
                      ? "bg-saffron text-snow"
                      : s.state === "cur"
                        ? "animate-pulse bg-saffron text-snow"
                        : "bg-chuna text-muted"
                  }`}
                >
                  {s.state === "done" ? <Icon name="check" className="h-3 w-3" /> : i + 1}
                </span>
                <span
                  className={`text-xs font-extrabold ${
                    s.state === "next" ? "text-muted" : "text-navy"
                  }`}
                >
                  {t(s.key)}
                </span>
              </span>
              {i < steps.length - 1 && (
                <span className="mx-2 hidden h-px w-5 bg-line sm:block" aria-hidden="true" />
              )}
            </li>
          ))}
        </ol>
      </section>

      {/* Extension request — approval touches one crew only */}
      {extState === "open" ? (
        <section className="relative overflow-hidden rounded-card border border-line bg-white p-5 shadow-card">
          <span className="absolute left-0 top-0 h-full w-1" style={{ background: WARN }} aria-hidden="true" />
          <div className="flex flex-wrap items-start gap-3 pl-2">
            <Icon name="alert" className="mt-0.5 h-5 w-5 shrink-0 text-[#C77700]" />
            <div className="min-w-0 flex-1">
              <h2 className="text-sm font-extrabold text-navy">{t("cd.ext.h")}</h2>
              <p className="mt-1 text-sm font-bold text-muted">
                <b className="text-navy">{SEED_EXTENSION.crewName}</b> — {SEED_EXTENSION.note}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  className="rounded-control bg-saffron px-4 py-2 text-sm font-extrabold text-snow transition-opacity hover:opacity-90"
                  onClick={() => {
                    setJob((j) => approveExtension(j, SEED_EXTENSION.crewId, SEED_EXTENSION.extraDays));
                    setExtState("approved");
                  }}
                >
                  {t("cd.ext.ok")}
                </button>
                <button
                  type="button"
                  className="rounded-control border border-line px-3 py-2 text-xs font-extrabold text-navy transition-colors hover:border-saffron hover:text-saffron"
                  onClick={() => setExtState("declined")}
                >
                  {t("cd.ext.no")}
                </button>
                <span className="self-center rounded-pill bg-chuna px-2 py-0.5 text-[10px] font-extrabold text-navy">
                  {t("cd.ext.days", { n: SEED_EXTENSION.extraDays })}
                </span>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <p className="flex items-center gap-2 text-xs font-extrabold text-muted">
          <Icon name={extState === "approved" ? "checkCircle" : "close"} className="h-4 w-4 text-saffron" />
          {SEED_EXTENSION.crewName} — {extState === "approved" ? t("cd.ext.approved") : t("cd.ext.declined")}
        </p>
      )}

      {/* Global progress */}
      <section className="rounded-card border border-line bg-white p-5 shadow-card">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-sm font-extrabold text-navy">{t("cd.jobs.overall")}</h2>
          <p className="text-xs font-extrabold text-muted">
            {t("cd.jobs.dayof", { d: job.day, tot: job.totalDays })} · {job.pct}%
          </p>
        </div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-chuna">
          <div className="h-full rounded-full bg-saffron" style={{ width: `${job.pct}%` }} />
        </div>
        <p className="mt-2 text-xs font-bold text-muted">{t("cd.jobs.samestart")}</p>
      </section>

      {/* One collapsible box per crew */}
      <div className="space-y-3">
        {job.crews.map((c) => {
          const isOpen = open.includes(c.id);
          return (
            <section key={c.id} className="rounded-card border border-line bg-white p-4 shadow-card">
              <div className="flex flex-wrap items-center gap-3">
                <CrewAvatar photo={c.photo} name={c.name} className="h-10 w-10 shrink-0 text-xs" />
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-center gap-x-2 text-sm font-extrabold text-navy">
                    {c.name}
                    <span className="inline-flex items-center gap-0.5 text-xs font-extrabold text-muted">
                      <Icon name="star" className="h-3 w-3 text-saffron" />
                      {c.rating}
                    </span>
                  </p>
                  <p className="truncate text-xs font-bold text-muted">{c.scope}</p>
                </div>
                <div className="shrink-0 text-right">
                  <p className="text-sm font-black text-navy">{inr(c.amount)}</p>
                  <p className="text-[10px] font-extrabold text-muted">
                    {t("cd.jobs.dayof", { d: c.day, tot: c.totalDays })}
                  </p>
                </div>
              </div>

              <p className="mt-2 text-xs font-bold text-muted">
                {t("cd.jobs.jobsdone", { n: c.jobsDone })} · {c.experience}
              </p>

              <div className="mt-3 flex items-center gap-2">
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-chuna">
                  <div className="h-full rounded-full bg-saffron" style={{ width: `${c.pct}%` }} />
                </div>
                <span className="shrink-0 text-[10px] font-extrabold text-muted">{c.pct}%</span>
              </div>
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                {onOpenChat && (
                  <>
                    <button
                      type="button"
                      onClick={() => onOpenChat(c.id, "chat")}
                      className="inline-flex items-center gap-1.5 rounded-control bg-saffron px-3 py-1.5 text-xs font-extrabold text-snow transition-opacity hover:opacity-90"
                    >
                      <Icon name="chat" className="h-3.5 w-3.5" />
                      {t("cd.chat.open")}
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenChat(c.id, "call")}
                      aria-label={t("cd.chat.call")}
                      className="rounded-control border border-line p-1.5 text-navy transition-colors hover:border-saffron hover:text-saffron"
                    >
                      <Icon name="phone" className="h-3.5 w-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => onOpenChat(c.id, "video")}
                      aria-label={t("cd.chat.video")}
                      className="rounded-control border border-line p-1.5 text-navy transition-colors hover:border-saffron hover:text-saffron"
                    >
                      <Icon name="video" className="h-3.5 w-3.5" />
                    </button>
                  </>
                )}
              </div>

              <button
                type="button"
                onClick={() => toggle(c.id)}
                aria-expanded={isOpen}
                className="mt-2 inline-flex items-center gap-1.5 rounded-control border border-line px-3 py-1.5 text-xs font-extrabold text-navy transition-colors hover:border-saffron hover:text-saffron"
              >
                <Icon
                  name="chevDown"
                  className={`h-3.5 w-3.5 transition-transform ${isOpen ? "rotate-180" : ""}`}
                />
                {isOpen ? t("cd.jobs.hide") : t("cd.jobs.log")}
              </button>

              {isOpen && (
                <div className="mt-3">
                  <WorkerDayLog crew={c} />
                </div>
              )}
            </section>
          );
        })}
      </div>
    </div>
  );
}