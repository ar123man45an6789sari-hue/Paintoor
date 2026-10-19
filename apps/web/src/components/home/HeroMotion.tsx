/* HeroMotion v2 — fixes: word spacing (inline-block swallowed spaces),
   smooth self-draw via pathLength=1, ambient drifting orbs, CTAs lead to auth. */
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
      <span className="mt-1 block text-xs text-slate-400">{label}</span>
    </div>
  );
}

export function CinematicHero() {
  const { t } = useI18n();
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (REDUCED) return;
    const section = sectionRef.current;
    if (!section) return;
    let ticking = false;
    const paint = () => {
      ticking = false;
      const p = Math.min(window.scrollY / window.innerHeight, 1);
      section.style.setProperty("--sky-top", `rgb(${14 + p * 20}, ${46 + p * 60}, ${85 + p * 90})`);
      section.style.setProperty("--sky-mid", `rgb(${29 + p * 60}, ${111 + p * 60}, ${184 + p * 40})`);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(paint);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const words = [t("hero.w1"), t("hero.w2"), t("hero.w3"), t("hero.w4"), t("hero.w5")];

  return (
    <section ref={sectionRef} className="hero-sky relative overflow-hidden px-5 py-24 text-white md:py-28">
      <div className="orb" style={{ width: 360, height: 360, left: "-8%", top: "16%", background: "#F2762E" }} aria-hidden="true" />
      <div className="orb orb-b" style={{ width: 300, height: 300, right: "-6%", top: "48%", background: "#FFB03A" }} aria-hidden="true" />

      <div className="relative mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
        <div>
          <span className="rounded-pill border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100">
            🇮🇳 {t("hero.badge")}
          </span>
          <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
            {words.map((word, i) => (
              <span
                key={`${word}-${i}`}
                className={`hero-word ${ACCENT[i] ? "text-haldi" : ""}`}
                style={{ animationDelay: `${i * 90}ms` }}
              >
                {word}
              </span>
            ))}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-blue-100">{t("hero.sub")}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => requestAuth("signup")}
              className="rounded-control bg-saffron px-6 py-3.5 font-extrabold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lift"
            >
              {t("hero.cta1")}
            </button>
            <a
              href="#how"
              className="rounded-control border-2 border-white/40 px-6 py-3.5 font-extrabold text-white transition-colors hover:bg-white/10"
            >
              {t("hero.cta2")}
            </a>
          </div>
        </div>

        <svg viewBox="0 0 420 360" fill="none" className="hidden md:block" aria-hidden="true">
          <path className="draw" pathLength={1} d="M70 170 L210 60 L350 170" stroke="#FFB03A" strokeWidth="10" strokeLinecap="round" />
          <path className="draw draw-2" pathLength={1} d="M105 175 V300 H315 V175" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
          <path className="draw draw-2" pathLength={1} d="M175 300 V225 H245 V300" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
          <path className="draw draw-3" pathLength={1} d="M60 262 C120 216 180 232 214 262 C258 300 322 288 362 246" stroke="#F2762E" strokeWidth="14" strokeLinecap="round" />
          <circle cx="310" cy="42" r="14" fill="#FFB03A" />
        </svg>
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