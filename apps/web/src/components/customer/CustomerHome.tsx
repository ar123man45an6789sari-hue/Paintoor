/* CustomerHome — the customer's front door: personal hero with live job
   pills, four honest stat cards, a "needs your attention" queue derived
   from escrow / extension / voice-note state, the running job with its
   crews, an escrow protection strip, the retention-window activity feed
   and quick actions. Every number comes from the demo stores (lib/jobs,
   lib/escrow, lib/history) — nothing is staged for show. */
"use client";

import { useEffect, useRef, useState, type ChangeEvent } from "react";
import { useI18n } from "@/i18n";
import { Icon, type IconName } from "@/components/Icons";
import type { Session } from "@/lib/session";
import { SEED_JOB, SEED_EXTENSION, inr } from "@/lib/jobs";
import { SEED_ESCROW, heldOf } from "@/lib/escrow";
import { HISTORY_SEED, withinRetention, type HistoryKind } from "@/lib/history";
import { initialsOf, useProfile } from "@/lib/profile";
import type { ViewId } from "./CustomerWorkspace";

const GRAD = "linear-gradient(135deg,#E00048,#A80036)";

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

/** Spec greeting windows: night / morning / afternoon / evening / night. */
function greetingKey(d: Date): string {
  const h = d.getHours();
  if (h < 5) return "cd.greet.night";
  if (h < 12) return "cd.greet.morning";
  if (h < 17) return "cd.greet.afternoon";
  if (h < 21) return "cd.greet.evening";
  return "cd.greet.night";
}

function StatCard({ icon, value, label, sub }: { icon: IconName; value: string; label: string; sub: string }) {
  return (
    <article className="rounded-card border border-line bg-white p-4 shadow-card">
      <span className="flex h-9 w-9 items-center justify-center rounded-control bg-saffron/10 text-saffron">
        <Icon name={icon} className="h-[18px] w-[18px]" />
      </span>
      <p className="mt-2.5 text-2xl font-black tabular-nums text-navy">{value}</p>
      <p className="text-xs font-bold text-muted">{label}</p>
      <p className="mt-1 text-[11px] font-extrabold text-saffron">{sub}</p>
    </article>
  );
}

