/* BeforeAfter v2 — signature interaction: drag to repaint a wall.
   Pure CSS/SVG art (no image assets), accessible via keyboard (range input).
   Before = stained, cracked, peeling. After = fresh paint, tape line, sheen. */
"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";

export function BeforeAfter() {
  const { t } = useI18n();
  const [pos, setPos] = useState(55);

  return (
    <section className="bg-chuna px-5 py-24">
      <div className="mx-auto max-w-4xl text-center">
        <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">Proof, not promises</span>
        <h2 className="mt-1 text-3xl font-black text-navy md:text-4xl">{t("ba.h")}</h2>
        <p className="mt-2 text-sm text-muted">{t("ba.p")}</p>

        <div className="relative mt-8 h-64 overflow-hidden rounded-sheet border border-line shadow-card md:h-80">
          {/* BEFORE: damp, cracked, peeling wall */}
          <div
            className="absolute inset-0"
            style={{ background: "linear-gradient(180deg,#a89d8d 0%,#8f8474 55%,#776c5e 100%)" }}
          >
            <svg viewBox="0 0 400 200" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
              <ellipse cx="120" cy="52" rx="52" ry="26" fill="#6d6252" opacity=".55" />
              <ellipse cx="300" cy="150" rx="60" ry="22" fill="#645a4b" opacity=".5" />
              <ellipse cx="210" cy="110" rx="26" ry="14" fill="#5d5344" opacity=".45" />
              <path d="M40 20 L70 60 L55 110 L90 160" stroke="#4e4536" strokeWidth="2.5" fill="none" />
              <path d="M250 10 L230 70 L260 120 L240 190" stroke="#4e4536" strokeWidth="2.5" fill="none" />
              <path d="M330 40 C310 80 350 110 320 160" stroke="#544a3b" strokeWidth="3.5" fill="none" />
              <path d="M150 180 l18 -14 l6 16 l16 -12" fill="#8f8474" stroke="#4e4536" strokeWidth="1.5" />
              <path d="M60 90 l14 -10 l4 12" fill="#776c5e" stroke="#4e4536" strokeWidth="1.5" />
            </svg>
            <span className="absolute left-3 top-3 rounded-pill bg-ink/80 px-3 py-1 text-xs font-extrabold text-white">
              {t("ba.before")}
            </span>
          </div>

          {/* AFTER: fresh paint, tape line, roller sheen */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: `inset(0 0 0 ${pos}%)`,
              background: "linear-gradient(180deg,#fffbf3 0%,#fdf3e2 55%,#f8e8cd 100%)",
            }}
          >
            <div className="absolute inset-x-0 top-0 h-2 bg-haldi/70" />
            <div className="absolute inset-y-0 right-8 w-10 bg-white/50" />
            <div className="absolute inset-x-0 bottom-0 h-1/5 bg-navy/15" />
            <svg viewBox="0 0 400 200" className="h-full w-full" preserveAspectRatio="none" aria-hidden="true">
              <path d="M0 30 L400 12" stroke="#ffffff" strokeWidth="10" opacity=".35" />
              <path d="M0 70 L400 52" stroke="#ffffff" strokeWidth="6" opacity=".22" />
            </svg>
            <span className="absolute right-3 top-3 rounded-pill bg-saffron px-3 py-1 text-xs font-extrabold text-white">
              {t("ba.after")}
            </span>
          </div>

          {/* handle */}
          <div className="pointer-events-none absolute inset-y-0" style={{ left: `${pos}%` }}>
            <div className="h-full w-1 -translate-x-1/2 bg-white shadow-card" />
            <div className="absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill bg-saffron text-sm font-black text-white shadow-lift">
              ⇄
            </div>
          </div>

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