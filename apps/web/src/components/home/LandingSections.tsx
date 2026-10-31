/* LandingSections v2 — showcase-only landing (no functionality), tri-role lens,
   mobile-adaptive motion (nothing hidden, presentation adapts), i18n aware. */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { seed } from "@paintoor/mock-api";
import { useI18n } from "@/i18n";
import { StudioTeaser } from "@/components/studio/StudioTeaser";

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
const ACT_TAGS = ["Act 1 · Request", "Act 2 · Choice", "Act 3 · Quote", "Act 4 · Safe pay", "Act 5 · Delight"];

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
              <div className="h-2.5 w-3/5 rounded-pill bg-[#e8eaed]" />
              <div className="mt-2 h-24 rounded-xl bg-gradient-to-br from-[#f9ccdb] to-[#f6b3c8]" />
              <div className="mt-3  rounded-card border border-[#e2e4e7]p-2.5"><div className="h-2.5 w-2/5 rounded bg-[#f9ccdb]" /></div>
              <div className="mt-3 rounded-lg bg-saffron py-2 text-center text-xs font-extrabold text-snow">Send to Workers</div>
            </div>
            <div className={`ls-scr ${act === 1 ? "on" : ""}`}>
              {["Sunil V. · 4.8★", "Rafiq M. · 4.6★", "Dinesh P. · 4.7★"].map((n) => (
                <div key={n} className="mt-2 flex items-center gap-2 rounded-card border border-[#e2e4e7] p-2.5">
                  <span className="flex h-8 w-8 flex-none items-center justify-center rounded-full bg-gradient-to-br from-saffron to-haldi text-xs font-black text-snow">{n.charAt(0)}</span>
                  <span className="text-xs font-bold text-navy">{n}</span>
                </div>
              ))}
            </div>
            <div className={`ls-scr ${act === 2 ? "on" : ""}`}>
              <div className="mt-2 rounded-card border border-[#e2e4e7] p-2.5"><p className="text-xs font-bold text-navy">Labour · 320 sqft</p><p className="text-xs text-muted">₹7,040</p></div>
              <div className="mt-2 rounded-card border border-[#e2e4e7] p-2.5"><p className="text-xs font-bold text-navy">Material · Gupta Paints</p><p className="text-xs text-muted">Royale 10L + primer · ₹5,970</p></div>
              <div className="mt-2 rounded-card border border-[#e2e4e7] p-2.5"><p className="text-xs font-bold text-navy">Total (GST incl.)</p><p className="text-xs font-black text-navy">₹16,541</p></div>
            </div>
            <div className={`ls-scr ${act === 3 ? "on" : ""}`}>
              <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fce6ed] text-2xl">🔒</div>
              <p className="mt-2 text-center text-xs font-bold text-navy">₹4,962 safe in escrow</p>
              <p className="text-center text-xs text-muted">Released only after approval</p>
            </div>
            <div className={`ls-scr ${act === 4 ? "on" : ""}`}>
              <div className="mx-auto mt-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#fce6ed] text-2xl">✅</div>
              <p className="mt-2 text-center text-xs font-bold text-navy">Job done · rated 4.8★</p>
              <p className="text-center text-xs text-muted">Invoice + warranty card ready</p>
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

/* Paint brands our partners work with — one card on the big stage at a
   time: it pops in from the right, stays a beat, then swipes out to the
   left as the next one arrives. Bucket+logo images live in
   public/brands/ and are named after each brand's slug. */
const BRANDS = [
  { name: "Asian Paints", slug: "asian-paints", lines: "Exterior · Interior · Wood" },
  { name: "Berger", slug: "berger", lines: "Exterior · Interior · Metal" },
  { name: "Nerolac", slug: "nerolac", lines: "Interior · Exterior · Enamel" },
  { name: "Dulux", slug: "dulux", lines: "Interior · Exterior · Primer" },
  { name: "Birla Opus", slug: "birla-opus", lines: "Exterior · Interior" },
  { name: "Shalimar", slug: "shalimar", lines: "Interior · Enamel · Distemper" },
  { name: "Indigo Paints", slug: "indigo", lines: "Exterior · Interior · Cement" },
  { name: "JSW Paints", slug: "jsw", lines: "Exterior · Interior · Primer" },
];