export function CustomerHome({
  session,
  go,
  onProfile,
}: {
  session: Session;
  go: (v: ViewId) => void;
  onProfile: () => void;
}) {
  const { lang, t } = useI18n();
  const [profile, setProfile] = useProfile();
  const fileRef = useRef<HTMLInputElement>(null);

  /* Same data-URL route as the profile drawer: the photo lives in the shared
     profile store, so a change here appears everywhere at once. */
  const onPick = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setProfile((p) => ({ ...p, photo: String(reader.result) }));
    reader.readAsDataURL(f);
    e.target.value = "";
  };

  /* Null until the client mounts so server and client first renders match;
     refreshed every minute afterwards. */
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const locale = lang === "hi" ? "hi-IN" : lang === "gu" ? "gu-IN" : "en-IN";
  const first = (session.name || "").split(" ")[0] || t("dash.friend");

  /* Live derivations — the attention queue and stats read real state. */
  const held = SEED_ESCROW.milestones.find((m) => m.state === "held");
  const ext = SEED_EXTENSION.state === "open" ? SEED_EXTENSION : null;
  const voiceCrew = [...SEED_JOB.crews].reverse().find((c) => c.days.some((d) => d.voice));
  const days = SEED_JOB.crews.flatMap((c) => c.days);
  const updates = days.filter((d) => d.note !== "").length;
  const photos = days.flatMap((d) => d.shots).length;
  const activity = HISTORY_SEED.filter((e) => withinRetention(e)).slice(0, 5);

  const attention: { icon: IconName; title: string; sub: string; btn: string; view: ViewId }[] = [];
  if (held) {
    attention.push({
      icon: "lock",
      title: t("cd.home.attRel"),
      sub: t("cd.home.attRelSub", { n: inr(held.amount), p: SEED_JOB.pct }),
      btn: t("cd.home.attRelBtn"),
      view: "escrow",
    });
  }
  if (ext) {
    attention.push({
      icon: "clock",
      title: t("cd.home.attExt", { n: ext.extraDays }),
      sub: t("cd.home.attExtSub", { name: ext.crewName, n: ext.extraDays }),
      btn: t("cd.home.attExtBtn"),
      view: "jobs",
    });
  }
  if (voiceCrew) {
    attention.push({
      icon: "mic",
      title: t("cd.home.attVoice", { name: voiceCrew.name }),
      sub: t("cd.home.attVoiceSub", { name: voiceCrew.name }),
      btn: t("cd.home.attVoiceBtn"),
      view: "chat",
    });
  }

  const ghostBtn =
    "min-h-10 rounded-control border-2 border-line px-3 py-2 text-xs font-extrabold text-navy hover:border-saffron hover:text-saffron";

  return (
    <div className="space-y-5">
      {/* Hero: global cover (set by Paintoor) + customer-controlled avatar */}
      <section className="relative overflow-hidden rounded-sheet border border-line shadow-card">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(224,0,72,0.94), rgba(168,0,54,0.90)), url('/jobs/cover-default.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative p-6 text-snow md:p-8">
          <div className="flex flex-wrap items-center gap-5">
            <span className="relative inline-block shrink-0">
              <button
                type="button"
                onClick={onProfile}
                aria-label={t("cd.drawer.open")}
                className="h-[84px] w-[84px] overflow-hidden rounded-pill border-4 border-snow/70 shadow-card transition-transform hover:scale-[1.03] md:h-[96px] md:w-[96px]"
                style={{ background: GRAD }}
              >
                {profile.photo ? (
                  /* eslint-disable-next-line @next/next/no-img-element -- user upload, data URL */
                  <img src={profile.photo} alt={profile.name} className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center text-3xl font-black text-snow">
                    {initialsOf(profile.name)}
                  </span>
                )}
              </button>
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                aria-label={t("cd.photo.change")}
                className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-pill bg-saffron shadow-card transition-transform hover:scale-110"
              >
                <Icon name="camera" className="h-4 w-4 text-snow" />
              </button>
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={onPick} />
              <span className="absolute -bottom-0.5 left-1 h-3.5 w-3.5 rounded-pill border-2 border-snow bg-[#0E9F6E]" aria-hidden="true" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-snow/85">
                {now ? `${t(greetingKey(now))}, ${first}` : "\u00A0"}
              </p>
              <h1 className="mt-1 text-2xl font-black tracking-[-0.02em] md:text-3xl">
                {t("cd.home.h1", { name: first, n: SEED_JOB.crews.length })}
              </h1>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="flex items-center gap-1.5 rounded-pill bg-snow/15 px-3 py-1 text-[11px] font-extrabold">
                  <Icon name="mapPin" className="h-3.5 w-3.5" />
                  {SEED_JOB.addressLabel.split(",").slice(-1)[0].trim()} · {SEED_JOB.city}
                </span>
                <span className="flex items-center gap-1.5 rounded-pill bg-snow/15 px-3 py-1 text-[11px] font-extrabold">
                  <Icon name="clock" className="h-3.5 w-3.5" />
                  {t("cd.home.pillDay", { d: SEED_JOB.day, t: SEED_JOB.totalDays })}
                </span>
                <span className="flex items-center gap-1.5 rounded-pill bg-snow/15 px-3 py-1 text-[11px] font-extrabold">
                  <Icon name="users" className="h-3.5 w-3.5" />
                  {t("cd.home.pillCrews", { n: SEED_JOB.crews.length })}
                </span>
                <span className="flex items-center gap-1.5 rounded-pill bg-snow/15 px-3 py-1 text-[11px] font-extrabold">
                  <Icon name="lock" className="h-3.5 w-3.5" />
                  {t("cd.home.pillProtected", { n: inr(heldOf(SEED_ESCROW)) })}
                </span>
              </div>
            </div>
            <div className="flex w-full flex-wrap gap-2 sm:w-auto sm:flex-col">
              <button
                type="button"
                onClick={() => go("jobs")}
                className="min-h-11 flex-1 rounded-control bg-snow px-4 py-2.5 text-sm font-extrabold text-saffron transition-transform hover:scale-[1.02] sm:flex-none"
              >
                <Icon name="trend" className="mr-1.5 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />
                {t("cd.home.track")}
              </button>
              <button
                type="button"
                onClick={() => go("chat")}
                className="min-h-11 flex-1 rounded-control border-2 border-snow/60 px-4 py-2.5 text-sm font-extrabold text-snow transition-colors hover:bg-snow/10 sm:flex-none"
              >
                <Icon name="chat" className="mr-1.5 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />
                {t("cd.home.msg")}
              </button>
            </div>
          </div>
        </div>
        <span className="absolute bottom-2 right-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-snow/70">
          {t("cd.hero.cover")}
        </span>
      </section>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard icon="users" value={String(SEED_JOB.crews.length)} label={t("cd.home.statCrews")} sub={t("cd.home.statCrewsSub")} />
        <StatCard icon="wallet" value={inr(heldOf(SEED_ESCROW))} label={t("cd.home.statEscrow")} sub={t("cd.home.statEscrowSub")} />
        <StatCard icon="trend" value={`${SEED_JOB.pct}%`} label={t("cd.home.statProg")} sub={t("cd.home.statProgSub", { d: SEED_JOB.day, t: SEED_JOB.totalDays })} />
        <StatCard icon="camera" value={String(updates)} label={t("cd.home.statUpd")} sub={t("cd.home.statUpdSub", { n: photos })} />
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        {/* Needs your attention */}
        <section className="rounded-card border border-line bg-white p-5 shadow-card">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("cd.home.attEye")}</p>
              <h2 className="mt-0.5 text-xl font-black text-navy">{t("cd.home.att")}</h2>
            </div>
            {attention.length > 0 && (
              <span className="rounded-pill bg-saffron/15 px-2.5 py-0.5 text-[11px] font-black text-saffron">{attention.length}</span>
            )}
          </div>
          {attention.length === 0 ? (
            <div className="mt-4 flex items-center gap-3 rounded-control bg-chuna p-4">
              <Icon name="checkCircle" className="h-5 w-5 shrink-0 text-[#0E9F6E]" />
              <span className="min-w-0">
                <b className="block text-sm font-extrabold text-navy">{t("cd.home.attClear")}</b>
                <span className="block text-xs font-semibold text-muted">{t("cd.home.attClearSub")}</span>
              </span>
            </div>
          ) : (
            <ul className="mt-4 divide-y divide-line">
              {attention.map((a) => (
                <li key={a.title} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-saffron/10 text-saffron">
                    <Icon name={a.icon} className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-sm font-extrabold text-navy">{a.title}</b>
                    <span className="block truncate text-xs font-semibold text-muted">{a.sub}</span>
                  </span>
                  <button type="button" onClick={() => go(a.view)} className="min-h-10 shrink-0 rounded-control bg-saffron px-3.5 py-2 text-xs font-extrabold text-snow hover:shadow-lift">
                    {a.btn}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* Job in motion */}
        <section className="rounded-card border border-line bg-white p-5 shadow-card">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("cd.home.motionEye")}</p>
              <h2 className="mt-0.5 text-xl font-black text-navy">{t("cd.home.motion")}</h2>
            </div>
            <button type="button" onClick={() => go("jobs")} className={ghostBtn}>
              {t("cd.home.track")} <Icon name="arrowRight" className="ml-1 inline h-3.5 w-3.5" />
            </button>
          </div>
          <p className="mt-3 text-sm font-extrabold text-navy">{SEED_JOB.title}</p>
          <p className="text-xs font-semibold text-muted">{t("cd.home.motionSub", { title: SEED_JOB.addressLabel, addr: SEED_JOB.id })}</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="h-2 flex-1 overflow-hidden rounded-pill bg-chuna">
              <div className="h-full rounded-pill bg-saffron transition-all duration-500" style={{ width: `${SEED_JOB.pct}%` }} />
            </div>
            <span className="text-xs font-black tabular-nums text-navy">{SEED_JOB.pct}%</span>
            <span className="rounded-pill bg-saffron/15 px-2.5 py-0.5 text-[11px] font-black text-saffron">
              {t("cd.home.pillDay", { d: SEED_JOB.day, t: SEED_JOB.totalDays })}
            </span>
          </div>
          <ul className="mt-4 space-y-2.5">
            {SEED_JOB.crews.map((c) => (
              <li key={c.id} className="flex items-center gap-3">
                <span
                  className="h-9 w-9 shrink-0 rounded-pill bg-cover bg-center shadow-card"
                  style={{ backgroundImage: `url(${c.photo})` }}
                  aria-hidden="true"
                />
                <span className="min-w-0 flex-1">
                  <b className="block truncate text-xs font-extrabold text-navy">{c.name}</b>
                  <span className="block truncate text-[11px] font-semibold text-muted">{c.scope}</span>
                </span>
                <span className="w-24 shrink-0">
                  <span className="block h-1.5 overflow-hidden rounded-pill bg-chuna">
                    <span className="block h-full rounded-pill bg-saffron" style={{ width: `${c.pct}%` }} />
                  </span>
                  <span className="mt-0.5 block text-right text-[10px] font-black tabular-nums text-muted">{c.pct}%</span>
                </span>
              </li>
            ))}
          </ul>
        </section>
      </div>

      {/* Escrow protection strip */}
      <section className="overflow-hidden rounded-card shadow-card" style={{ background: GRAD }}>
        <div className="flex flex-wrap items-center gap-5 p-5 text-snow md:p-6">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-snow/75">{t("cd.home.esc")}</p>
            <p className="mt-1 text-3xl font-black tabular-nums">{inr(heldOf(SEED_ESCROW))}</p>
            <p className="mt-1 text-xs font-bold text-snow/80">{t("cd.esc.of", { n: inr(SEED_ESCROW.total), id: SEED_ESCROW.jobId })}</p>
          </div>
          <ul className="flex flex-1 flex-col gap-2">
            {SEED_ESCROW.milestones.map((m) => (
              <li key={m.id} className="flex items-center justify-between gap-3 rounded-control bg-snow/10 px-3 py-2">
                <span className="min-w-0 truncate text-xs font-extrabold">
                  {t(m.key)} · {m.pct}%
                </span>
                <span className="flex shrink-0 items-center gap-2">
                  <b className="text-xs font-black tabular-nums">{inr(m.amount)}</b>
                  <span
                    className={`rounded-pill px-2 py-0.5 text-[10px] font-black ${
                      m.state === "released" ? "bg-[#0E9F6E] text-snow" : m.state === "held" ? "bg-saffron text-snow" : "bg-snow/20 text-snow"
                    }`}
                  >
                    {m.state === "released" ? t("cd.esc.released") : m.state === "held" ? t("cd.esc.heldpill") : t("cd.esc.pending")}
                  </span>
                </span>
              </li>
            ))}
          </ul>
          <button
            type="button"
            onClick={() => go("escrow")}
            className="min-h-11 rounded-control bg-snow px-4 py-2.5 text-sm font-extrabold text-saffron transition-transform hover:scale-[1.02]"
          >
            <Icon name="lock" className="mr-1.5 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />
            {t("cd.set.openesc")}
          </button>
        </div>
      </section>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        {/* Recent activity */}
        <section className="rounded-card border border-line bg-white p-5 shadow-card">
          <div className="flex items-end justify-between gap-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("cd.home.actEye")}</p>
              <h2 className="mt-0.5 text-xl font-black text-navy">{t("cd.home.act")}</h2>
            </div>
            <button type="button" onClick={() => go("hist")} className={ghostBtn}>
              {t("cd.nav.hist")} <Icon name="arrowRight" className="ml-1 inline h-3.5 w-3.5" />
            </button>
          </div>
          <ol className="mt-4 space-y-3.5">
            {activity.map((e) => (
              <li key={e.id} className="flex items-start gap-3">
                <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-saffron/10 text-saffron">
                  <Icon name={KIND_ICON[e.kind]} className="h-3.5 w-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-bold leading-snug text-navy">{e.text}</span>
                  <span className="mt-0.5 block text-[11px] font-extrabold text-muted">
                    {new Date(`${e.at}T00:00:00`).toLocaleDateString(locale, { day: "numeric", month: "short" })}
                    {" · "}
                    <span className="rounded-pill bg-chuna px-1.5 py-0.5 text-navy">{e.jobId}</span>
                  </span>
                </span>
              </li>
            ))}
          </ol>
        </section>

        {/* Quick actions */}
        <section className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("cd.home.qaEye")}</p>
          <h2 className="mt-0.5 text-xl font-black text-navy">{t("cd.home.qa")}</h2>
          <div className="mt-4 grid grid-cols-2 gap-3">
            {([
              { v: "post", icon: "plus", label: "dash.tab.post" },
              { v: "find", icon: "search", label: "dash.tab.find" },
              { v: "store", icon: "store", label: "cd.nav.store" },
              { v: "docs", icon: "doc", label: "cd.nav.docs" },
            ] as { v: ViewId; icon: IconName; label: string }[]).map((q) => (
              <button
                key={q.v}
                type="button"
                onClick={() => go(q.v)}
                className="flex min-h-24 flex-col items-center justify-center gap-2 rounded-control border-2 border-line bg-chuna p-3 text-xs font-extrabold text-navy transition-colors hover:border-saffron hover:text-saffron"
              >
                <Icon name={q.icon} className="h-6 w-6 text-saffron" />
                {t(q.label)}
              </button>
            ))}
          </div>
          <p className="mt-4 flex items-start gap-1.5 rounded-control bg-chuna px-3 py-2 text-[11px] font-bold text-muted">
            <Icon name="shield" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-saffron" />
            {t("cd.home.qaNote")}
          </p>
        </section>
      </div>
    </div>
  );
}