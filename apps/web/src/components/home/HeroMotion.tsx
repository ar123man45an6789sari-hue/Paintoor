/* HeroMotion v4 — Paintoor: one theme per mode (white light / black dark),
   no scroll-driven sky swap (client 3-color mandate). Sun ke rays ghumte hain.
   Word stagger, self-draw mark and counters stay. */
"use client";

import { useEffect, useRef, useState } from "react";
import { requestAuth } from "@/lib/authEvents";
import { useI18n } from "@/i18n";

const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ACCENT = [false, true, false, false, true];

const PULSE_KEYS = ["pulse.l1", "pulse.l2", "pulse.l3", "pulse.l4"];
const PULSE_VALUES = [
  { end: 47, suffix: "" },
  { end: 243, suffix: "" },
  { end: 18, suffix: "" },
  { end: 96, suffix: "%" },
];

function Counter({ end, suffix, label }: { end: number; suffix: string; label: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [value, setValue] = useState(REDUCED ? end : 0);

  useEffect(() => {
    if (REDUCED || !ref.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        observer.disconnect();
        const start = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - start) / 1400, 1);
          setValue(Math.round(end * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.6 },
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [end]);

  return (
    <div className="text-center">
      <span ref={ref} className="block text-3xl font-black text-haldi md:text-4xl">
        {value}
        {suffix}
      </span>
      <span className="mt-1 block text-xs text-muted">{label}</span>
    </div>
  );
}

/** 8 rays around the sun circle (310,42) — rotate via .sun-rays CSS. */
const RAYS = [0, 45, 90, 135, 180, 225, 270, 315].map((deg) => {
  const rad = (deg * Math.PI) / 180;
  return {
    deg,
    x1: 310 + Math.cos(rad) * 22,
    y1: 42 + Math.sin(rad) * 22,
    x2: 310 + Math.cos(rad) * 32,
    y2: 42 + Math.sin(rad) * 32,
  };
});

export function CinematicHero() {
  const { t } = useI18n();
  const words = [t("hero.w1"), t("hero.w2"), t("hero.w3"), t("hero.w4"), t("hero.w5")];

  return (
    <section className="relative overflow-hidden bg-surface px-5 py-24 text-ink md:py-28 dark:bg-raatri dark:text-snow">
      <div className="orb" style={{ width: 360, height: 360, left: "-8%", top: "16%", background: "#e00048", opacity: 0.14 }} aria-hidden="true" />
      <div className="orb orb-b" style={{ width: 300, height: 300, right: "-6%", top: "48%", background: "#e00048", opacity: 0.1 }} aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
        <div>
          <span className="rounded-pill border border-line bg-chuna px-3 py-1.5 text-xs font-bold text-muted">
            🇮🇳 {t("hero.badge")}
          </span>
          <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
            {words.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className={`hero-word ${ACCENT[i] ? "text-saffron" : ""}`}
                style={{ animationDelay: `${i * 90}ms` }}
              >
                {word}
              </span>
            ))}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-muted">{t("hero.sub")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => requestAuth("signup")}
              className="rounded-control bg-saffron px-6 py-3.5 font-extrabold text-snow transition-transform hover:-translate-y-0.5 hover:shadow-lift"
            >
              {t("hero.cta1")}
            </button>
            <a
              href="#how"
              className="rounded-control border-2 border-line px-6 py-3.5 font-extrabold text-ink transition-colors hover:bg-chuna dark:text-snow dark:hover:bg-chuna"
            >
              {t("hero.cta2")}
            </a>
          </div>
        </div>

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-15 md:static md:opacity-100" aria-hidden="true">
          <svg viewBox="0 0 420 360" fill="none" className="h-[75%] w-auto text-ink md:h-auto md:w-full dark:text-snow">
                        <g className="painter">
              <circle cx="52" cy="252" r="9" fill="currentColor" />
              <path d="M52 261 V292" stroke="currentColor" strokeWidth="7" strokeLinecap="round" />
              <path className="painter-leg-a" d="M52 292 L44 318" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              <path className="painter-leg-b" d="M52 292 L60 318" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
              <g className="painter-arm">
                <path d="M52 268 L74 262" stroke="currentColor" strokeWidth="6" strokeLinecap="round" />
                <path d="M74 262 L88 256" stroke="#8f9498" strokeWidth="4" strokeLinecap="round" />
                <path d="M88 256 L98 250" stroke="#e00048" strokeWidth="6" strokeLinecap="round" />
              </g>
            </g>
            <path className="draw" pathLength={1} d="M70 170 L210 60 L350 170" stroke="#e00048" strokeWidth="10" strokeLinecap="round" />
            <path className="draw draw-2" pathLength={1} d="M105 175 V300 H315 V175" stroke="currentColor" strokeWidth="10" strokeLinecap="round" />
            <path className="draw draw-2" pathLength={1} d="M175 300 V225 H245 V300" stroke="currentColor" strokeWidth="8" strokeLinecap="round" />
            <path className="draw draw-3" pathLength={1} d="M60 262 C120 216 180 232 214 262 C258 300 322 288 362 246" stroke="#e00048" strokeWidth="14" strokeLinecap="round" />
            <g className="sun-rays">
              {RAYS.map((r) => (
                <line key={r.deg} x1={r.x1} y1={r.y1} x2={r.x2} y2={r.y2} stroke="#e00048" strokeWidth="4" strokeLinecap="round" />
              ))}
            </g>
            <circle cx="310" cy="42" r="14" fill="#e00048" />
          </svg>
        </div>
      </div>
    </section>
  );
}

export function PulseBand() {
  const { t } = useI18n();
  return (
    <section className="bg-raatri px-5 py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
        {PULSE_VALUES.map((item, i) => (
          <Counter key={PULSE_KEYS[i]} end={item.end} suffix={item.suffix} label={t(PULSE_KEYS[i])} />
        ))}
      </div>
    </section>
  );
}