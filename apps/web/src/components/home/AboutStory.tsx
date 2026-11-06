/* About page: story-driven brand page. Hero and CTA bands stay dark in both
   themes, so every colour sitting on them is a constant (snow/saffron),
   never a theme-flipping token. */
"use client";

import Image from "next/image";
import Link from "next/link";
import { useI18n } from "@/i18n";
import { company } from "@paintoor/brand";

function Icon({ path, extra }: { path: string; extra?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5" aria-hidden="true">
      <path d={path} />
      {extra ? <path d={extra} /> : null}
    </svg>
  );
}

const VALUES = [
  { key: "v1", icon: <Icon path="M12 3l8 3v6c0 4.5-3.2 7.8-8 9-4.8-1.2-8-4.5-8-9V6l8-3z" extra="M9 12l2 2 4-4" /> },
  { key: "v2", icon: <Icon path="M6 2h12v20l-2-1.5L14 22l-2-1.5L10 22l-2-1.5L6 22V2z" extra="M9 7h6M9 11h6M9 15h4" /> },
  { key: "v3", icon: <Icon path="M5 11h14v10H5V11z" extra="M8 11V7a4 4 0 0 1 8 0v4" /> },
  { key: "v4", icon: <Icon path="M12 3l2.7 5.8 6.3.8-4.6 4.3 1.2 6.1L12 17l-5.6 3 1.2-6.1L3 9.6l6.3-.8L12 3z" /> },
];

const MILESTONES = [
  { key: "t1", live: true },
  { key: "t2", live: false },
  { key: "t3", live: false },
];

