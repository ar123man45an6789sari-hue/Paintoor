/* LandingSections v1 — cinematic sections ported from prototype v0.2,
   plus the tri-role lens that explains the whole marketplace in one screen. */
"use client";

import { useEffect, useRef, useState } from "react";
import { seed } from "@gharsahayak/mock-api";

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

const ACTS = [
  { n: "ACT 1 · REQUEST", h: "“I need my bedroom painted”", p: "A photo, an area, a budget — posted in two minutes. No calls, no chaos." },
  { n: "ACT 2 · CHOICE", h: "Six painters, full profiles", p: "Ratings, past-work photos, rate ranges, distance — compared, then chosen by the customer." },
  { n: "ACT 3 · QUOTE", h: "Itemized quote — no hidden costs", p: "Labour + material with store names + GST. What you see is what you pay." },
  { n: "ACT 4 · SAFE PAY", h: "Money locked, work begins", p: "The advance sits in escrow until the customer approves the work." },
  { n: "ACT 5 · DELIGHT", h: "Approve the work, release the pay", p: "Checklist ticked, balance released, invoice and warranty issued." },
];

function StoryPin() {
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
    <section ref={ref} className="ls-story">
      <div className="ls-pin">
        <div className="ls-head">
          <h2 className="text-3xl font-black text-navy md:text-4xl">One painting job, start to finish — in 10 seconds</h2>
          <p className="mt-1 text-muted">Keep scrolling · each act changes on its own</p>
        </div>

        {ACTS.map((a, i) => (
          <div key={a.n} className={`act-copy ${i === act ? "on" : ""}`}>
            <span className="text-xs font-black tracking-[0.16em] text-saffron">{a.n}</span>
            <h3 className="mt-2 text-2xl font-black text-navy md:text-3xl">{a.h}</h3>
            <p className="mt-2 text-muted">{a.p}</p>
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
          {ACTS.map((_, i) => (
            <i key={i} className={i === act ? "on" : ""} />
          ))}
        </div>
      </div>
    </section>
  );
}

const CATS = [
  { icon: "🎨", t: "Painting", r: "From ₹16/sqft · Vadodara range ₹16-28" },
  { icon: "⚡", t: "Electrical", r: "Visit ₹199 (adjusted in quote)" },
  { icon: "🚿", t: "Plumbing", r: "Leaks to full bathroom fittings" },
  { icon: "🪚", t: "Carpentry", r: "Furniture, wardrobe, door repair" },
  { icon: "🧽", t: "Cleaning", r: "Deep clean, sofa, water tank" },
  { icon: "❄️", t: "AC & Appliances", r: "Service · gas · repair" },
];

function Categories() {
  return (
    <section id="services" className="bg-chuna px-5 py-24">
      <div className="mx-auto max-w-6xl">
        <div className="reveal flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">Services</span>
            <h2 className="mt-1 text-3xl font-black text-navy md:text-4xl">Everything your home needs</h2>
          </div>
          <p className="max-w-md text-sm text-muted">Verified workers, fair rate ranges and quality checklists in every category — clear before you book.</p>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {CATS.map((c) => (
            <div key={c.t} className="reveal rounded-card border border-line bg-white p-6 transition-all hover:-translate-y-1.5 hover:shadow-card">
              <div className="flex h-13 w-13 items-center justify-center rounded-control bg-[#EAF3FC] text-2xl">{c.icon}</div>
              <h3 className="mt-3 font-extrabold text-navy">{c.t}</h3>
              <p className="mt-1 text-xs text-muted">{c.r}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function RateRadar() {
  const [area, setArea] = useState(320);
  const [finish, setFinish] = useState("18,24");
  const chartRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add("in");
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const [lo, hi] = finish.split(",").map(Number);
  const inr = (n: number) => "₹" + n.toLocaleString("en-IN");

  return (
    <section id="rate-radar" className="bg-navy px-5 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-haldi">Transparency</span>
        <h2 className="mt-1 text-3xl font-black md:text-4xl">Rate Radar — the right price, not just a cheap one</h2>
        <p className="mt-2 max-w-xl text-sm text-blue-100">Fair ranges computed from real completed bookings in Vadodara. Move the slider — no forms, no calls.</p>
        <div className="mt-8 grid items-center gap-8 md:grid-cols-2">
          <div className="reveal rounded-sheet border border-white/15 bg-white/5 p-6">
            <label className="block text-xs font-bold text-blue-100" htmlFor="rr-area">
              Paintable area (sqft): <b className="text-white">{area}</b>
            </label>
            <input id="rr-area" type="range" min={100} max={2000} step={20} value={area} onChange={(e) => setArea(+e.target.value)} className="mt-2 w-full accent-haldi" />
            <label className="mt-4 block text-xs font-bold text-blue-100" htmlFor="rr-finish">Finish</label>
            <select id="rr-finish" value={finish} onChange={(e) => setFinish(e.target.value)} className="mt-2 w-full rounded-control border border-white/25 bg-white/10 px-3 py-2.5 text-sm text-white outline-none">
              <option value="14,18">Economy (distemper)</option>
              <option value="18,24">Standard (emulsion)</option>
              <option value="24,32">Premium (royale / texture)</option>
            </select>
            <p className="mt-5 text-sm text-blue-100">
              Your fair range (material extra):
              <span className="mt-1 block text-3xl font-black text-haldi">{inr(area * lo)} – {inr(area * hi)}</span>
            </p>
          </div>
          <svg ref={chartRef} className="chart2 reveal" viewBox="0 0 460 240" aria-label="Rate trend chart">
            <path d="M20 190 C90 170 130 150 190 140 C260 128 320 118 440 96 L440 220 L20 220 Z" fill="rgba(255,176,58,.14)" />
            <path className="line" d="M20 190 C90 170 130 150 190 140 C260 128 320 118 440 96" />
            <g fontSize="11" fill="#8FA9C6">
              <text x="20" y="212">Jan</text><text x="120" y="212">Apr</text><text x="230" y="212">Jul</text><text x="340" y="212">Oct</text>
            </g>
          </svg>
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
      const max = track.scrollWidth - window.innerWidth + 44;
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
          <h2 className="text-3xl font-black text-navy md:text-4xl">Not “workers” — skilled sahayaks of your city</h2>
          <p className="mt-1 text-muted">Scroll — real faces, real work, real reviews from Vadodara</p>
        </div>
        <div ref={trackRef} className="flex gap-5 pl-6 will-change-transform md:pl-[max(24px,calc((100vw-1120px)/2+24px))]">
          {seed.providers.map((p, i) => {
            const [from, to] = GRADIENTS[i % GRADIENTS.length];
            return (
              <article key={p.id} className="w-[290px] flex-none overflow-hidden rounded-card border border-line bg-white shadow-card">
                <div className="flex h-28 items-center justify-center text-5xl font-black text-white" style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}>
                  {p.name.charAt(0)}
                </div>
                <div className="p-4">
                  <div className="flex items-baseline justify-between">
                    <h3 className="font-extrabold text-navy">{p.name}</h3>
                    <span className="text-sm font-black text-haldi">★ {p.rating_avg}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">{p.zone} · {p.experience_years} yrs · {p.jobs_done} jobs</p>
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
    { h: "1 · You pay", p: "The advance goes straight to escrow (RBI-authorised partner) — never into our account." },
    { h: "2 · Work happens", p: "OTP start, photo milestones. You approve every step." },
    { h: "3 · Approve → release", p: "Only your yes moves the money. Not happy? Dispute desk stands with you." },
  ];

  return (
    <section ref={ref} className="px-5 py-24" style={{ background: "linear-gradient(180deg,#FDFDFB,#EFF4F9)" }}>
      <div className="mx-auto grid max-w-6xl items-center gap-10 md:grid-cols-2">
        <div className="reveal">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">Where your money goes</span>
          <h2 className="mt-1 text-3xl font-black text-navy md:text-4xl">Escrow — locked until you love the work</h2>
          <div className="mt-6 space-y-3">
            {STEPS.map((s, i) => (
              <div key={s.h} className={`rounded-card border bg-white p-4 transition-all ${i === step ? "border-saffron shadow-card translate-x-1" : "border-line opacity-50"}`}>
                <h3 className="font-extrabold text-navy">{s.h}</h3>
                <p className="text-sm text-muted">{s.p}</p>
              </div>
            ))}
          </div>
        </div>
        <svg viewBox="0 0 460 300" className="reveal" aria-label="Escrow flow">
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

const LENSES = [
  {
    emoji: "🏠",
    title: "For customers",
    points: ["Post with photos, voice or text", "Compare verified profiles & itemized quotes", "Pay into escrow, approve to release", "Invoice + warranty on every single job"],
  },
  {
    emoji: "🔧",
    title: "For skilled workers",
    points: ["Leads from your zone and your skill", "AI-assisted itemized quotes in minutes", "On-time payouts — no udhaar, no chasing", "A Skill Passport that grows with every job"],
  },
  {
    emoji: "🏪",
    title: "For stores",
    points: ["Catalog online, orders from nearby jobs", "Your live prices flow into every quote", "Deliveries and settlements fully tracked", "New customers without spending on ads"],
  },
];

function RoleLens() {
  return (
    <section className="bg-raatri px-5 py-24 text-white">
      <div className="mx-auto max-w-6xl">
        <div className="reveal text-center">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-haldi">The whole picture</span>
          <h2 className="mt-1 text-3xl font-black md:text-4xl">One platform, three lenses</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-slate-400">
            GharSahayak connects three worlds that need each other — and everything links up:
            a worker who joins today appears in a customer&apos;s search tomorrow; a store&apos;s
            prices flow into every quote the same week.
          </p>
        </div>
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {LENSES.map((l) => (
            <div key={l.title} className="reveal rounded-sheet border border-white/12 bg-white/5 p-6">
              <div className="text-3xl">{l.emoji}</div>
              <h3 className="mt-3 text-lg font-extrabold">{l.title}</h3>
              <ul className="mt-3 space-y-2 text-sm text-slate-300">
                {l.points.map((pt) => (
                  <li key={pt} className="flex gap-2"><span className="text-haldi">✓</span>{pt}</li>
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
      <RateRadar />
      <WorkersBand />
      <EscrowFlow />
      <RoleLens />
    </>
  );
}