function BrandCard({ b, leaving }: { b: (typeof BRANDS)[number]; leaving?: boolean }) {
  const { t } = useI18n();
  return (
    <article
      className={`absolute inset-0 overflow-hidden rounded-sheet border-2 border-saffron bg-white shadow-card ${
        leaving ? "brand-out" : "brand-in"
      }`}
    >
      {/* One full-bleed artwork: no padding, no blur, no empty space — the
          image covers the whole stage edge to edge. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={`/brands/${b.slug}.png`}
        alt={b.name}
        draggable={false}
        decoding="async"
        className="absolute inset-0 h-full w-full select-none object-cover"
      />
      {/* Name + warranty ride on the artwork as a soft gradient strip. */}
      <div className="absolute inset-x-0 bottom-0 flex flex-wrap items-center justify-between gap-2 bg-gradient-to-t from-black/70 via-black/35 to-transparent px-5 pb-3 pt-10">
        <div>
          <h4 className="text-lg font-black text-snow drop-shadow md:text-xl">{b.name}</h4>
          <p className="text-[11px] font-semibold text-snow/85">{b.lines}</p>
        </div>
        <span className="rounded-pill bg-snow/90 px-2.5 py-1 text-[11px] font-bold text-neem">✓ {t("brands.genuine")}</span>
      </div>
    </article>
  );
}

function BrandStage() {
  /* idx = card on stage, prev = card still sliding out. One state object so
     the interval updater stays pure. */
  const [stage, setStage] = useState<{ idx: number; prev: number | null }>({ idx: 0, prev: null });
  const pausedRef = useRef(false);
  const dragX = useRef<number | null>(null);

  /* ~1.8s per brand keeps the loop lively without feeling rushed. */
  useEffect(() => {
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      setStage((s) => ({ idx: (s.idx + 1) % BRANDS.length, prev: s.idx }));
    }, 1800);
    return () => window.clearInterval(id);
  }, []);

  /* Clear the outgoing card once its slide-out has finished. */
  useEffect(() => {
    if (stage.prev === null) return;
    const id = window.setTimeout(() => setStage((s) => ({ ...s, prev: null })), 640);
    return () => window.clearTimeout(id);
  }, [stage]);

  const jump = (i: number) => setStage((s) => (i === s.idx ? s : { idx: i, prev: s.idx }));
  const step = (dir: 1 | -1) =>
    setStage((s) => ({ idx: (s.idx + dir + BRANDS.length) % BRANDS.length, prev: s.idx }));

  return (
    <div
      onMouseEnter={() => {
        pausedRef.current = true;
      }}
      onMouseLeave={() => {
        pausedRef.current = false;
      }}
      onPointerDown={(e) => {
        dragX.current = e.clientX;
      }}
      onPointerCancel={() => {
        dragX.current = null;
      }}
      onPointerUp={(e) => {
        if (dragX.current === null) return;
        const dx = e.clientX - dragX.current;
        dragX.current = null;
        if (Math.abs(dx) > 40) step(dx < 0 ? 1 : -1);
      }}
    >
      {/* overflow-hidden clips the incoming card until it reaches the stage */}
      <div className="relative h-[400px] overflow-hidden md:h-[540px]">
        {stage.prev !== null && <BrandCard b={BRANDS[stage.prev]} leaving />}
        <BrandCard b={BRANDS[stage.idx]} />
      </div>
      <div className="mt-3 flex justify-center gap-1.5">
        {BRANDS.map((b, i) => (
          <button
            key={b.slug}
            type="button"
            aria-label={b.name}
            onClick={() => jump(i)}
            className={`h-2 rounded-pill transition-all ${i === stage.idx ? "w-6 bg-saffron" : "w-2 bg-line hover:bg-muted"}`}
          />
        ))}
      </div>
    </div>
  );
}

