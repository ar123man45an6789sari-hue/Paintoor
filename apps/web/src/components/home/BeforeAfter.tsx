/* BeforeAfter v3 — "paint the house": a grey, tired house turns colourful as
   the visitor drags. Pure SVG art, keyboard accessible via range input. */
"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";

function HouseArt({ colored }: { colored: boolean }) {
  const wall = colored ? "#f6b3c8" : "#c4c8cc";
  const wallShade = colored ? "#f39ab5" : "#b0b4b8";
  const roof = colored ? "#182028" : "#9aa0a6";
  const door = colored ? "#e00048" : "#a6aaae";
  const win = colored ? "#ffffff" : "#b8bcc0";
  const trim = colored ? "#ffffff" : "#adb1b5";
  const bush = colored ? "#e00048" : "#a6aaae";
  return (
    <svg viewBox="0 0 400 240" className="h-full w-full" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x="0" y="0" width="400" height="240" fill={colored ? "#fdeef2" : "#e8eaed"} />
      <circle cx="345" cy="40" r="18" fill={colored ? "#e00048" : "#c4c8cc"} />
      <path d="M90 110 L200 40 L310 110 Z" fill={roof} />
      <rect x="250" y="52" width="16" height="34" fill={roof} />
      <rect x="110" y="110" width="180" height="90" fill={wall} />
      <rect x="110" y="110" width="180" height="12" fill={wallShade} />
      <rect x="185" y="140" width="34" height="60" rx="3" fill={door} />
      <circle cx="213" cy="172" r="2.5" fill={trim} />
      <rect x="128" y="132" width="38" height="30" rx="3" fill={win} stroke={trim} strokeWidth="3" />
      <rect x="238" y="132" width="38" height="30" rx="3" fill={win} stroke={trim} strokeWidth="3" />
      <path d="M147 132 V162 M128 147 H166" stroke={trim} strokeWidth="2.5" />
      <path d="M257 132 V162 M238 147 H276" stroke={trim} strokeWidth="2.5" />
      <rect x="0" y="200" width="400" height="40" fill={colored ? "#f9ccdb" : "#dcdfe2"} />
      <circle cx="95" cy="198" r="14" fill={bush} opacity={colored ? 0.85 : 0.5} />
      <circle cx="308" cy="198" r="14" fill={bush} opacity={colored ? 0.85 : 0.5} />
      {!colored && (
        <g stroke="#8f9498" strokeWidth="2" fill="none" opacity="0.8">
          <path d="M130 120 L150 150 L140 180" />
          <path d="M260 118 L248 150 L262 186" />
          <ellipse cx="205" cy="126" rx="16" ry="7" fill="#b0b4b8" stroke="none" />
        </g>
      )}
    </svg>
  );
}

export function BeforeAfter() {
  const { t } = useI18n();
  const [pos, setPos] = useState(35);

  return (
    <section className="bg-chuna px-5 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">Proof, not promises</span>
        <h2 className="mt-1 text-3xl font-black text-navy md:text-4xl">{t("ba.h")}</h2>
        <p className="mt-2 text-sm text-muted">{t("ba.p")}</p>

        <div className="relative mt-8 h-72 overflow-hidden rounded-sheet border border-line shadow-card md:h-96">
          <div className="absolute inset-0">
            <HouseArt colored={false} />
          </div>
          <div className="absolute inset-0" style={{ clipPath: `inset(0 0 0 ${pos}%)` }}>
            <HouseArt colored />
          </div>

          <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
            <div className="h-full w-1 -translate-x-1/2 bg-snow shadow-card" />
            <div className="absolute top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill bg-saffron text-base font-black text-snow shadow-lift">
              🖌️
            </div>
          </div>

          <span className="absolute left-3 top-3 rounded-pill bg-raatri/85 px-3 py-1 text-xs font-extrabold text-snow">{t("ba.before")}</span>
          <span className="absolute right-3 top-3 rounded-pill bg-saffron px-3 py-1 text-xs font-extrabold text-snow">{t("ba.after")}</span>
          <span className="absolute bottom-3 left-1/2 -translate-x-1/2 rounded-pill bg-snow/90 px-3 py-1.5 text-xs font-extrabold text-ink">
            🎨 {t("ba.paintHint")}
          </span>

          <input
            type="range"
            min={0}
            max={100}
            value={pos}
            onChange={(e) => setPos(+e.target.value)}
            aria-label={t("ba.h")}
            className="absolute inset-0 h-full w-full cursor-ew-resize opacity-0"
          />
        </div>
      </div>
    </section>
  );
}