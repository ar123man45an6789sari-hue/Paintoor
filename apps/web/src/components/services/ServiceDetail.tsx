/* ServiceDetail — one quiet, editorial explanation page per service
   (/services/interior, /services/wood …). Same silent-premium language as
   /services: hairline rows, pink eyebrow numbers, alternating white/chuna
   surfaces, real photography. It exists to build trust: what's included,
   how the job runs, what moves the price, materials & escrow, straight
   answers — then one clear CTA into the live builder with this service
   pre-selected (/services?plan=<id>#plan). Pure render: no window access,
   no dates, so nothing can drift between server and client. */
"use client";

import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SERVICES, serviceOf } from "@/lib/services";
import { Icon } from "@/components/Icons";
import { useI18n } from "@/i18n";

/* Secondary photography per service, drawn from the same /public/services set. */
const SIDE_IMG: Record<string, string> = {
  interior: "/services/hands.jpg",
  exterior: "/services/crew.jpg",
  waterproof: "/services/texture.jpg",
  wood: "/services/woodwork.jpg",
  texture: "/services/premium-still.jpg",
  refresh: "/services/after-living.jpg",
};

const FACTOR_ICONS = ["target", "brush", "layers", "store"] as const;
const PROMISE_ICONS = ["wallet", "sparkle", "box", "shield"] as const;

const eyebrow = "text-xs font-extrabold uppercase tracking-[.18em] text-saffron";