export function AboutStory() {
  const { t } = useI18n();
  return (
    <div>
      {/* 1 — full-bleed hero; text is always light because the image is dark */}
      <div className="relative h-[60vh] min-h-[420px] w-full overflow-hidden bg-raatri">
        <Image src="/about/hero.jpg" alt="" fill priority sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-black/10" />
        <div className="absolute inset-x-0 bottom-0 px-4 pb-10 md:px-8 md:pb-14">
          <div className="mx-auto max-w-6xl">
            <span className="inline-block rounded-pill bg-saffron px-4 py-1.5 text-xs font-extrabold uppercase tracking-[0.16em] text-snow">
              {t("ab.tag")}
            </span>
            <h1 className="mt-4 max-w-3xl text-4xl font-black leading-tight text-snow md:text-6xl">{t("ab.h")}</h1>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-3xl px-4 pt-10 text-center md:pt-14">
        <p className="text-lg leading-relaxed text-muted">{t("ab.sub")}</p>
        <p className="mt-4 text-sm font-extrabold text-saffron">{t("ab.meta")}</p>
      </div>

      {/* 2 — origin story: 60/40 two columns with a pull-quote card */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        <div className="grid gap-8 md:grid-cols-5 md:gap-12">
          <div className="md:col-span-3">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">{t("ab.whyTag")}</span>
            <h2 className="mt-3 text-3xl font-black text-navy md:text-4xl">{t("ab.whyH")}</h2>
            <p className="mt-5 leading-relaxed text-muted">{t("ab.whyP1")}</p>
            <p className="mt-4 leading-relaxed text-muted">{t("ab.whyP2")}</p>
          </div>
          <div className="md:col-span-2">
            <figure className="rounded-card border border-line border-l-4 border-l-saffron bg-chuna p-6 md:p-8">
              <blockquote className="font-serif text-lg italic leading-relaxed text-ink">“{t("ab.quote")}”</blockquote>
              <figcaption className="mt-4 text-xs font-extrabold uppercase tracking-[0.16em] text-muted">Paintoor</figcaption>
            </figure>
          </div>
        </div>
      </section>

      {/* 3 — values grid */}
      <section className="bg-chuna px-4 py-16 md:px-8 md:py-24">
        <div className="mx-auto max-w-6xl">
          <div className="text-center">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">{t("ab.valTag")}</span>
            <h2 className="mt-3 text-3xl font-black text-navy md:text-4xl">{t("ab.valH")}</h2>
          </div>
          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            {VALUES.map((v, i) => (
              <div key={v.key} className="rounded-card border border-line bg-white p-6 shadow-card md:p-7">
                <span className="flex h-11 w-11 items-center justify-center rounded-control bg-saffron/10 text-saffron">
                  {VALUES[i].icon}
                </span>
                <h3 className="mt-4 font-extrabold text-navy">{t(`ab.${v.key}t`)}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted">{t(`ab.${v.key}p`)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 4 — craft break: always-dark card, image first on every screen */}
      <section className="mx-auto max-w-6xl px-4 py-16 md:px-8 md:py-24">
        <div className="grid overflow-hidden rounded-sheet bg-raatri md:grid-cols-5">
          <div className="relative min-h-[240px] md:col-span-2 md:min-h-[360px]">
            <Image src="/about/craft.jpg" alt="" fill sizes="(max-width: 768px) 100vw, 40vw" className="object-cover" />
          </div>
          <div className="p-7 md:col-span-3 md:p-12">
            <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">{t("ab.craftTag")}</span>
            <p className="mt-4 leading-relaxed text-snow/85">{t("ab.craftP")}</p>
          </div>
        </div>
      </section>

      {/* 5 — roadmap timeline */}
      <section className="mx-auto max-w-4xl px-4 pb-16 md:px-8 md:pb-24">
        <div className="text-center">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">{t("ab.roadTag")}</span>
          <h2 className="mt-3 text-3xl font-black text-navy md:text-4xl">{t("ab.roadH")}</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted">{t("ab.roadSub")}</p>
        </div>
        <ol className="relative ml-2 mt-12 space-y-10 border-l-2 border-line pl-8">
          {MILESTONES.map((m) => (
            <li key={m.key} className="relative">
              <span
                className={
                  m.live
                    ? "absolute -left-[41px] top-1 h-4 w-4 rounded-full bg-saffron"
                    : "absolute -left-[41px] top-1 h-4 w-4 rounded-full border-2 border-muted bg-chuna"
                }
                aria-hidden="true"
              />
              <span className={`text-xs font-extrabold uppercase tracking-[0.16em] ${m.live ? "text-saffron" : "text-muted"}`}>
                {t(`ab.${m.key}tag`)}
              </span>
              <h3 className="mt-1 text-xl font-extrabold text-navy">{t(`ab.${m.key}h`)}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted">{t(`ab.${m.key}p`)}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 6 — registered entity card */}
      <section className="mx-auto max-w-4xl px-4 pb-16 md:px-8 md:pb-24">
        <div className="rounded-card border border-line bg-white p-6 shadow-card md:p-8">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">{t("ab.entH")}</span>
          <p className="mt-3 text-sm text-muted">{t("ab.entSub")}</p>
          <h3 className="mt-4 text-lg font-extrabold text-navy">{company.legalName}</h3>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            <li className="flex items-start gap-3">
              <span className="mt-0.5 text-saffron"><Icon path="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" extra="M12 12a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" /></span>
              <span>{company.registeredAddress}</span>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-saffron"><Icon path="M5 4h4l2 5-2.5 1.5a12 12 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2z" /></span>
              <a className="font-semibold text-ink hover:text-saffron" href={`tel:${company.phoneTel}`}>{company.phoneDisplay}</a>
            </li>
            <li className="flex items-center gap-3">
              <span className="text-saffron"><Icon path="M4 6h16v12H4V6z" extra="M4 7l8 6 8-6" /></span>
              <a className="font-semibold text-ink hover:text-saffron" href={`mailto:${company.emails.support}`}>{company.emails.support}</a>
            </li>
          </ul>
                    <h4 className="mt-6 text-xs font-extrabold uppercase tracking-[0.16em] text-saffron">{t("ab.mailH")}</h4>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(company.emails).map(([role, mail]) => (
              <a
                key={role}
                href={`mailto:${mail}`}
                className="rounded-pill border border-line px-2.5 py-1 text-xs font-bold text-ink hover:border-saffron hover:text-saffron"
              >
                {mail}
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* 7 — closing CTA band: always dark, so text stays light in both themes */}
      <section className="mx-auto max-w-6xl px-4 pb-16 md:px-8 md:pb-24">
        <div className="relative overflow-hidden rounded-sheet bg-raatri px-6 py-16 text-center md:py-20">
          <span className="pointer-events-none absolute -left-12 -top-12 h-56 w-56 rounded-full bg-saffron/25 blur-3xl" aria-hidden="true" />
          <span className="pointer-events-none absolute -bottom-16 -right-12 h-56 w-56 rounded-full bg-saffron/20 blur-3xl" aria-hidden="true" />
          <h2 className="relative text-3xl font-black text-snow md:text-4xl">{t("ab.ctaH")}</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-snow/75">{t("ab.ctaP")}</p>
          <div className="relative mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link href="/partners" className="rounded-control bg-saffron px-6 py-3 text-sm font-extrabold text-snow transition-transform hover:-translate-y-0.5 hover:shadow-lift">
              {t("ab.cta1")}
            </Link>
            <Link href="/#how" className="rounded-control border-2 border-snow/40 px-6 py-3 text-sm font-extrabold text-snow transition-colors hover:border-snow">
              {t("ab.cta2")}
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}