function Categories() {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <section id="services" className="bg-chuna px-5 py-24">
      <div className="mx-auto grid max-w-6xl items-center gap-8 lg:grid-cols-[1.6fr_1fr]">
        <BrandStage />
        <aside className="reveal">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">{t("nav.services")}</span>
          <h2 className="mt-1 text-2xl font-black text-navy md:text-3xl">{t("cats.h")}</h2>
          <p className="mt-2 text-sm text-muted">{t("cats.p")}</p>
          <p className="mt-4 text-sm font-semibold text-ink">{t("c1.points")}</p>
          <p className="mt-2 text-xs font-bold text-neem">✓ {t("brands.genuine")}</p>
          <div className="mt-5">
            <button
              type="button"
              onClick={() => router.push("/providers?q=painting")}
              className="min-h-12 rounded-control bg-saffron px-5 py-3 text-sm font-extrabold text-snow hover:shadow-lift"
            >
              🖌️ {t("svc.bookCta")}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}

function TestimonialsMarquee() {
  const { t } = useI18n();
  const cards = seed.providers.filter((p) => p.rating_avg >= 4.5);
  const loop = [...cards, ...cards];
  return (
    <section id="workers" className="overflow-hidden bg-chuna py-24">
      <div className="mx-auto max-w-6xl px-5">
        <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">Paintoor</span>
        <h2 className="mt-1 text-3xl font-black text-navy md:text-4xl">{t("marquee.h")}</h2>
        <p className="mt-2 text-sm text-muted">{t("marquee.p")}</p>
      </div>
      <div className="marquee mt-8">
        <div className="marquee-track flex gap-4 pr-4">
          {loop.map((p, i) => (
            <article key={`${p.id}-${i}`} className="w-[260px] flex-none rounded-card border border-line bg-white p-5 shadow-card md:w-[320px]">
              <div className="flex items-baseline justify-between">
                <h3 className="font-extrabold text-navy">{p.name}</h3>
                <span className="text-sm font-black text-haldi">★ {p.rating_avg}</span>
              </div>
              <p className="mt-0.5 text-xs text-muted">
                {p.city} · {p.zone} · {p.experience_years} yrs · {p.jobs_done} jobs
              </p>
              <p className="mt-3 border-l-2 border-saffron pl-2 text-sm italic text-muted">“{p.quote}”</p>
            </article>
          ))}
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
     <section ref={ref} className="esc-bg px-5 py-24">
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
          <path ref={pathRef} d="M60 220 C60 120 160 90 230 90 C300 90 400 120 400 220" stroke="#e2e4e7" strokeWidth="4" fill="none" strokeDasharray="6 8" />
          <g ref={coinRef}><circle r="16" fill="#e00048" /><text y="6" textAnchor="middle" fontSize="16" fontWeight="900" fill="#7c0028">₹</text></g>
          <rect x="200" y="60" width="60" height="60" rx="14" fill="#182028" />
          <text x="230" y="98" textAnchor="middle" fontSize="26">🔒</text>
          <g fontSize="13" fontWeight="700" fill="#243244">
            <text x="60" y="252" textAnchor="middle">Customer</text>
            <text x="230" y="146" textAnchor="middle">Escrow</text>
            <text x="400" y="252" textAnchor="middle">Worker</text>
          </g>
          <circle cx="60" cy="220" r="20" fill="#fce6ed" /><text x="60" y="227" textAnchor="middle" fontSize="18">🏠</text>
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
    <section id="why" className="bg-raatri px-5 py-24 text-snow">
      <div className="mx-auto max-w-6xl">
        <div className="reveal text-center">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-haldi">Why us</span>
          <h2 className="mt-1 text-3xl font-black md:text-4xl">{t("lens.h")}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-400">{t("lens.p")}</p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {LENSES.map((l) => (
            <div key={l.key} className="reveal rounded-sheet border border-snow/12 bg-snow/5 p-6">
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
      <StudioTeaser />
      <RoleLens />
      <EscrowFlow />
      <TestimonialsMarquee />
    </>
  );
}