export function ServiceDetail({ id }: { id: string }) {
  const { t } = useI18n();
  const sv = SERVICES.find((s) => s.id === id);
  if (!sv) notFound();
  const service = serviceOf(id);
  const others = SERVICES.filter((s) => s.id !== id);
  const planHref = `/services?plan=${id}#plan`;

  return (
    <>
      {/* hero */}
      <section className="relative flex min-h-[74svh] flex-col overflow-hidden bg-raatri">
        <Image src={service.img} alt="" fill priority quality={85} sizes="100vw" className="object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(180deg, rgba(11,14,17,.38), rgba(11,14,17,.08) 42%, rgba(11,14,17,.76))" }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-6 border border-white/35 md:inset-10" aria-hidden="true" />
        <div className="relative mx-auto flex w-full max-w-6xl flex-1 flex-col px-4 pb-10 pt-20 md:px-8 md:pb-14">
          <Link
            href="/services"
            className="inline-flex w-fit items-center gap-2 text-[11px] font-extrabold uppercase tracking-[.22em] text-white/70 transition-colors hover:text-saffron"
          >
            <Icon name="arrowLeft" className="h-3.5 w-3.5" />
            {t("svc.d.back")}
          </Link>
          <div className="mt-auto grid gap-8 pt-10 md:grid-cols-[1fr_auto] md:items-end">
            <div className="max-w-3xl">
              <span className="inline-block rounded-pill bg-saffron/10 px-3 py-1 text-[12px] font-extrabold uppercase tracking-[.18em] text-saffron">
                {t(`svc.${id}.tag`)}
              </span>
              <h1 className="mt-4 font-black leading-[1.03] tracking-[-0.03em] text-white" style={{ fontSize: "clamp(30px,6vw,68px)" }}>
                {t(`svc.${id}.name`)}
              </h1>
              <p className="mt-4 max-w-[58ch] text-[15px] leading-relaxed text-white/80 md:text-base">{t(`svc.${id}.hero`)}</p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Link href={planHref} className="btn-pink min-h-11 w-full rounded-control bg-saffron px-5 py-2.5 text-sm font-extrabold text-snow hover:bg-[#a80036] sm:w-auto">
                  {t("svc.plan")}
                </Link>
                <Link href="/marketplace" className="btn-ghost min-h-11 w-full rounded-control border border-white/30 bg-white/10 px-5 py-2.5 text-sm font-extrabold text-white backdrop-blur hover:bg-white/20 sm:w-auto">
                  {t("svc.d.matcta")}
                </Link>
              </div>
            </div>
            <ul className="flex flex-col gap-2 text-[11px] font-extrabold uppercase tracking-[.24em] text-white/60 md:items-end md:pb-2">
              <li>₹{service.rate} {t("svc.persqft")}</li>
              <li>{t(service.dur)}</li>
              <li className="flex items-center gap-1.5 md:justify-end">
                <Icon name="star" className="h-3.5 w-3.5 text-haldi" />
                {service.rating} · {service.jobs} {t("svc.crew.jobs")}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* 01 — what's included */}
      <section className="bg-chuna py-12 md:py-20 dark:bg-raatri">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <p className={eyebrow}>01 · {t("svc.d.incl")}</p>
          <ul className="mt-6 border-t border-line">
            {[1, 2].map((n) => (
              <li key={n} className="grid grid-cols-[40px_1fr] items-start gap-3 border-b border-line py-5 md:grid-cols-[56px_1fr] md:px-2">
                <span className="pt-1 text-xs font-black text-muted">{String(n).padStart(2, "0")}</span>
                <span>
                  <span className="block font-extrabold tracking-[-0.02em] text-navy md:text-[22px] dark:text-snow">{t(`svc.${id}.i${n}`)}</span>
                  <span className="mt-1.5 block max-w-[62ch] text-sm leading-relaxed text-muted">{t(`svc.${id}.i${n}d`)}</span>
                </span>
              </li>
            ))}
            <li className="grid grid-cols-[40px_1fr] items-start gap-3 border-b border-line py-5 md:grid-cols-[56px_1fr] md:px-2">
              <span className="pt-1 text-xs font-black text-muted">03</span>
              <span>
                <span className="block font-extrabold tracking-[-0.02em] text-navy md:text-[22px] dark:text-snow">{t("svc.d.spec")}</span>
                <span className="mt-1.5 block text-sm font-bold text-muted">{t(`svc.${id}.inc`)}</span>
              </span>
            </li>
          </ul>
        </div>
      </section>

      {/* 02 — how this job runs */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <p className={eyebrow}>02 · {t("svc.d.how")}</p>
          <h2 className="mt-2 text-[24px] font-black tracking-[-0.02em] text-navy md:text-[32px] dark:text-snow">
            {t("svc.d.howsub")} <span className="text-saffron">{t(service.dur)}</span>
          </h2>
          <ol className="mt-8 grid gap-5 sm:grid-cols-2 md:grid-cols-4">
            {["svc.m1", "svc.m2", "svc.m3", "svc.m4"].map((k, i) => (
              <li key={k} className="border-t border-line pt-4">
                <p className="text-[11px] font-black uppercase tracking-[.18em] text-saffron">{String(i + 1).padStart(2, "0")}</p>
                <h3 className="mt-2 text-lg font-extrabold text-navy dark:text-snow">{t(`${k}.title`)}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{t(`${k}.desc`)}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* 03 — what the price depends on */}
      <section className="bg-chuna py-12 md:py-20 dark:bg-raatri">
        <div className="mx-auto grid max-w-6xl items-center gap-8 px-4 md:grid-cols-2 md:px-8">
          <div>
            <p className={eyebrow}>03 · {t("svc.d.price")}</p>
            <p className="mt-4 max-w-[62ch] text-sm leading-relaxed text-muted md:text-base">{t(`svc.${id}.price`)}</p>
            <p className="mt-6 text-xs font-black uppercase tracking-[.18em] text-navy dark:text-snow">{t("svc.d.factors")}</p>
            <ul className="mt-3 border-t border-line">
              {FACTOR_ICONS.map((ic, i) => (
                <li key={ic} className="flex items-start gap-3 border-b border-line py-3">
                  <Icon name={ic} className="mt-0.5 h-4 w-4 text-saffron" />
                  <span className="text-sm font-bold leading-relaxed text-ink dark:text-snow">{t(`svc.pf${i + 1}`)}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="relative aspect-[4/3] overflow-hidden rounded-sheet border border-line shadow-card">
            <Image src={SIDE_IMG[id] ?? "/services/hands.jpg"} alt="" fill quality={82} sizes="(min-width: 768px) 50vw, 92vw" className="object-cover" />
          </div>
        </div>
      </section>

      {/* 04 — materials & your money */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-[820px] px-4 md:px-8">
          <p className={eyebrow}>04 · {t("svc.d.mat")}</p>
          <ul className="mt-6 border-t border-line">
            {["svc.mat1", "svc.mat2", "svc.mat3", "svc.mat4"].map((k) => (
              <li key={k} className="border-b border-line py-4">
                <p className="text-sm font-extrabold text-navy dark:text-snow">{t(`${k}.title`)}</p>
                <p className="mt-1 max-w-[68ch] text-sm leading-relaxed text-muted">{t(`${k}.desc`)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-card bg-saffron/10 p-4 text-sm font-bold leading-relaxed text-ink dark:text-snow">{t("svc.bill.escrow")}</p>
        </div>
      </section>

      {/* 05 — straight answers */}
      <section className="bg-chuna py-12 md:py-20 dark:bg-raatri">
        <div className="mx-auto max-w-[820px] px-4 md:px-8">
          <p className={eyebrow}>05 · {t("svc.d.faq")}</p>
          <div className="mt-6 border-t border-line">
            {[
              { q: `svc.${id}.q1`, a: `svc.${id}.q1a` },
              { q: "svc.faq1q", a: "svc.faq1a" },
              { q: "svc.faq2q", a: "svc.faq2a" },
              { q: "svc.faq3q", a: "svc.faq3a" },
            ].map((row) => (
              <details key={row.q} className="svc-faq group border-b border-line">
                <summary className="flex min-h-12 items-center justify-between gap-4 py-4 text-left">
                  <span className="text-sm font-extrabold text-navy md:text-base dark:text-snow">{t(row.q)}</span>
                  <Icon name="plus" className="svc-faq-plus h-4 w-4 shrink-0 text-saffron transition-transform duration-300" />
                </summary>
                <p className="max-w-[68ch] pb-5 text-sm leading-relaxed text-muted">{t(row.a)}</p>
              </details>
            ))}
          </div>
          <p className="mt-4 text-[11px] font-black uppercase tracking-[.18em] text-navy dark:text-snow">{t("svc.guar")}</p>
          <ul className="mt-3 grid gap-3 sm:grid-cols-2">
            {(["svc.g1", "svc.g2", "svc.g3", "svc.g4"] as const).map((k, i) => (
              <li key={k} className="flex items-start gap-3 rounded-card border border-line bg-white p-4 dark:bg-raatri">
                <Icon name={PROMISE_ICONS[i]} className="mt-0.5 h-4 w-4 text-saffron" />
                <span className="text-sm font-bold leading-relaxed text-ink dark:text-snow">{t(k)}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* 06 — other services */}
      <section className="py-12 md:py-20">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <p className={eyebrow}>06 · {t("svc.d.more")}</p>
          <ul className="mt-5 border-t border-line">
            {others.map((o) => (
              <li key={o.id}>
                <Link href={`/services/${o.id}`} className="svc-row group grid grid-cols-[1fr_auto_20px] items-center gap-3 border-b border-line px-2 py-4 md:px-3">
                  <span className="truncate text-base font-extrabold text-navy transition-transform duration-300 group-hover:translate-x-2 dark:text-snow">{t(`svc.${o.id}.name`)}</span>
                  <span className="text-[13px] font-bold text-muted">₹{o.rate} {t("svc.persqft")}</span>
                  <Icon name="arrowRight" className="h-4 w-4 text-muted transition-all duration-300 group-hover:translate-x-2 group-hover:text-saffron" />
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* cta — framed, focused, same language as /services */}
      <section className="border-t border-line bg-chuna py-12 md:py-20 dark:bg-raatri">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <div className="relative overflow-hidden rounded-sheet border border-line bg-white px-6 py-10 text-center shadow-card md:px-14 md:py-14 dark:bg-navyDeep">
            <div className="pointer-events-none absolute inset-3 border border-line md:inset-5" aria-hidden="true" />
            <h2 className="font-black tracking-[-0.03em] text-navy dark:text-snow" style={{ fontSize: "clamp(28px,4.6vw,58px)" }}>{t("svc.d.cta")}</h2>
            <p className="mx-auto mt-3 max-w-[46ch] text-[15px] text-muted md:text-base">{t("svc.d.ctalede")}</p>
            <div className="mt-7 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
              <Link href={planHref} className="btn-pink min-h-12 rounded-control bg-saffron px-7 py-3 text-sm font-extrabold text-snow hover:bg-[#a80036]">
                {t("svc.plan")}
              </Link>
              <Link href="/services" className="btn-ghost min-h-12 rounded-control border border-line px-7 py-3 text-sm font-extrabold text-ink hover:border-saffron hover:text-saffron dark:text-snow">
                {t("svc.d.back")}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}