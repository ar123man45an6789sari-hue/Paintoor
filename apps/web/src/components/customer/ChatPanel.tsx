/* Chat — two-pane crew messaging for the live job.

   Left: one thread per crew (avatar, name, last-message preview).
   Right: the window — photo / voice / text bubbles, WhatsApp-style
   delivery ticks on own messages (sent -> delivered, on demo timers),
   canned crew replies, and voice + video call overlays (UI only, the
   timer runs locally; no signalling in the demo phase).

   Mobile: the pane switches — thread list first, window after a tap. */
"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { SEED_JOB } from "@/lib/jobs";
import { initialsOf, readPhotoFile } from "@/lib/profile";
import { VoiceNote } from "@/components/customer/WorkerDayLog";
import {
  crewReply,
  ensureSeeded,
  getMsgs,
  onDashChatChange,
  sendMsg,
  setTick,
  type DashMsg,
} from "@/lib/dashChat";

const GRAD = "linear-gradient(135deg,#E00048,#A80036)";

function hhmm(at: number): string {
  const d = new Date(at);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function Avatar({ photo, name, className }: { photo: string; name: string; className: string }) {
  const [failed, setFailed] = useState(false);
  if (!photo || failed) {
    return (
      <span
        className={`flex shrink-0 items-center justify-center rounded-pill font-black text-snow ${className}`}
        style={{ background: GRAD }}
        aria-hidden="true"
      >
        {initialsOf(name)}
      </span>
    );
  }
  return (
    /* eslint-disable-next-line @next/next/no-img-element -- crew headshots, no optimisation pass yet */
    <img src={photo} alt={name} onError={() => setFailed(true)} className={`${className} shrink-0 rounded-pill object-cover`} />
  );
}

/** Sent -> delivered ticks, driven by demo timers. */
function Ticks({ tick }: { tick: 0 | 1 | 2 }) {
  if (tick === 0) return <Icon name="clock" className="h-3 w-3 text-muted" />;
  if (tick === 1) return <Icon name="check" className="h-3 w-3 text-muted" />;
  return (
    <span className="relative inline-block h-3 w-4" aria-hidden="true">
      <Icon name="check" className="absolute left-0 top-0 h-3 w-3 text-saffron" />
      <Icon name="check" className="absolute left-[5px] top-0 h-3 w-3 text-saffron" />
    </span>
  );
}

function CallOverlay({
  crewId,
  kind,
  onEnd,
}: {
  crewId: string;
  kind: "call" | "video";
  onEnd: () => void;
}) {
  const { t } = useI18n();
  const crew = SEED_JOB.crews.find((c) => c.id === crewId);
  const [secs, setSecs] = useState(-2); // first 2 s: ringing

  useEffect(() => {
    const id = window.setInterval(() => setSecs((s) => s + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onEnd();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onEnd]);

  if (!crew) return null;
  const connected = secs >= 0;
  const mm = String(Math.floor(Math.max(secs, 0) / 60)).padStart(2, "0");
  const ss = String(Math.max(secs, 0) % 60).padStart(2, "0");

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center gap-4 bg-[#10151A] px-6 text-center"
      role="dialog"
      aria-modal="true"
      aria-label={kind === "call" ? t("cd.chat.call") : t("cd.chat.video")}
    >
      {kind === "video" && (
        <span className="absolute inset-0 flex items-center justify-center" aria-hidden="true">
          <Icon name="video" className="h-16 w-16 text-[#2a343d]" />
        </span>
      )}
      <div className="relative">
        <Avatar photo={crew.photo} name={crew.name} className={`h-24 w-24 text-2xl ${connected ? "" : "animate-pulse"}`} />
      </div>
      <div>
        <p className="text-xl font-black tracking-[-0.02em] text-chuna">{crew.name}</p>
        <p className="mt-1 text-sm font-bold text-[#9aa3ac]">
          {connected ? `${t("cd.chat.connected")} · ${mm}:${ss}` : t("cd.chat.ringing")}
        </p>
        {kind === "video" && <p className="mt-1 text-xs font-bold text-[#9aa3ac]">{t("cd.chat.camoff")}</p>}
      </div>
      <button
        type="button"
        onClick={onEnd}
        className="mt-4 inline-flex items-center gap-2 rounded-pill bg-saffron px-6 py-3 text-sm font-extrabold text-snow transition-opacity hover:opacity-90"
      >
        <Icon name="phone" className="h-4 w-4 rotate-[135deg]" />
        {t("cd.chat.end")}
      </button>
      <p className="text-[10px] font-extrabold uppercase tracking-[0.14em] text-[#687078]">{t("cd.chat.demo")}</p>
    </div>
  );
}

export function ChatPanel({
  initialCrew,
  callMode,
}: {
  initialCrew?: string | null;
  callMode?: "call" | "video" | null;
}) {
  const { t } = useI18n();
  const [mounted, setMounted] = useState(false);
  const [active, setActive] = useState<string | null>(initialCrew ?? null);
  const [all, setAll] = useState<Record<string, DashMsg[]>>({});
  const [draft, setDraft] = useState("");
  const [photoErr, setPhotoErr] = useState(false);
  const [call, setCall] = useState<{ crewId: string; kind: "call" | "video" } | null>(
    initialCrew && callMode ? { crewId: initialCrew, kind: callMode } : null,
  );
  const timers = useRef<number[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  const refresh = () => {
    const next: Record<string, DashMsg[]> = {};
    for (const c of SEED_JOB.crews) next[c.id] = getMsgs(c.id);
    setAll(next);
  };

  useEffect(() => {
    ensureSeeded();
    refresh();
    setMounted(true);
    return onDashChatChange(refresh);
  }, []);

  useEffect(() => () => timers.current.forEach((id) => window.clearTimeout(id)), []);

  const msgs = active ? (all[active] ?? []) : [];
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ block: "end" });
  }, [msgs.length, active]);

  /** Own message: tick 0 -> 1 -> 2, then a canned crew reply. Demo timers. */
  function scheduleDemo(crewId: string, id: string) {
    timers.current.push(window.setTimeout(() => setTick(crewId, id, 1), 900));
    timers.current.push(window.setTimeout(() => setTick(crewId, id, 2), 2400));
    timers.current.push(window.setTimeout(() => crewReply(crewId), 3800));
  }

  function send(text: string) {
    if (!active || !text.trim()) return;
    const m = sendMsg(active, { from: "me", kind: "text", text: text.trim() });
    scheduleDemo(active, m.id);
    setDraft("");
  }

  async function attach(file: File) {
    setPhotoErr(false);
    const res = await readPhotoFile(file);
    if (!res.ok || !active) {
      setPhotoErr(true);
      return;
    }
    const m = sendMsg(active, { from: "me", kind: "photo", text: "", photo: res.dataUrl });
    scheduleDemo(active, m.id);
  }

  function voiceNote() {
    if (!active) return;
    const m = sendMsg(active, { from: "me", kind: "voice", text: "", dur: "0:11" });
    scheduleDemo(active, m.id);
  }

  const crews = SEED_JOB.crews;
  if (!mounted) return <p className="text-sm font-bold text-muted">&nbsp;</p>;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("cd.nav.chat")}</h1>
        <p className="mt-1 text-sm font-bold text-muted">{t("cd.chat.sub")}</p>
      </div>

      <div className="grid overflow-hidden rounded-card border border-line bg-white shadow-card md:grid-cols-[240px_1fr]">
        {/* Thread list */}
        <aside className={`${active ? "hidden md:block" : ""} border-line md:border-r`} aria-label={t("cd.nav.chat")}>
          {crews.map((c) => {
            const list = all[c.id] ?? [];
            const last = list[list.length - 1];
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setActive(c.id)}
                className={`flex w-full items-center gap-3 border-b border-line px-3 py-3 text-left transition-colors hover:bg-chuna ${
                  active === c.id ? "bg-[rgba(224,0,72,0.06)]" : ""
                }`}
              >
                <Avatar photo={c.photo} name={c.name} className="h-10 w-10 text-xs" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-extrabold text-navy">{c.name}</span>
                  <span className="block truncate text-xs font-bold text-muted">
                    {last
                      ? last.kind === "voice"
                        ? `${t("cd.chat.mic")} · ${last.dur}`
                        : last.kind === "photo"
                          ? t("cd.chat.attach")
                          : last.text
                      : c.scope}
                  </span>
                </span>
                {last && <span className="shrink-0 text-[10px] font-extrabold text-muted">{hhmm(last.at)}</span>}
              </button>
            );
          })}
        </aside>

        {/* Window */}
        <section className={`${active ? "" : "hidden md:block"} flex min-h-[440px] flex-col`}>
          {!active ? (
            <p className="m-auto text-sm font-bold text-muted">{t("cd.chat.empty")}</p>
          ) : (
            <>
              {(() => {
                const c = crews.find((x) => x.id === active)!;
                return (
                  <header className="flex items-center gap-2 border-b border-line px-3 py-2.5">
                    <button
                      type="button"
                      onClick={() => setActive(null)}
                      aria-label={t("cd.chat.back")}
                      className="rounded-control p-1.5 text-navy hover:bg-chuna md:hidden"
                    >
                      <Icon name="arrowLeft" className="h-4 w-4" />
                    </button>
                    <Avatar photo={c.photo} name={c.name} className="h-9 w-9 text-[10px]" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-extrabold text-navy">{c.name}</span>
                      <span className="block truncate text-[11px] font-bold text-muted">{c.scope}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => setCall({ crewId: c.id, kind: "call" })}
                      aria-label={t("cd.chat.call")}
                      className="rounded-control p-2 text-navy transition-colors hover:bg-chuna hover:text-saffron"
                    >
                      <Icon name="phone" className="h-4 w-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setCall({ crewId: c.id, kind: "video" })}
                      aria-label={t("cd.chat.video")}
                      className="rounded-control p-2 text-navy transition-colors hover:bg-chuna hover:text-saffron"
                    >
                      <Icon name="video" className="h-4 w-4" />
                    </button>
                  </header>
                );
              })()}

              <div className="flex-1 space-y-2.5 overflow-y-auto bg-[#FAFAFB] p-3 dark:bg-[#0B0E11]">
                {msgs.map((m, i) => (
                  <div key={m.id} className={`flex ${m.from === "me" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-card px-3 py-2 text-sm font-bold shadow-card md:max-w-[70%] ${
                        m.from === "me"
                          ? "rounded-br-none bg-[rgba(224,0,72,0.10)] text-navy"
                          : "rounded-bl-none border border-line bg-white text-navy"
                      }`}
                    >
                      {m.kind === "photo" && m.photo && (
                        /* eslint-disable-next-line @next/next/no-img-element -- chat photos, no optimisation pass yet */
                        <img src={m.photo} alt="" className="mb-1 max-h-48 w-full rounded-control object-cover" />
                      )}
                      {m.kind === "voice" && m.dur && <VoiceNote dur={m.dur} seed={i + 3} />}
                      {m.text && <p className={m.kind === "photo" ? "mt-1" : ""}>{m.text}</p>}
                      <p className="mt-1 flex items-center justify-end gap-1 text-[10px] font-extrabold text-muted">
                        {hhmm(m.at)}
                        {m.from === "me" && <Ticks tick={m.tick} />}
                      </p>
                    </div>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <footer className="border-t border-line p-2.5">
                {photoErr && <p className="mb-1.5 text-xs font-extrabold text-saffron">{t("cd.av.err")}</p>}
                <form
                  className="flex items-center gap-1.5"
                  onSubmit={(e) => {
                    e.preventDefault();
                    send(draft);
                  }}
                >
                  <input
                    ref={fileRef}
                    type="file"
                    accept="image/jpeg,image/png"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) void attach(f);
                      e.target.value = "";
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    aria-label={t("cd.chat.attach")}
                    className="rounded-control p-2 text-muted transition-colors hover:bg-chuna hover:text-saffron"
                  >
                    <Icon name="clip" className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={voiceNote}
                    aria-label={t("cd.chat.mic")}
                    className="rounded-control p-2 text-muted transition-colors hover:bg-chuna hover:text-saffron"
                  >
                    <Icon name="mic" className="h-4 w-4" />
                  </button>
                  <input
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    placeholder={t("cd.chat.type")}
                    aria-label={t("cd.chat.type")}
                    className="min-w-0 flex-1 rounded-control border border-line bg-white px-3 py-2 text-sm font-bold text-navy outline-none placeholder:font-bold placeholder:text-muted focus:border-saffron"
                  />
                  <button
                    type="submit"
                    aria-label={t("cd.chat.send")}
                    disabled={!draft.trim()}
                    className="rounded-control bg-saffron p-2.5 text-snow transition-opacity hover:opacity-90 disabled:opacity-40"
                  >
                    <Icon name="send" className="h-4 w-4" />
                  </button>
                </form>
                <p className="mt-1.5 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{t("cd.chat.demo")}</p>
              </footer>
            </>
          )}
        </section>
      </div>

      {call && <CallOverlay crewId={call.crewId} kind={call.kind} onEnd={() => setCall(null)} />}
    </div>
  );
}