/* HeroMotion — Paintoor hero: word stagger, orbs, full-size Lottie painter
   with corner sun (rotating rays + fade-in). No house sketch, no scroll-sky. */
"use client";

import { useEffect, useRef, useState } from "react";
import { requestAuth } from "@/lib/authEvents";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { PainterLottie } from "./PainterLottie";
import { isLiveSkill, seed } from "@paintoor/mock-api";
const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const ACCENT = [false, true, false, false, true];
/* Honest hero badge: counts come straight from the seed data and only
   include partners that are actually bookable today (live skill), so the
   number can never drift from what the marketplace shows. */
const LIVE_PROVIDERS = seed.providers.filter((p) => p.skills.some(isLiveSkill));
const PARTNER_COUNT = LIVE_PROVIDERS.length;
const CITY_COUNT = new Set(LIVE_PROVIDERS.map((p) => p.city)).size;

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
        <span ref={ref} className="block text-3xl font-black text-snow md:text-4xl">
        {value}
        {suffix}
      </span>
      <span className="mt-1 block text-xs text-snow/80">{label}</span>
    </div>
  );
}

export function CinematicHero() {
  const { t } = useI18n();
  const words = [t("hero.w1"), t("hero.w2"), t("hero.w3"), t("hero.w4"), t("hero.w5")];

  return (
    <section className="relative overflow-hidden bg-surface px-5 py-16 text-ink md:py-28 dark:bg-raatri dark:text-snow">
          <svg
        viewBox="0 0 200 200"
        fill="none"
        className="pointer-events-none absolute -right-8 -top-8 z-10 h-40 w-40 overflow-visible md:-right-6 md:-top-6 md:h-[360px] md:w-[360px]"
        aria-hidden="true"
      >
        <defs>
          <radialGradient id="pt-sun-glow">
            <stop offset="0%" stopColor="#e00048" stopOpacity="0.28" />
            <stop offset="45%" stopColor="#f27ba0" stopOpacity="0.12" />
            <stop offset="100%" stopColor="#f27ba0" stopOpacity="0" />
          </radialGradient>
        </defs>
        <circle className="sun-glow" cx="100" cy="100" r="99" fill="url(#pt-sun-glow)" />
        {/* Crisp brand spokes on top, rotating a touch quicker. */}
        <g className="sun-rays" style={{ transformOrigin: "100px 100px" }}>
          {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => {
            const r = (d * Math.PI) / 180;
            return (
              <line
                key={d}
                x1={100 + Math.cos(r) * 27}
                y1={100 + Math.sin(r) * 27}
                x2={100 + Math.cos(r) * 40}
                y2={100 + Math.sin(r) * 40}
                stroke="#e00048"
                strokeWidth="7"
                strokeLinecap="round"
              />
            );
          })}
        </g>
        <circle className="sun-core" cx="100" cy="100" r="19" fill="#e00048" />
      </svg>
      <div
        className="orb"
        style={{ width: 360, height: 360, left: "-8%", top: "16%", background: "#e00048", opacity: 0.14 }}
        aria-hidden="true"
      />
      <div
        className="orb orb-b"
        style={{ width: 300, height: 300, right: "-6%", top: "48%", background: "#e00048", opacity: 0.1 }}
        aria-hidden="true"
      />

      <div className="relative mx-auto grid max-w-6xl items-center gap-2 md:grid-cols-[1.15fr_0.85fr] md:gap-10">
        <div>
         <span className="inline-flex items-center gap-1.5 rounded-pill border border-line bg-chuna px-3 py-1.5 text-xs font-bold text-muted">
            <Icon name="mapPin" className="h-3.5 w-3.5 text-saffron" />
            {t("hero.badge", { cities: CITY_COUNT, partners: PARTNER_COUNT })}
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

          <div className="flex items-center justify-center" aria-hidden="true">
          <div className="relative w-full max-w-[620px] md:mt-28">
            <PainterLottie />
          </div>
        </div>
      </div>
    </section>
  );
}

export function PulseBand() {
  const { t } = useI18n();
  return (
      <section className="bg-saffron px-5 py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
        {PULSE_VALUES.map((item, i) => (
          <Counter key={PULSE_KEYS[i]} end={item.end} suffix={item.suffix} label={t(PULSE_KEYS[i])} />
        ))}
      </div>
    </section>
  );
}