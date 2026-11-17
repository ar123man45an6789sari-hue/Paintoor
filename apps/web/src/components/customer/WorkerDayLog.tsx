/* One crew's day-by-day log inside the jobs board.

   Pending days render greyed with an honest "no update yet" line; lived
   days carry the site photo, the crew's note and (when present) a voice
   note whose waveform plays on a local timer — demo phase has no audio
   file, the player animates the elapsed time only. */
"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { SitePhoto } from "@/components/customer/SitePhoto";
import type { CrewAssignment } from "@/lib/jobs";

const BARS = 26;

/** Deterministic bar heights — same on server and client, no Math.random. */
function barHeight(i: number, seed: number): number {
  return 30 + ((i * 37 + seed * 17) % 55);
}

function durToSec(d: string): number {
  const [m, s] = d.split(":").map(Number);
  return (m || 0) * 60 + (s || 0);
}

function fmt(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function VoiceNote({ dur, seed }: { dur: string; seed: number }) {
  const total = Math.max(1, durToSec(dur));
  const [playing, setPlaying] = useState(false);
  const { t } = useI18n();
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!playing) return;
    const id = window.setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => window.clearInterval(id);
  }, [playing]);

  useEffect(() => {
    if (playing && elapsed >= total) {
      setPlaying(false);
      setElapsed(0);
    }
  }, [elapsed, playing, total]);

  const played = Math.round((BARS * Math.min(elapsed, total)) / total);

  return (
    <div className="inline-flex max-w-full items-center gap-2 rounded-control border border-line bg-white px-2 py-1.5">
      <button
        type="button"
        onClick={() => setPlaying((p) => !p)}
        aria-label={playing ? t("cd.vn.pause") : t("cd.vn.play")}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-saffron text-snow"
      >
        <Icon name={playing ? "pause" : "play"} className="h-3 w-3" />
      </button>
      <span className="flex h-6 items-end gap-[2px]" aria-hidden="true">
        {Array.from({ length: BARS }, (_, i) => (
          <span
            key={i}
            className={`w-[3px] rounded-full ${i < played ? "bg-saffron" : "bg-line"}`}
            style={{ height: `${barHeight(i, seed)}%` }}
          />
        ))}
      </span>
      <span className="shrink-0 text-[10px] font-extrabold text-muted">
        {playing ? fmt(elapsed) : dur}
      </span>
    </div>
  );
}

export function WorkerDayLog({ crew }: { crew: CrewAssignment }) {
  const { t } = useI18n();
  return (
    <div className="space-y-3 border-t border-line pt-3">
      {crew.days.map((d, i) => {
        const pending = !d.done && !d.cur;
        return (
          <div key={d.n} className={`flex items-start gap-3 ${pending ? "opacity-45" : ""}`}>
            <SitePhoto
              src={d.shots[0]}
              alt={`${crew.name} — ${d.n}`}
              className="h-12 w-16 shrink-0 rounded-control object-cover"
            />
            <div className="min-w-0 flex-1">
              <p className="text-[11px] font-extrabold uppercase tracking-[0.14em] text-saffron">
                {d.n} · {d.d}
              </p>
              {pending ? (
                <p className="text-sm font-bold text-muted">{t("cd.jobs.noupdate")}</p>
              ) : (
                <p className="text-sm font-bold text-navy">{d.note}</p>
              )}
              {d.voice && !pending && (
                <div className="mt-1.5">
                  <VoiceNote dur={d.voice.dur} seed={i + 2} />
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}