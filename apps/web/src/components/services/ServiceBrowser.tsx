/* Services page body — labour catalogue with rate cards, the live BOQ
   builder, verified crew, the Paintoor promise and FAQs. Everything is
   showcase data from lib/services; booking slots land in Part 2. */
"use client";

import { useRef, useState } from "react";
import { SERVICES, CREWS } from "@/lib/services";
import { Icon } from "@/components/Icons";
import { useI18n } from "@/i18n";
import { ServiceBuilder } from "./ServiceBuilder";

export function ServiceBrowser() {
  const { t } = useI18n();
  const [svcId, setSvcId] = useState("interior");
  const builderRef = useRef<HTMLDivElement>(null);
  const plan = (id: string) => {
    setSvcId(id);
    builderRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <>
      <section className="border-b border-line bg-chuna px-4 pb-10 pt-12 md:px-8 md:pt-16 dark:bg-raatri">
        <div className="mx-auto max-w-6xl">
          <span className="inline-block rounded-pill bg-saffron/10 px-4 py-1.5 text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("svc.eyebrow")}</span>
          <h1 className="mt-2 text-4xl font-black text-navy dark:text-snow">{t("svc.h1")}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted md:text-base">{t("svc.sub")}</p>
          <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-xs font-extrabold text-ink dark:text-snow">
            {([["lock", t("mk.trust.escrow")], ["box", t("svc.trust.leftover")], ["spray", t("svc.trust.cleanup")], ["brush", t("svc.trust.touchup")]] as const).map(([ic, label]) => (
              <li key={label} className="flex items-center gap-1.5"><Icon name={ic} className="h-3.5 w-3.5 text-saffron" />{label}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <h2 className="text-[22px] font-black text-navy md:text-[26px] dark:text-snow">{t("svc.cards")}</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {SERVICES.map((sv) => (
            <article key={sv.id} className="flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition-all hover:-translate-y-1 hover:border-saffron dark:bg-raatri">
              <div className="relative h-24" style={{ backgroundImage: `linear-gradient(135deg, ${sv.grad[0]}, ${sv.grad[1]})` }}>
                <span className="absolute left-3 top-3 rounded-pill bg-white/90 px-2 py-0.5 text-xs font-black text-ink">₹{sv.rate}/sq ft</span>
                <span className="absolute right-3 top-3 flex items-center gap-1 rounded-pill bg-white/90 px-2 py-0.5 text-xs font-black text-haldi">
                  <Icon name="star" className="h-3 w-3" />{sv.rating}
                </span>
              </div>
              <div className="flex flex-1 flex-col p-4">
                <h3 className="text-[15px] font-extrabold text-navy dark:text-snow">{t(`svc.${sv.id}.name`)}</h3>
                <p className="mt-1 text-xs text-muted">{t(`svc.${sv.id}.desc`)}</p>
                <p className="mt-2 text-xs font-bold text-ink dark:text-snow">{t(`svc.${sv.id}.inc`)}</p>
                <p className="mt-1 flex items-center gap-1 text-xs text-muted">
                  <Icon name="shield" className="h-3 w-3 text-saffron" />{sv.jobs} {t("svc.crew.jobs")} · {t("svc.crew.verified")}
                </p>
                <button type="button" onClick={() => plan(sv.id)} className="mt-3 min-h-10 rounded-control bg-saffron px-4 py-2 text-sm font-extrabold text-snow transition-colors hover:bg-[#a80036]">
                  {t("svc.plan")}
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <div ref={builderRef} className="scroll-mt-20 border-y border-line bg-chuna py-10 md:py-14 dark:bg-raatri">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <h2 className="text-[22px] font-black text-navy md:text-[26px] dark:text-snow">{t("svc.boq")}</h2>
          <p className="mb-5 mt-1 max-w-2xl text-sm text-muted">{t("svc.sub")}</p>
          <ServiceBuilder svcId={svcId} onSvc={setSvcId} />
        </div>
      </div>

      <section className="mx-auto max-w-6xl px-4 py-10 md:px-8 md:py-14">
        <h2 className="text-[22px] font-black text-navy md:text-[26px] dark:text-snow">{t("svc.crewTitle")}</h2>
        <p className="mt-1 max-w-2xl text-sm text-muted">{t("svc.crewSub")}</p>
        <div className="mt-5 grid gap-5 md:grid-cols-3">
          {CREWS.map((c) => (
            <article key={c.name} className="rounded-card border border-line bg-white p-5 shadow-card dark:bg-raatri">
              <div className="flex items-center gap-3">
                <span className="lens-pink flex h-12 w-12 flex-none items-center justify-center rounded-pill text-base font-black text-snow">
                  {c.name.split(" ").map((w) => w[0]).join("")}
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-extrabold text-navy dark:text-snow">{c.name}</p>
                  <p className="flex items-center gap-1 text-xs font-black text-haldi"><Icon name="star" className="h-3 w-3" />{c.rating}</p>
                </div>
                <span className="ml-auto flex items-center gap-1 rounded-pill bg-[#0e9f8a]/10 px-2 py-0.5 text-[10px] font-black text-[#0e9f8a]">
                  <Icon name="shield" className="h-3 w-3" />{t("svc.crew.verified")}
                </span>
              </div>
              <p className="mt-3 text-xs text-muted">{c.jobs} {t("svc.crew.jobs")} · {c.langs} · since {c.since}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="border-t border-line bg-chuna py-10 md:py-14 dark:bg-raatri">
        <div className="mx-auto max-w-6xl px-4 md:px-8">
          <h2 className="text-[22px] font-black text-navy md:text-[26px] dark:text-snow">{t("svc.guar")}</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(["svc.g1", "svc.g2", "svc.g3", "svc.g4"] as const).map((k) => (
              <div key={k} className="flex items-start gap-3 rounded-card border border-line bg-white p-4 dark:bg-raatri">
                <span className="flex h-9 w-9 flex-none items-center justify-center rounded-pill bg-saffron/10">
                  <Icon name="check" className="h-4 w-4 text-saffron" />
                </span>
                <p className="text-sm font-extrabold text-ink dark:text-snow">{t(k)}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-10 md:px-8 md:py-14">
        <h2 className="text-[22px] font-black text-navy md:text-[26px] dark:text-snow">{t("svc.faqH")}</h2>
        <div className="mt-5 space-y-3">
          {([["svc.faq1q", "svc.faq1a"], ["svc.faq2q", "svc.faq2a"], ["svc.faq3q", "svc.faq3a"]] as const).map(([q, a]) => (
            <details key={q} className="group rounded-card border border-line bg-white p-4 dark:bg-raatri">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-extrabold text-ink dark:text-snow">
                {t(q)}<Icon name="plus" className="h-4 w-4 flex-none text-saffron transition-transform group-open:rotate-45" />
              </summary>
              <p className="mt-2 text-sm text-muted">{t(a)}</p>
            </details>
          ))}
        </div>
      </section>
    </>
  );
}