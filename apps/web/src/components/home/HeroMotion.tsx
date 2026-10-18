"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Cinematic hero ported from prototype v0.2:
 * sky brightens with scroll, brand mark draws itself, pulse counters tick.
 * Transform/opacity + CSS vars only; fully disabled under reduced motion.
 */
const REDUCED = typeof window !== "undefined"
  && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const WORDS: { text: string; accent?: boolean }[] = [
  { text: "Every" },
  { text: "home", accent: true },
  { text: "job," },
  { text: "with" },
  { text: "trust.", accent: true },
];

const PULSE = [
  { end: 47, suffix: "", label: "jobs running in Vadodara today" },
  { end: 243, suffix: "", label: "verified workers · 4.6★ average" },
  { end: 18, suffix: "", label: "partner stores (paint & hardware)" },
  { end: 96, suffix: "%", label: "jobs finished on time" },
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
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (REDUCED) return;
    let ticking = false;
    const paint = () => {
      ticking = false;
      const section = sectionRef.current;
      if (!section) return;
      const progress = Math.min(window.scrollY / window.innerHeight, 1);
      section.style.setProperty("--sky-top", `rgb(${14 + progress * 20}, ${46 + progress * 60}, ${85 + progress * 90})`);
      section.style.setProperty("--sky-mid", `rgb(${29 + progress * 60}, ${111 + progress * 60}, ${184 + progress * 40})`);
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

  return (
    <section
      ref={sectionRef}
      className="hero-sky px-5 py-24 text-white"
    >
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-[1.15fr_0.85fr]">
        <div>
          <span className="rounded-pill border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100">
            🇮🇳 Now live in Vadodara · 240+ verified workers
          </span>
          <h1 className="mt-6 text-4xl font-black leading-tight md:text-6xl">
            {WORDS.map((word, i) => (
              <span
                key={word.text}
                className={`hero-word ${word.accent ? "text-haldi" : ""}`}
                style={{ animationDelay: `${i * 90}ms` }}
              >
                {word.text}{" "}
              </span>
            ))}
          </h1>
          <p className="mt-5 max-w-xl text-lg text-blue-100">
            Verified painters, electricians and plumbers from your neighbourhood —
            compare itemized quotes, keep your money safe, approve the work.
          </p>
          <a
            href="#get-started"
            className="mt-8 inline-block rounded-control bg-saffron px-6 py-3.5 font-extrabold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lift"
          >
            Post a job
          </a>
        </div>

        <svg viewBox="0 0 420 360" fill="none" className="hidden md:block" aria-hidden="true">
          <path className="draw" d="M70 170 L210 60 L350 170" stroke="#FFB03A" strokeWidth="10" strokeLinecap="round" />
          <path className="draw draw-2" d="M105 175 V300 H315 V175" stroke="#FFFFFF" strokeWidth="10" strokeLinecap="round" />
          <path className="draw draw-2" d="M175 300 V225 H245 V300" stroke="#FFFFFF" strokeWidth="8" strokeLinecap="round" />
          <path className="draw draw-3" d="M60 262 C120 216 180 232 214 262 C258 300 322 288 362 246" stroke="#F2762E" strokeWidth="14" strokeLinecap="round" />
          <circle cx="310" cy="42" r="14" fill="#FFB03A" />
        </svg>
      </div>
    </section>
  );
}

export function PulseBand() {
  return (
    <section className="bg-raatri px-5 py-10">
      <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 md:grid-cols-4">
        {PULSE.map((item) => (
          <Counter key={item.label} end={item.end} suffix={item.suffix} label={item.label} />
        ))}
      </div>
    </section>
  );
}