/* JobsView — accepted work with the Day 1..N timeline, customer start-OTP
   handover, daily photo/text/voice proof and customer-approval extensions.
   The card is exported so the dashboard can reuse it in compact mode. */
"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type ChangeEvent } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { completeRequest, getRequests, onRequestsChange } from "@/lib/requests";
import type { ServiceRequest } from "@/lib/requests";
import { getProviderState, onProviderStateChange, setJobProgress } from "@/lib/providerstate";
import {
  addUpdate, dayNumberOf, extensionFor, markStart, onPartnerChange,
  plannedDays, quotesFor, requestExtension, updatesFor,
} from "@/lib/partner";
import { sendMessage } from "@/lib/chats";
import { pushNotification } from "@/lib/notifications";
import type { ProviderProfile } from "@/lib/providers";

export type JobState = "booked" | "progress" | "completed";

/** Stable 4-digit fallback OTP per request — the customer reads the code out
    on site; hired jobs carry the real code from the booking flow. */
function otpFor(id: string): string {
  let sum = 7;
  for (let i = 0; i < id.length; i += 1) sum = (sum * 31 + id.charCodeAt(i)) % 9000;
  return String(sum + 1000);
}

function money(n: number): string {
  return `₹${n.toLocaleString("en-IN")}`;
}

export function jobStateOf(r: ServiceRequest, progress: Record<string, "started" | "completed">): JobState {
  if (r.status === "completed" || progress[r.id] === "completed") return "completed";
  if (progress[r.id] === "started") return "progress";
  return "booked";
}

/* ---------------- start-OTP handover ---------------- */

