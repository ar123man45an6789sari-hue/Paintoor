/* LandingSections v2 — showcase-only landing (no functionality), tri-role lens,
   mobile-adaptive motion (nothing hidden, presentation adapts), i18n aware. */
"use client";

import { BeforeAfter } from "./BeforeAfter";
import { useEffect, useRef, useState } from "react";
import { seed } from "@gharsahayak/mock-api";
import { useI18n } from "@/i18n";

const REDUCED =
  typeof window !== "undefined" &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function useReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("in");
            io.unobserve(e.target);
          }
        }),
      { threshold: 0.15 },
    );
    document.querySelectorAll(".reveal").forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);
}

const ACT_KEYS = ["a1", "a2", "a3", "a4", "a5"];
const ACT_TAGS = ["ACT 1 · REQUEST", "ACT 2 · CHOICE", "ACT 3 · QUOTE", "ACT 4 · SAFE PAY", "ACT 5 · DELIGHT"];

function StoryPin() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const [act, setAct] = useState(0);

  useEffect(() => {
    const section = ref.current;
    if (!section) return;
    let ticking = false;
    const paint = () => {
      ticking = false;
      const r = section.getBoundingClientRect();
      const p = clamp(-r.top / (section.offsetHeight - window.innerHeight), 0, 1);
      setAct(clamp(Math.floor(p * 5), 0, 4));
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(paint);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    paint();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="how" ref={ref} className="ls-story">
      <div className="ls-pin">
        <div className="ls-head">
          <h2 className="text-3xl font-black text-navy md:text-4xl">{t("story.h")}</h2>
          <p className="mt-1 text-muted">{t("story.p")}</p>
        </div>

        {ACT_KEYS.map((k, i) => (
          <div key={k} className={`act-copy ${i === act ? "on" : ""}`}>
            <span className="text-xs font-black tracking-[0.16em] text-saffron">{ACT_TAGS[i]}</span>
            <h3 className="mt-2 text-2xl font-black text-navy md:text-3xl">{t(`${k}.h`)}</h3>
            <p className="mt-2 text-muted">{t(`${k}.p`)}</p>
          </div>
        ))}

        <div className="ls-phone" aria-hidden="true">
          <div className="screen">
            <div className={`ls-scr ${act === 0 ? "on" : ""}`}>
              <div className="h-2.5 w-3/5 rounded bg-[#E4EAF1]" />
              <div className="mt-2 h-24 rounded-xl bg-gradient-to-br from-[#E8DCC8] to-[#D9C7A9]" />
              <div className="mt-3 rounded-xl border border-[#DCE3EC] p-2.5"><div className="h-2.5 w-2/5 rounded bg-[#FDE3D0]" /></div>
              <div className="mt-3 rounded-lg bg-saffron py-2 text-center text-xs font-extrabold text-white">Send to Workers</div>
            </div>
            <div className={`ls-scr ${act === 1 ? "on" : ""}`}>
              {["Sunil V. · 4.8★", "Rafiq M. · 4.6★", "Dinesh P. · 4.7★"].map((n) => (
                <div key={n} className="mt-2 flex items-center gap-2 rounded-xl border border-[#DCE3EC] p-2.5">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-gradient-to-br from-saffron to-haldi text-xs font-black text-white">{n.charAt(0)}</span>
                  <span className="text-xs font-bold text-navy">{n}</span>
                </div>
              ))}
            </div>
            <div className={`ls-scr ${act === 2 ? "on" : ""}`}>
              <div className="mt-2 rounded-xl border border-[#DCE3EC] p-2.5"><p className="text-xs font-bold text-navy">Labour · 320 sqft</p><p className="text-[11px] text-muted">₹7,040</p></div>
              <div className="mt-2 rounded-xl border border-[#DCE3EC] p-2.5"><p className="text-xs font-bold text-navy">Material · Gupta Paints</p><p className="text-[11px] text-muted">Royale 10L + primer · ₹5,970</p></div>
              <div className="mt-2 rounded-xl border border-[#DCE3EC] p-2.5"><p className="text-xs font-bold text-navy">Total (GST incl.)</p><p className="text-[11px] font-black text-navy">₹16,541</p></div>
            </div>
            <div className={`ls-scr ${act === 3 ? "on" : ""}`}>
              <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#EAF3FC] text-2xl">🔒</div>
              <p className="mt-2 text-center text-xs font-bold text-navy">₹4,962 safe in escrow</p>
              <p className="text-center text-[11px] text-muted">Released only after approval</p>
            </div>
            <div className={`ls-scr ${act === 4 ? "on" : ""}`}>
              <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#DFF3E6] text-2xl">✅</div>
              <p className="mt-2 text-center text-xs font-bold text-navy">Job done · rated 4.8★</p>
              <p className="text-center text-[11px] text-muted">Invoice + warranty card ready</p>
            </div>
          </div>
        </div>

        <div className="rail-dots" aria-hidden="true">
          {ACT_KEYS.map((k, i) => (
            <i key={k} className={i === act ? "on" : ""} />
          ))}
        </div>
      </div>
    </section>
  );
}

function Categories() {
  const { t } = useI18n();
  const CATS = ["c1", "c2", "c3", "c4", "c5", "c6"];
  const ICONS = ["🎨", "⚡", "", "", "🧽", "❄️"];
  return (
    <section id="services" className="bg-chuna px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">Services</span>
            <h2 className="mt-1 text-3xl font-black text-navy md:text-4xl">{t("cats.h")}</h2>
          </div>
          <p className="max-w-md text-sm text-muted">{t("cats.p")}</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATS.map((c, i) => (
            <div key={c} className="reveal rounded-card border border-line bg-white p-6 transition-all hover:-translate-y-1.5 hover:shadow-card">
              <div className="flex h-12 w-12 items-center justify-center rounded-control bg-[#EAF3FC] text-2xl">{ICONS[i]}</div>
              <h3 className="mt-3 font-extrabold text-navy">{t(`${c}.t`)}</h3>
              <p className="mt-1 text-xs text-muted">{t(`${c}.r`)}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const GRADIENTS = [
  ["#F2762E", "#8A3D0C"],
  ["#1D6FB8", "#0E2E55"],
  ["#0E9F8A", "#075E51"],
  ["#6C4BD8", "#3D2A80"],
  ["#C25A18", "#7A3A10"],
  ["#0E9F8A", "#123A6B"],
];

function WorkersBand() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (REDUCED) return;
    const section = ref.current;
    const track = trackRef.current;
    if (!section || !track) return;
    let ticking = false;
    const paint = () => {
      ticking = false;
      const r = section.getBoundingClientRect();
      const p = clamp(-r.top / (section.offsetHeight - window.innerHeight), 0, 1);
      const max = track.scrollWidth - window.innerWidth + 32;
      track.style.transform = `translateX(${-p * max}px)`;
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(paint);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    paint();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section id="workers" ref={ref} className="ls-workers">
      <div className="ls-workpin">
        <div className="ls-head">
          <h2 className="text-3xl font-black text-navy md:text-4xl">{t("workers.h")}</h2>
          <p className="mt-1 text-muted">{t("workers.p")}</p>
        </div>
        <div ref={trackRef} className="flex gap-4 pl-4 will-change-transform md:gap-5 md:pl-[max(24px,calc((100vw-1120px)/2+24px))]">
          {seed.providers.map((p, i) => {
            const [from, to] = GRADIENTS[i % GRADIENTS.length];
            return (
              <article key={p.id} className="w-[250px] flex-none overflow-hidden rounded-card border border-line bg-white shadow-card md:w-[300px]">
                <div className="flex h-24 items-center justify-center text-4xl font-black text-white md:h-28 md:text-5xl" style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}>
                  {p.name.charAt(0)}
                </div>
                <div className="p-4">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-extrabold text-navy">{p.name}</h3>
                    <span className="text-sm font-black text-haldi">★ {p.rating_avg}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{p.city} · {p.zone} · {p.experience_years} yrs</p>
                  <p className="mt-3 border-l-2 border-saffron pl-2 text-sm italic text-muted">“{p.quote}”</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function EscrowFlow() {
  const { t } = useI18n();
  const ref = useRef<HTMLElement>(null);
  const pathRef = useRef<SVGPathElement>(null);
  const coinRef = useRef<SVGGElement>(null);
  const [step, setStep] = useState(0);

  useEffect(() => {
    const section = ref.current;
    const path = pathRef.current;
    const coin = coinRef.current;
    if (!section || !path || !coin) return;
    const len = path.getTotalLength();
    let ticking = false;
    const paint = () => {
      ticking = false;
      const r = section.getBoundingClientRect();
      const p = clamp(((window.innerHeight - r.top) / (window.innerHeight + r.height)) * 1.35, 0, 1);
      const pt = path.getPointAtLength(p * len);
      coin.setAttribute("transform", `translate(${pt.x}, ${pt.y})`);
      setStep(p < 0.34 ? 0 : p < 0.72 ? 1 : 2);
    };
    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(paint);
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    paint();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const STEPS = [
    { h: t("e1.h"), p: t("e1.p") },
    { h: t("e2.h"), p: t("e2.p") },
    { h: t("e3.h"), p: t("e3.p") },
  ];

  return (
    <section ref={ref} className="px-5 py-24" style={{ background: "linear-gradient(180deg,#FDFDFB,#EFF4F9)" }}>
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
        <div className="reveal">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">Escrow</span>
          <h2 className="mt-1 text-3xl font-black text-navy md:text-4xl">{t("escrow.h")}</h2>
          <p className="mt-2 text-sm text-muted">{t("escrow.p")}</p>
          <div className="mt-6 space-y-3">
            {STEPS.map((s, i) => (
              <div key={s.h} className={`rounded-card border bg-white p-4 transition-all ${i === step ? "translate-x-1 border-saffron shadow-card" : "border-line opacity-50"}`}>
                <h3 className="font-extrabold text-navy">{s.h}</h3>
                <p className="text-sm text-muted">{s.p}</p>
              </div>
            ))}
          </div>
        </div>
        <svg viewBox="0 0 460 300" className="reveal w-full" aria-label="Escrow flow">
          <path ref={pathRef} d="M60 220 C60 120 160 90 230 90 C300 90 400 120 400 220" stroke="#C9D4E0" strokeWidth="4" fill="none" strokeDasharray="6 8" />
          <g ref={coinRef}><circle r="16" fill="#FFB03A" /><text y="6" textAnchor="middle" fontSize="16" fontWeight="900" fill="#7A3A10">₹</text></g>
          <rect x="200" y="60" width="60" height="60" rx="14" fill="#123A6B" />
          <text x="230" y="98" textAnchor="middle" fontSize="26">🔒</text>
          <g fontSize="13" fontWeight="700" fill="#243244">
            <text x="60" y="252" textAnchor="middle">Customer</text>
            <text x="230" y="146" textAnchor="middle">Escrow</text>
            <text x="400" y="252" textAnchor="middle">Worker</text>
          </g>
          <circle cx="60" cy="220" r="20" fill="#EAF3FC" /><text x="60" y="227" textAnchor="middle" fontSize="18">🏠</text>
          <circle cx="400" cy="220" r="20" fill="#FDEBDD" /><text x="400" y="227" textAnchor="middle" fontSize="18">🔧</text>
        </svg>
      </div>
    </section>
  );
}

function RoleLens() {
  const { t } = useI18n();
  const LENSES = [
    { emoji: "🏠", key: "l1" },
    { emoji: "🔧", key: "l2" },
    { emoji: "🏪", key: "l3" },
  ];
  return (
    <section id="why" className="bg-raatri px-5 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="reveal text-center">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-haldi">Why us</span>
          <h2 className="mt-1 text-3xl font-black md:text-4xl">{t("lens.h")}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-400">{t("lens.p")}</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {LENSES.map((l) => (
            <div key={l.key} className="reveal rounded-sheet border border-white/12 bg-white/5 p-6">
              <div className="text-3xl">{l.emoji}</div>
              <h3 className="mt-3 text-lg font-extrabold">{t(`${l.key}.t`)}</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {[1, 2, 3].map((n) => (
                  <li key={n} className="flex gap-2">
                    <span className="text-haldi">✓</span>
                    {t(`${l.key}.${n}`)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export function LandingSections() {
  useReveal();
  return (
    <>
      <StoryPin />
      <Categories />
      <BeforeAfter />
      <WorkersBand />
      <EscrowFlow />
      <RoleLens />
    </>
  );
}