/* LandingSections — showcase-only landing (no functionality), tri-role lens,
   mobile-adaptive motion (nothing hidden, presentation adapts), i18n aware. */
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { seed } from "@paintoor/mock-api";
import { useI18n } from "@/i18n";
import { Icon, type IconName } from "@/components/Icons";
import { StudioTeaser } from "@/components/studio/StudioTeaser";
import { SnakeSpine } from "./SnakeSpine";
import { FAQS, FAQ_PICKS, FAQ_UI } from "@/lib/faq";


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

/* Paint brands our partners work with — shown as individual cards on a
   seamless horizontal marquee (same engine as the partner-review strip):
   the track holds the list twice and slides -50%, so cards flow in one
   endless line instead of one logo swapping inside a single box. Pauses on
   hover, stops entirely under prefers-reduced-motion. */
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

function BrandsMarquee() {
  const loop = [...BRANDS, ...BRANDS];
  return (
    <div className="relative mt-3">
      {/* Soft edge fades so cards emerge and retire instead of hard-clipping. */}
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 left-0 z-10 w-10 bg-gradient-to-r from-chuna to-transparent md:w-20 dark:from-raatri" />
      <span aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 z-10 w-10 bg-gradient-to-l from-chuna to-transparent md:w-20 dark:from-raatri" />
      <div className="marquee">
        <div className="marquee-track fast flex gap-4 pr-4">
          {loop.map((b, i) => (
            <article
              key={`${b.slug}-${i}`}
              className="group flex w-[150px] flex-none flex-col items-center gap-2 rounded-card border border-line bg-white px-4 py-4 shadow-card transition hover:-translate-y-1 hover:shadow-lift md:w-[180px] dark:bg-raatri"
            >
              {/* Brand logo kept small and whole: the card, not the logo, is
                  the hero now. */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={`/brands/${b.slug}.png`}
                alt={b.name}
                loading="lazy"
                decoding="async"
                draggable={false}
                className="h-12 w-auto max-w-full select-none object-contain opacity-80 transition group-hover:opacity-100 md:h-14"
              />
              <span className="text-xs font-extrabold text-navy dark:text-snow">{b.name}</span>
              <span className="text-center text-[10px] font-semibold leading-tight text-muted">{b.lines}</span>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}

function Categories() {
  const { t } = useI18n();
  const router = useRouter();
  return (
    <section id="services" className="overflow-hidden bg-chuna px-4 py-10 md:px-8 md:py-12 dark:bg-raatri">
      {/* Paintoor is the service; the brands below are the materials our
          verified partners work with. Copy leads, logos support. */}
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="mt-1 text-3xl font-black text-navy md:text-4xl dark:text-snow">{t("cats.h")}</h2>
        <p className="mt-3 text-sm leading-relaxed text-muted md:text-base">{t("cats.p")}</p>
        <p className="mt-4 text-sm font-semibold text-ink dark:text-snow">{t("c1.points")}</p>
        <p className="mt-2 text-xs font-bold text-ink dark:text-snow">
          <Icon name="check" className="mr-1.5 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("brands.genuine")}
        </p>
        <div className="mt-5">
          <button
            type="button"
            onClick={() => router.push("/partners?q=painting")}
            className="min-h-12 rounded-control bg-saffron px-6 py-3 text-sm font-extrabold text-snow hover:shadow-lift"
          >
            <Icon name="brush" className="mr-1.5 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("svc.bookCta")}
          </button>
        </div>
      </div>
      <p className="mt-8 text-center text-xs font-extrabold uppercase tracking-[0.18em] text-muted">{t("brands.with")}</p>
      <BrandsMarquee />
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
                <span className="flex items-center gap-1 text-sm font-black text-haldi"><Icon name="star" className="h-3.5 w-3.5" />{p.rating_avg}</span>
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
          <g transform="translate(230,90)" stroke="#fce6ed" strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <rect x="-11" y="-1" width="22" height="16" rx="3" />
                <path d="M-6 -1v-5a6 6 0 0 1 12 0v5" />
              </g>
          <g fontSize="13" fontWeight="700" fill="#243244">
            <text x="60" y="252" textAnchor="middle">Customer</text>
            <text x="230" y="146" textAnchor="middle">Escrow</text>
            <text x="400" y="252" textAnchor="middle">Worker</text>
          </g>
          <circle cx="60" cy="220" r="20" fill="#fce6ed" />
              <g transform="translate(60,220)" stroke="#a80036" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M-10 1 0 -8l10 9" />
                <path d="M-7 -1v10h14v-10" />
              </g>
          <circle cx="400" cy="220" r="20" fill="#FDEBDD" />
              <g transform="translate(400,220)" stroke="#b45309" strokeWidth="2.4" fill="none" strokeLinecap="round" strokeLinejoin="round">
                <path d="M-8 8 3 -3" />
                <path d="m3 -3 5 -5a1.9 1.9 0 0 1 2.6 2.6l-5 5z" />
              </g>
        </svg>
      </div>
    </section>
  );
}

function RoleLens() {
  const { t } = useI18n();
  const LENSES: { icon: IconName; key: string }[] = [
    { icon: "home", key: "l1" },
    { icon: "wrench", key: "l2" },
    { icon: "store", key: "l3" },
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
             <Icon name={l.icon} className="h-7 w-7 text-haldi" />
              <h3 className="mt-3 text-lg font-extrabold">{t(`${l.key}.t`)}</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {[1, 2, 3].map((n) => (
                  <li key={n} className="flex gap-2">
                    <Icon name="check" className="h-4 w-4 shrink-0 text-haldi" />
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
function FaqPreview() {
  const { lang } = useI18n();
  const router = useRouter();
  const ui = FAQ_UI[lang];
  const picks = FAQ_PICKS.map((id) => FAQS[lang].find((f) => f.id === id)).filter((f) => f !== undefined);
  return (
    <section id="faq" className="bg-white px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">FAQ</span>
            <h2 className="mt-1 text-3xl font-black text-navy md:text-4xl">{ui.h}</h2>
          </div>
          <p className="max-w-md text-sm text-muted">{ui.sub}</p>
        </div>
        <div className="reveal mt-8 grid gap-4 md:grid-cols-2">
          {picks.map((f) => (
            <article key={f.id} className="rounded-sheet border border-line bg-chuna p-6 shadow-card">
              <h3 className="text-base font-extrabold text-navy md:text-lg">{f.q}</h3>
              <p className="mt-2 text-sm leading-relaxed text-ink">{f.a}</p>
            </article>
          ))}
        </div>
        <div className="reveal mt-8 text-center">
          <button
            type="button"
            onClick={() => router.push("/faq")}
            className="min-h-12 rounded-control border-2 border-saffron px-6 py-3 text-sm font-extrabold text-saffron transition-colors hover:bg-saffron hover:text-snow"
          >
            {ui.seeAll} <Icon name="arrowRight" className="mr-1.5 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />
          </button>
        </div>
      </div>
    </section>
  );
}

export function LandingSections() {
  useReveal();
  return (
    <>
      <SnakeSpine />
      <Categories />
      <StudioTeaser />
      <RoleLens />
      <EscrowFlow />
      <TestimonialsMarquee />
      <FaqPreview />
    </>
  );
}