function StartOtpModal({ job, profile, onClose }: { job: ServiceRequest; profile: ProviderProfile; onClose: () => void }) {
  const { t } = useI18n();
  const [code, setCode] = useState("");
  const [err, setErr] = useState(false);
  const expected = job.jobOtp ?? otpFor(job.id);

  function confirm() {
    if (code.trim() !== expected) {
      setErr(true);
      return;
    }
    markStart(job.id);
    setJobProgress(job.id, "started");
    sendMessage(job.id, "provider", t("pw.chat.startedMsg"));
    pushNotification({
      kind: "system",
      audience: "customer",
      titleKey: "pw.notif.start.title",
      bodyKey: "pw.notif.start.body",
      params: { name: profile.name },
      requestId: job.id,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-raatri/70 p-4" role="dialog" aria-modal="true" aria-label={t("pw.otp.h")} onClick={onClose}>
      <div className="w-full max-w-sm rounded-sheet border border-line bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <span className="rounded-pill bg-saffron/15 px-3 py-1 text-xs font-black text-saffron">
          <Icon name="shieldCheck" className="mr-1 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("pw.otp.pill")}
        </span>
        <h3 className="mt-3 text-lg font-black text-navy">{t("pw.otp.h")}</h3>
        <p className="mt-1 text-sm font-semibold text-muted">{t("pw.otp.sub")}</p>
        <label className="mt-4 block">
          <span className="text-xs font-extrabold uppercase tracking-wider text-muted">{t("pw.otp.label")}</span>
          <input
            value={code}
            onChange={(e) => { setCode(e.target.value.replace(/\D/g, "").slice(0, 4)); setErr(false); }}
            inputMode="numeric"
            autoComplete="one-time-code"
            placeholder={t("pw.otp.ph")}
            aria-label={t("pw.otp.label")}
            className={`mt-1.5 w-full rounded-control border-2 bg-white px-4 py-3 text-center font-mono text-2xl font-black tracking-[0.4em] text-navy outline-none ${err ? "border-danger" : "border-line focus:border-saffron"}`}
          />
        </label>
        {err && <p className="mt-2 text-xs font-extrabold text-danger">{t("pw.otp.err")}</p>}
        <p className="mt-2 text-[11px] font-bold text-muted">{t("pw.otp.demo")}</p>
        <button type="button" onClick={confirm} className="mt-4 min-h-12 w-full rounded-control bg-saffron px-4 py-3 text-sm font-extrabold text-snow hover:shadow-lift">
          {t("pw.otp.go")}
        </button>
        <button type="button" onClick={onClose} className="mt-2 min-h-11 w-full rounded-control border-2 border-line px-4 py-2.5 text-sm font-extrabold text-muted hover:text-navy">
          {t("pw.otp.later")}
        </button>
      </div>
    </div>
  );
}

/* ---------------- extension request ---------------- */

const EXT_REASONS = ["pw.ext.r1", "pw.ext.r2", "pw.ext.r3", "pw.ext.r4"];

function ExtensionModal({ job, profile, onClose }: { job: ServiceRequest; profile: ProviderProfile; onClose: () => void }) {
  const { t } = useI18n();
  const [days, setDays] = useState(1);
  const [reason, setReason] = useState(EXT_REASONS[0]);

  function send() {
    requestExtension(job.id, days, reason);
    sendMessage(job.id, "provider", `${t("pw.ext.chatMsg", { n: days })} — ${t(reason)}`);
    pushNotification({
      kind: "system",
      audience: "customer",
      titleKey: "pw.notif.ext.title",
      bodyKey: "pw.notif.ext.body",
      params: { name: profile.name, n: days, reason: t(reason) },
      requestId: job.id,
    });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-raatri/70 p-4" role="dialog" aria-modal="true" aria-label={t("pw.ext.h")} onClick={onClose}>
      <div className="w-full max-w-sm rounded-sheet border border-line bg-white p-6 shadow-lift" onClick={(e) => e.stopPropagation()}>
        <span className="rounded-pill bg-haldi/20 px-3 py-1 text-xs font-black text-navy">
          <Icon name="clock" className="mr-1 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("pw.ext.pill")}
        </span>
        <h3 className="mt-3 text-lg font-black text-navy">{t("pw.ext.h")}</h3>
        <p className="mt-1 text-sm font-semibold text-muted">{t("pw.ext.sub")}</p>
        <label className="mt-4 block">
          <span className="text-xs font-extrabold uppercase tracking-wider text-muted">{t("pw.ext.days")}</span>
          <select value={days} onChange={(e) => setDays(Number(e.target.value))} className="mt-1.5 w-full rounded-control border-2 border-line bg-white px-3 py-2.5 text-sm font-bold text-navy outline-none focus:border-saffron" aria-label={t("pw.ext.days")}>
            {[1, 2, 3].map((d) => <option key={d} value={d}>{d}</option>)}
          </select>
        </label>
        <label className="mt-3 block">
          <span className="text-xs font-extrabold uppercase tracking-wider text-muted">{t("pw.ext.reason")}</span>
          <select value={reason} onChange={(e) => setReason(e.target.value)} className="mt-1.5 w-full rounded-control border-2 border-line bg-white px-3 py-2.5 text-sm font-bold text-navy outline-none focus:border-saffron" aria-label={t("pw.ext.reason")}>
            {EXT_REASONS.map((k) => <option key={k} value={k}>{t(k)}</option>)}
          </select>
        </label>
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={send} className="min-h-12 flex-1 rounded-control bg-saffron px-4 py-3 text-sm font-extrabold text-snow hover:shadow-lift">
            {t("pw.ext.go")}
          </button>
          <button type="button" onClick={onClose} className="min-h-12 rounded-control border-2 border-line px-4 py-3 text-sm font-extrabold text-muted hover:text-navy">
            {t("pw.ext.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- daily update composer ---------------- */

function UpdateComposer({ job, profile, onDone }: { job: ServiceRequest; profile: ProviderProfile; onDone: () => void }) {
  const { t } = useI18n();
  const photoRef = useRef<HTMLInputElement>(null);
  const voiceRef = useRef<HTMLInputElement>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [voice, setVoice] = useState("");
  const [text, setText] = useState("");
  const [err, setErr] = useState(false);

  function readFiles(files: FileList | null | undefined, into: (urls: string[]) => void) {
    const list = Array.from(files ?? []);
    if (list.length === 0) return;
    let done = 0;
    const urls: string[] = [];
    list.forEach((f, i) => {
      const reader = new FileReader();
      reader.onload = () => {
        urls[i] = String(reader.result);
        done += 1;
        if (done === list.length) into(urls.filter(Boolean));
      };
      reader.readAsDataURL(f);
    });
  }

  function post() {
    if (!text.trim() && photos.length === 0 && !voice) {
      setErr(true);
      return;
    }
    addUpdate(job.id, { text: text.trim(), photos, voice: voice || undefined });
    sendMessage(job.id, "provider", text.trim() || t("pw.upd.photoOnly"));
    pushNotification({
      kind: "system",
      audience: "customer",
      titleKey: "pw.notif.update.title",
      bodyKey: "pw.notif.update.body",
      params: { name: profile.name, text: text.trim() || t("pw.upd.photoOnly") },
      requestId: job.id,
    });
    onDone();
  }

  return (
    <div className="mt-4 rounded-control border-2 border-dashed border-line bg-chuna p-4">
      <h5 className="text-xs font-black uppercase tracking-wider text-navy">{t("pw.upd.h")}</h5>

      <div className="mt-3 flex flex-wrap gap-2">
        {photos.map((src, i) => (
          <span key={src.slice(-24) + String(i)} className="relative">
            {/* eslint-disable-next-line @next/next/no-img-element -- user upload, data URL */}
            <img src={src} alt="" className="h-16 w-16 rounded-control border border-line object-cover" />
            <button
              type="button"
              aria-label={t("pw.upd.remove")}
              onClick={() => setPhotos(photos.filter((_, j) => j !== i))}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-pill bg-navy text-snow"
            >
              <Icon name="close" className="h-3 w-3" />
            </button>
          </span>
        ))}
        <button
          type="button"
          onClick={() => photoRef.current?.click()}
          aria-label={t("pw.upd.photo")}
          className="flex h-16 w-16 items-center justify-center rounded-control border-2 border-dashed border-line bg-white text-muted transition-colors hover:border-saffron hover:text-saffron"
        >
          <Icon name="plus" className="h-5 w-5" />
        </button>
        <input ref={photoRef} type="file" accept="image/*" multiple className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => readFiles(e.target.files, (u) => setPhotos((p) => [...p, ...u]))} />
      </div>

      <textarea
        value={text}
        onChange={(e) => { setText(e.target.value); setErr(false); }}
        rows={2}
        placeholder={t("pw.upd.text")}
        aria-label={t("pw.upd.text")}
        className="mt-3 w-full rounded-control border-2 border-line bg-white px-3 py-2.5 text-sm font-semibold text-navy outline-none focus:border-saffron"
      />

      <div className="mt-2 flex flex-wrap items-center gap-2">
        <button type="button" onClick={() => voiceRef.current?.click()} className="min-h-10 rounded-control border-2 border-line bg-white px-3 py-2 text-xs font-extrabold text-muted hover:border-saffron hover:text-saffron">
          <Icon name="mic" className="mr-1 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("pw.upd.voice")}
        </button>
        <input ref={voiceRef} type="file" accept="audio/*" className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => readFiles(e.target.files, (u) => setVoice(u[0] ?? ""))} />
        {voice && (
          <span className="flex items-center gap-2 rounded-pill bg-ink/10 px-3 py-1 text-xs font-extrabold text-ink">
            <Icon name="mic" className="h-3.5 w-3.5" />{t("pw.upd.voiceOn")}
            <button type="button" aria-label={t("pw.upd.remove")} onClick={() => setVoice("")} className="text-muted hover:text-danger"><Icon name="close" className="h-3.5 w-3.5" /></button>
          </span>
        )}
      </div>
      {err && <p className="mt-2 text-xs font-extrabold text-danger">{t("pw.upd.empty")}</p>}

      <div className="mt-3 flex gap-2">
        <button type="button" onClick={post} className="min-h-11 flex-1 rounded-control bg-saffron px-4 py-2.5 text-sm font-extrabold text-snow hover:shadow-lift">
          <Icon name="send" className="mr-1.5 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("pw.upd.send")}
        </button>
        <button type="button" onClick={onDone} className="min-h-11 rounded-control border-2 border-line px-4 py-2.5 text-sm font-extrabold text-muted hover:text-navy">
          {t("pw.upd.cancel")}
        </button>
      </div>
    </div>
  );
}

/* ---------------- job card ---------------- */

export function JobCard({
  job, state, profile, compact = false, onMessage, onStart, onComplete, onToast,
}: {
  job: ServiceRequest;
  state: JobState;
  profile: ProviderProfile;
  compact?: boolean;
  onMessage: (requestId: string) => void;
  onStart: (job: ServiceRequest) => void;
  onComplete: (job: ServiceRequest) => void;
  onToast: (msg: string) => void;
}) {
  const { t } = useI18n();
  const [extOpen, setExtOpen] = useState(false);
  const [composer, setComposer] = useState(false);
  const [record, setRecord] = useState(false);
  const total = useMemo(() => plannedDays(job.id), [job.id]);
  const day = dayNumberOf(job.id, total, state === "completed");
  const pct = state === "completed" ? 100 : Math.round((day / total) * 100);
  const quote = useMemo(() => { const q = quotesFor(job.id); return q[q.length - 1]; }, [job.id]);
  const ext = extensionFor(job.id);
  const updates = updatesFor(job.id);
  const amount = job.quoteTotal ?? (quote ? quote.labour + quote.material : 0);

  const statePill =
    state === "completed" ? "bg-ink/15 text-ink" :
    state === "progress" ? "bg-saffron/15 text-saffron" :
    "bg-chuna text-muted";
  const stateLabel =
    state === "completed" ? t("pw.st.done") : state === "progress" ? t("pw.st.prog") : t("pw.st.booked");

  return (
    <article className="rounded-card border border-line bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 items-start gap-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-pill text-sm font-black text-snow" style={{ background: "linear-gradient(135deg,#E00048,#A80036)" }}>
            {job.customer.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase()}
          </span>
          <div className="min-w-0">
            <h3 className="font-extrabold text-navy">{t(`sk.${job.category}`)} · {job.customer}</h3>
            <p className="mt-0.5 text-xs font-semibold text-muted">
              <Icon name="mapPin" className="mr-1 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{job.zone}, {job.city}
            </p>
            <div className="mt-1.5 flex flex-wrap gap-1.5">
              <span className={`rounded-pill px-2.5 py-0.5 text-[11px] font-black ${statePill}`}>
                <span className={`mr-1.5 inline-block h-1.5 w-1.5 rounded-full align-middle ${state === "progress" ? "bg-saffron" : state === "completed" ? "bg-ink" : "bg-muted"}`} />
                {stateLabel}
              </span>
              <span className="rounded-pill bg-chuna px-2.5 py-0.5 text-[11px] font-extrabold text-muted">
                <Icon name="calendar" className="mr-1 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />
                {job.dateBooked ?? job.date ?? t("pd.anyDate")} · {t(`slot.${job.slotBooked ?? job.slot}`)}
              </span>
            </div>
          </div>
        </div>
        {amount > 0 && (
          <div className="text-right">
            <p className="text-lg font-black tabular-nums text-navy">{money(amount)}</p>
            <p className="text-[11px] font-bold text-muted">{t("pw.jobTotal")}</p>
          </div>
        )}
      </div>

      {state !== "booked" && (
        <div className="mt-4">
          <div className="flex items-center justify-between text-xs font-extrabold text-muted">
            <span>{t("pw.progress")} <b className="text-navy">{t("pw.days", { d: day, t: total })}</b></span>
            <span className="tabular-nums text-navy">{pct}%</span>
          </div>
          <div className="mt-1.5 h-2 overflow-hidden rounded-pill bg-chuna">
            <div className="h-full rounded-pill bg-saffron transition-all duration-500" style={{ width: `${pct}%` }} />
          </div>
          <ol className="mt-2.5 flex flex-wrap gap-1.5" aria-label={t("pw.progress")}>
            {Array.from({ length: total }, (_, i) => {
              const done = i < day - (state === "completed" ? 0 : 1) || state === "completed";
              const now2 = !done && i === day - 1 && state === "progress";
              return (
                <li
                  key={i}
                  className={`flex items-center gap-1 rounded-pill px-2.5 py-1 text-[11px] font-black ${
                    done ? "bg-ink text-snow" : now2 ? "bg-saffron text-snow" : "bg-chuna text-muted"
                  }`}
                >
                  {done ? <Icon name="check" className="h-3 w-3" /> : i + 1}
                  {t("pw.day", { n: i + 1 })}
                </li>
              );
            })}
          </ol>
        </div>
      )}

      {ext && (
        <p className="mt-3 rounded-control bg-haldi/15 px-3 py-2 text-xs font-extrabold text-navy">
          <Icon name="clock" className="mr-1.5 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />
          {ext.status === "pending" ? t("pw.ext.pending", { n: ext.days }) : t("pw.ext.approved", { n: ext.days })}
        </p>
      )}

      {updates.length > 0 && (
        <p className="mt-3 rounded-control bg-chuna px-3 py-2 text-xs font-bold text-muted">
          <Icon name="camera" className="mr-1.5 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />
          {t("pw.upd.count", { n: updates.length })}
          {updates[updates.length - 1].text ? ` · ${t("pw.upd.latest", { text: updates[updates.length - 1].text })}` : ""}
        </p>
      )}

      {!compact && (
        <>
          <div className="mt-4 flex flex-wrap gap-2">
            <button type="button" onClick={() => onMessage(job.id)} className="min-h-11 rounded-control border-2 border-line px-3 py-2.5 text-xs font-extrabold text-navy hover:border-saffron hover:text-saffron">
              <Icon name="chat" className="mr-1.5 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("pw.msg")}
            </button>
            {state === "booked" && (
              <button type="button" onClick={() => onStart(job)} className="min-h-11 rounded-control bg-saffron px-3 py-2.5 text-xs font-extrabold text-snow hover:shadow-lift">
                <Icon name="play" className="mr-1.5 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("pw.start")}
              </button>
            )}
            {state === "progress" && (
              <>
                <button type="button" onClick={() => setComposer((v) => !v)} className="min-h-11 rounded-control bg-saffron px-3 py-2.5 text-xs font-extrabold text-snow hover:shadow-lift">
                  <Icon name="camera" className="mr-1.5 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("pw.update")}
                </button>
                <button type="button" onClick={() => onComplete(job)} className="min-h-11 rounded-control bg-ink px-3 py-2.5 text-xs font-extrabold text-snow hover:opacity-90">
                  <Icon name="check" className="mr-1.5 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("pd.complete")}
                </button>
                <button type="button" onClick={() => setExtOpen(true)} className="min-h-11 rounded-control border-2 border-line px-3 py-2.5 text-xs font-extrabold text-muted hover:border-saffron hover:text-saffron">
                  <Icon name="clock" className="mr-1.5 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("pw.extra")}
                </button>
              </>
            )}
            {state === "completed" && (
              <button type="button" onClick={() => setRecord((v) => !v)} className="min-h-11 rounded-control border-2 border-line px-3 py-2.5 text-xs font-extrabold text-muted hover:border-saffron hover:text-saffron">
                <Icon name="receipt" className="mr-1.5 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("pw.record")}
              </button>
            )}
          </div>

          {record && state === "completed" && (
            <div className="mt-4 rounded-control border border-line bg-chuna p-4">
              <p className="text-xs font-black uppercase tracking-wider text-navy">{t("pw.rec.h")}</p>
              <dl className="mt-2 space-y-1 text-xs font-bold text-muted">
                <div className="flex justify-between"><dt>{t("pw.rec.total")}</dt><dd className="tabular-nums text-navy">{amount > 0 ? money(amount) : "—"}</dd></div>
                <div className="flex justify-between"><dt>{t("pw.rec.advance")}</dt><dd className="tabular-nums text-navy">{job.advancePaid ? money(job.advancePaid) : "—"}</dd></div>
                {job.rating ? (
                  <div className="flex justify-between"><dt>{t("pw.rec.rating")}</dt><dd className="text-saffron">{"★".repeat(job.rating)}</dd></div>
                ) : null}
              </dl>
              <p className="mt-2 text-[11px] font-bold text-muted">{t("pw.rec.demo")}</p>
            </div>
          )}

          {composer && state === "progress" && (
            <UpdateComposer job={job} profile={profile} onDone={() => { setComposer(false); onToast(t("pw.upd.posted")); }} />
          )}
        </>
      )}

      {extOpen && <ExtensionModal job={job} profile={profile} onClose={() => setExtOpen(false)} />}
    </article>
  );
}

/* ---------------- the view ---------------- */

type Filter = "all" | "progress" | "booked" | "completed";

export function JobsView({ profile, onMessage, onToast }: { profile: ProviderProfile; onMessage: (requestId: string) => void; onToast: (msg: string) => void }) {
  const { t } = useI18n();
  const [jobs, setJobs] = useState<ServiceRequest[]>([]);
  const [progress, setProgress] = useState<Record<string, "started" | "completed">>({});
  const [otpJob, setOtpJob] = useState<ServiceRequest | null>(null);
  const [filter, setFilter] = useState<Filter>("all");

  const reload = useCallback(() => {
    setJobs(
      getRequests().filter(
        (r) => r.acceptedBy === profile.id && (r.status === "interested" || r.status === "accepted" || r.status === "completed"),
      ),
    );
    setProgress(getProviderState().jobProgress ?? {});
  }, [profile.id]);

  useEffect(() => {
    reload();
    const offReq = onRequestsChange(reload);
    const offState = onProviderStateChange(reload);
    const offPartner = onPartnerChange(reload);
    return () => { offReq(); offState(); offPartner(); };
  }, [reload]);

  function complete(job: ServiceRequest) {
    setJobProgress(job.id, "completed");
    completeRequest(job.id);
    pushNotification({
      kind: "system",
      audience: "customer",
      titleKey: "notif.completed.title",
      bodyKey: "notif.completed.body",
      params: { name: profile.name },
      requestId: job.id,
    });
    onToast(t("pw.jobs.doneToast"));
  }

  const withState = jobs.map((j) => ({ j, s: jobStateOf(j, progress) }));
  const counts = {
    all: withState.length,
    progress: withState.filter((x) => x.s === "progress").length,
    booked: withState.filter((x) => x.s === "booked").length,
    completed: withState.filter((x) => x.s === "completed").length,
  };
  const shown = withState.filter((x) => filter === "all" || x.s === filter);
  const FILTERS: { id: Filter; label: string }[] = [
    { id: "all", label: `${t("pw.f.all")} ${counts.all}` },
    { id: "progress", label: `${t("pw.f.prog")} ${counts.progress}` },
    { id: "booked", label: `${t("pw.f.up")} ${counts.booked}` },
    { id: "completed", label: `${t("pw.f.done")} ${counts.completed}` },
  ];

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("pw.jobs.eyebrow")}</p>
      <h2 className="mt-1 text-2xl font-black tracking-[-0.02em] text-navy">{t("pw.jobs.h")}</h2>
      <p className="mt-1 text-sm font-bold text-muted">{t("pw.jobs.sub")}</p>

      <div className="mt-4 flex flex-wrap gap-1.5 rounded-control bg-chuna p-1" role="tablist" aria-label={t("pw.jobs.h")}>
        {FILTERS.map((f) => (
          <button
            key={f.id}
            type="button"
            role="tab"
            aria-selected={filter === f.id}
            onClick={() => setFilter(f.id)}
            className={`min-h-10 flex-1 rounded-control px-3 py-2 text-xs font-extrabold transition-colors ${filter === f.id ? "bg-saffron text-snow" : "text-muted hover:text-navy"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4">
        {shown.length === 0 ? (
          <div className="rounded-card border-2 border-dashed border-line bg-white p-6 text-center">
            <Icon name="toolbox" className="mx-auto h-8 w-8 text-saffron" />
            <p className="mt-2 font-extrabold text-navy">{t("pd.noJob")}</p>
          </div>
        ) : (
          shown.map(({ j, s }) => (
            <JobCard
              key={j.id}
              job={j}
              state={s}
              profile={profile}
              onMessage={onMessage}
              onStart={setOtpJob}
              onComplete={complete}
              onToast={onToast}
            />
          ))
        )}
      </div>

      {otpJob && <StartOtpModal job={otpJob} profile={profile} onClose={() => { setOtpJob(null); reload(); }} />}
    </div>
  );
}