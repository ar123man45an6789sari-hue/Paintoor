/* BeforeAfter v1 — signature interaction: drag to repaint a wall.
   Pure CSS art (no image assets), accessible via keyboard (range input). */
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
          {/* before wall */}
          <div
            className="absolute inset-0"
            style={{
              background: "linear-gradient(180deg,#cfc7b8 0%,#b8ae9c 60%,#a3988a 100%)",
            }}
          >
            <svg viewBox="0 0 400 200" className="h-full w-full opacity-60" preserveAspectRatio="none" aria-hidden="true">
              <path d="M40 20 L70 60 L55 110 L90 160" stroke="#7d7466" strokeWidth="2" fill="none" />
              <path d="M250 10 L230 70 L260 120 L240 190" stroke="#7d7466" strokeWidth="2" fill="none" />
              <path d="M330 40 C310 80 350 110 320 160" stroke="#8a8172" strokeWidth="3" fill="none" />
              <ellipse cx="150" cy="60" rx="34" ry="18" fill="#948a79" opacity=".7" />
              <ellipse cx="300" cy="150" rx="44" ry="16" fill="#8a8172" opacity=".6" />
            </svg>
            <span className="absolute left-3 top-3 rounded-pill bg-ink/70 px-3 py-1 text-xs font-extrabold text-white">{t("ba.before")}</span>
          </div>

          {/* after wall, clipped by slider */}
          <div
            className="absolute inset-0"
            style={{
              clipPath: `inset(0 0 0 ${pos}%)`,
              background: "linear-gradient(180deg,#fdf6ec 0%,#f7e8d3 55%,#efd9b8 100%)",
            }}
          >
            <div className="absolute inset-x-0 bottom-0 h-1/4 bg-[#123A6B]/10" />
            <span className="absolute right-3 top-3 rounded-pill bg-saffron px-3 py-1 text-xs font-extrabold text-white">{t("ba.after")}</span>
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