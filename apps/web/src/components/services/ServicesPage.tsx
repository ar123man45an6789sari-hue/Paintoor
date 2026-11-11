/* ServicesPage — the approved "silent / premium" editorial layout rebuilt on
   Paintoor tokens: full-bleed hero, hairline service index whose rows link to
   a per-service explanation page, quote band with soft parallax, method
   columns, materials spread, and then the live BOQ builder + slot booking.
   ?plan=<id> pre-selects a service in the builder. */
"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { SERVICES, readBookings, saveBookings, type Booking } from "@/lib/services";
import { Icon } from "@/components/Icons";
import { useI18n } from "@/i18n";
import { ServiceBuilder } from "./ServiceBuilder";

const METHOD = [
  { img: "/services/hands.jpg", key: "svc.m1" },
  { img: "/services/crew.jpg", key: "svc.m2" },
  { img: "/services/after-bedroom.jpg", key: "svc.m3" },
  { img: "/services/woodwork.jpg", key: "svc.m4" },
];

const eyebrow = "text-xs font-extrabold uppercase tracking-[.18em] text-saffron";

export function ServicesPage() {
  const { t } = useI18n();
  const [svcId, setSvcId] = useState("interior");
  const [bookings, setBookings] = useState<Booking[]>([]);
  const bandSecRef = useRef<HTMLElement>(null);
  const bandRef = useRef<HTMLDivElement>(null);

  const go = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

  useEffect(() => {
    /* Deep link from a service page: /services?plan=exterior#plan — read after
       mount so the server render stays identical (no useSearchParams bailout). */
    const p = new URLSearchParams(window.location.search).get("plan");
    if (p && SERVICES.some((s) => s.id === p)) setSvcId(p);
    setBookings(readBookings());
    const refresh = () => setBookings(readBookings());
    window.addEventListener("pt:booked", refresh);
    window.addEventListener("storage", refresh);
    return () => { window.removeEventListener("pt:booked", refresh); window.removeEventListener("storage", refresh); };
  }, []);

  /* Quote band parallax: ±4.5% of the section's distance from viewport mid. */
  useEffect(() => {
    let raf = 0;
    const paint = () => {
      raf = 0;
      const sec = bandSecRef.current;
      const inner = bandRef.current;
      if (!sec || !inner) return;
      const r = sec.getBoundingClientRect();
      const off = (window.innerHeight / 2 - (r.top + r.height / 2)) * 0.045;
      inner.style.transform = `translateY(${off.toFixed(1)}px)`;
    };
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(paint); };
    window.addEventListener("scroll", onScroll, { passive: true });
    paint();
    return () => { window.removeEventListener("scroll", onScroll); if (raf) cancelAnimationFrame(raf); };
  }, []);

  const cancel = (id: string) => {
    const next = readBookings().filter((b) => b.id !== id);
    saveBookings(next);
    setBookings(next);
  };

  return (
    <>
      {/* (a) hero */}
      <section className="relative flex min-h-[92svh] flex-col overflow-hidden bg-raatri">
        <Image src="/services/hallway.jpg" alt="" fill priority quality={85} sizes="100vw" className="object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(11,14,17,.42), rgba(11,14,17,.10) 45%, rgba(11,14,17,.72))" }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-6 border border-white/35 md:inset-10" aria-hidden="true" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col justify-end px-4 pb-14 pt-28 md:flex-row md:items-end md:justify-between md:px-8 md:pb-16">
          <div className="max-w-3xl">
            <span className="inline-block rounded-pill bg-saffron/10 px-3 py-1 text-[12px] font-extrabold uppercase tracking-[.18em] text-saffron">{t("svc.eyebrow")}</span>
            <h1 className="mt-4 font-black leading-[1.02] tracking-[-0.03em] text-white" style={{ fontSize: "clamp(34px,7vw,86px)" }}>
              {t("svc.h1a")} <span className="text-saffron">{t("svc.h1b")}</span>{t("svc.h1c")}
            </h1>
            <p className="mt-5 max-w-[52ch] text-[15px] leading-relaxed text-white/80 md:text-base">{t("svc.hero.lede")}</p>
            <div className="mt-8 flex flex-wrap gap-3">
              <button type="button" onClick={() => go("plan")} className="btn-pink min-h-11 w-full rounded-control bg-saffron px-5 py-2.5 text-sm font-extrabold text-snow hover:bg-[#a80036] sm:w-auto">
                {t("svc.cta1")}
              </button>
              <button type="button" onClick={() => go("method")} className="btn-ghost min-h-11 w-full rounded-control border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-extrabold text-white backdrop-blur hover:bg-white/20 sm:w-auto">
                {t("svc.cta2")}
              </button>
            </div>
          </div>
          <ul className="mt-10 flex flex-col gap-2 text-[11px] font-extrabold uppercase tracking-[.24em] text-white/60 md:items-end md:pb-2">
            <li>{t("svc.meta1")}</li>
            <li>{t("svc.meta2")}</li>
            <li>{t("svc.meta3")}</li>
          </ul>
        </div>
      </section>

      {/* (b) 01 — services index: every row opens its own explanation page */}
      <section className="bg-chuna py-12 md:py-20 dark:bg-raatri">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <p className={eyebrow}>01 · {t("svc.eyebrow.index")}</p>
          <h2 className="mt-2 text-[26px] font-black tracking-[-0.02em] text-navy md:text-[34px] dark:text-snow">{t("svc.index.title")}</h2>
          <p className="mt-3 max-w-[62ch] text-[15px] leading-relaxed text-muted md:text-base">{t("svc.lede")}</p>
          <ul className="mt-8 border-t border-line">
            {SERVICES.map((sv, i) => (
              <li key={sv.id}>
                <Link href={`/services/${sv.id}`} className="svc-row group grid w-full grid-cols-[40px_1fr_20px] items-center gap-3 border-b border-line px-2 py-4 md:grid-cols-[56px_1fr_130px_110px_26px] md:px-4 md:py-5">
                  <span className="text-xs font-black text-muted">{String(i + 1).padStart(2, "0")}</span>
                  <span className="relative min-w-0">
                    <span className="absolute -left-3 top-[1.3em] h-[5px] w-[5px] rounded-full bg-saffron opacity-0 transition-opacity group-hover:opacity-100" aria-hidden="true" />
                    <span className="block truncate font-extrabold tracking-[-0.02em] text-navy transition-transform duration-300 group-hover:translate-x-3 dark:text-snow" style={{ fontSize: "clamp(20px,2.4vw,30px)" }}>
                      {t(`svc.${sv.id}.name`)}
                    </span>
                    <span className="mt-1 block truncate text-[12px] font-bold text-muted md:text-[13px]">₹{sv.rate} {t("svc.persqft")} · {t(sv.dur)} · {t(`svc.${sv.id}.inc`)}</span>
                  </span>
                  <span className="hidden text-[13px] font-bold text-muted md:block">₹{sv.rate} {t("svc.persqft")}</span>
                  <span className="hidden text-[11px] font-black uppercase tracking-[.18em] text-muted md:block">{t(sv.dur)}</span>
                  <Icon name="arrowRight" className="h-4 w-4 text-muted transition-all duration-300 group-hover:translate-x-2 group-hover:text-saffron" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* (c) quote band */}
      <section ref={bandSecRef} className="relative min-h-[58vh] overflow-hidden bg-raatri">
        <div ref={bandRef} className="absolute inset-x-0 -inset-y-[12%]">
          <Image src="/services/premium-corner.jpg" alt="" fill quality={85} sizes="100vw" className="object-cover" />
        </div>
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(11,14,17,.25), rgba(11,14,17,.52))" }}
          aria-hidden="true"
        />
        <div className="relative flex min-h-[58vh] items-center justify-center px-4 py-16 md:px-8">
          <blockquote className="max-w-4xl text-center font-extrabold italic leading-[1.25] tracking-[-0.02em] text-white" style={{ fontSize: "clamp(24px,3.6vw,44px)" }}>
            “{t("svc.quote")}”
            <footer className="mt-6 text-[11px] font-black not-italic uppercase tracking-[.24em] text-white/60">{t("svc.quote.by")}</footer>
          </blockquote>
        </div>
      </section>

      {/* (d) 02 — method */}
      <section id="method" className="scroll-mt-20 py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <p className={eyebrow}>02 · {t("svc.eyebrow.method")}</p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 md:grid-cols-4">
            {METHOD.map((m, i) => (
              <div key={m.key} className={i === 1 ? "md:mt-14" : ""}>
                <div className="relative aspect-[4/5] overflow-hidden rounded-card border border-line shadow-card">
                  <Image src={m.img} alt="" fill sizes="(min-width: 768px) 25vw, 50vw" className="object-cover" />
                </div>
                <p className="mt-4 text-[11px] font-black uppercase tracking-[.18em] text-saffron">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-1 text-lg font-extrabold text-navy dark:text-snow">{t(`${m.key}.title`)}</h3>
                <p className="mt-1 text-sm leading-relaxed text-muted">{t(`${m.key}.desc`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* (e) 03 — materials */}
      <section className="bg-chuna py-12 md:py-20 dark:bg-raatri">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 md:grid-cols-2 md:px-8">
          <div className="relative aspect-[4/3] overflow-hidden rounded-sheet border border-line shadow-card">
            <Image src="/services/premium-still.jpg" alt="" fill sizes="(min-width: 768px) 50vw, 92vw" className="object-cover" />
          </div>
          <div>
            <p className={eyebrow}>03 · {t("svc.eyebrow.material")}</p>
            <ul className="mt-5 border-t border-line">
              {(["svc.mat1", "svc.mat2", "svc.mat3", "svc.mat4"] as const).map((k) => (
                <li key={k} className="border-b border-line py-3.5">
                  <p className="text-sm font-extrabold text-navy dark:text-snow">{t(`${k}.title`)}</p>
                  <p className="mt-1 text-sm leading-relaxed text-muted">{t(`${k}.desc`)}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* (f) 04 — live builder + booking (this section already shows the bill) */}
      <section id="plan" className="scroll-mt-20 border-t border-line py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <p className={eyebrow}>04 · {t("svc.eyebrow.plan")}</p>
          <h2 className="mt-2 text-[26px] font-black tracking-[-0.02em] text-navy md:text-[34px] dark:text-snow">{t("svc.boq")}</h2>
          <p className="mb-6 mt-3 max-w-[62ch] text-[15px] leading-relaxed text-muted md:text-base">{t("svc.sub")}</p>
          <ServiceBuilder svcId={svcId} onSvc={setSvcId} />
        </div>
        {bookings.length > 0 && (
          <div className="mx-auto max-w-6xl px-4 pt-8 md:px-8">
            <h3 className="text-[20px] font-black text-navy md:text-[24px] dark:text-snow">{t("svc.bk.yours")}</h3>
            <div className="mk-rail mt-4">
              {bookings.map((b) => (
                <article key={b.id} className="w-[260px] flex-none rounded-card border border-line bg-white p-4 shadow-card dark:bg-raatri">
                  <p className="flex items-center justify-between gap-2 text-xs font-black text-saffron">
                    <span>{b.id}</span>
                    <span className="rounded-pill bg-[#0e9f8a]/10 px-2 py-0.5 text-[10px] text-[#0e9f8a]">{t("svc.bk.scheduled")}</span>
                  </p>
                  <p className="mt-2 text-sm font-extrabold text-navy dark:text-snow">{t(`svc.${b.svc}.name`)}</p>
                  <p className="mt-1 text-xs text-muted">{b.slot} · {t(`svc.${b.part}`)} · {t("svc.crewOf")} {b.crew}</p>
                  <p className="mt-1 text-sm font-black text-ink dark:text-snow">₹{b.total.toLocaleString("en-IN")}</p>
                  <button type="button" onClick={() => cancel(b.id)} className="mt-3 min-h-9 rounded-control border border-line px-3 py-1.5 text-xs font-extrabold text-muted transition-colors hover:border-danger hover:text-danger">
                    {t("svc.bk.cancel")}
                  </button>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* (g) cta — one focused, framed call to action */}
      <section className="border-t border-line bg-chuna py-12 md:py-24 dark:bg-raatri">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="relative overflow-hidden rounded-sheet border border-line bg-white px-6 py-12 text-center shadow-card md:px-16 md:py-16 dark:bg-navyDeep">
            <div className="pointer-events-none absolute inset-3 border border-line md:inset-5" aria-hidden="true" />
            <h2 className="font-black tracking-[-0.03em] text-navy dark:text-snow" style={{ fontSize: "clamp(32px,5.4vw,64px)" }}>{t("svc.cta.title")}</h2>
            <p className="mx-auto mt-3 max-w-[46ch] text-[15px] text-muted md:text-base">{t("svc.cta.lede")}</p>
            <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <button type="button" onClick={() => go("plan")} className="btn-pink min-h-12 rounded-control bg-saffron px-7 py-3 text-sm font-extrabold text-snow hover:bg-[#a80036]">
                {t("svc.cta.a")}
              </button>
              <Link href="/marketplace" className="btn-ghost min-h-12 rounded-control border border-line px-7 py-3 text-sm font-extrabold text-ink hover:border-saffron hover:text-saffron dark:text-snow">
                {t("svc.cta.b")}
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] font-extrabold uppercase tracking-[.18em] text-muted">
              <li className="flex items-center gap-1.5"><Icon name="wallet" className="h-3.5 w-3.5 text-saffron" />{t("svc.g1")}</li>
              <li className="flex items-center gap-1.5"><Icon name="box" className="h-3.5 w-3.5 text-saffron" />{t("svc.g3")}</li>
              <li className="flex items-center gap-1.5"><Icon name="shield" className="h-3.5 w-3.5 text-saffron" />{t("svc.g4")}</li>
            </ul>
          </div>
        </div>
      </section>
    </>
  );
}