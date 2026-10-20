/* ProvidersBrowser v3 — hooks INSIDE component; localised labels; All-India default. */
"use client";

import { useMemo, useState } from "react";
import { seed } from "@gharsahayak/mock-api";
import { useI18n } from "@/i18n";

const RATE_UNIT: Record<string, string> = {
  per_sqft: "/sqft",
  per_visit: "/visit",
  per_day: "/day",
};

const BADGES: Record<string, string> = {
  kyc_verified: "KYC ✓",
  top_rated: "Top rated",
  skill_tested: "Skill tested",
  material_capable: "Material capable",
  fast_responder: "Fast responder",
  certified: "Certified",
};

const SKILLS = ["painting", "electrical", "plumbing", "carpentry", "cleaning"];

const GRADIENTS = [
  ["#F2762E", "#8A3D0C"],
  ["#1D6FB8", "#0E2E55"],
  ["#0E9F8A", "#075E51"],
  ["#6C4BD8", "#3D2A80"],
  ["#C25A18", "#7A3A10"],
  ["#0E9F8A", "#123A6B"],
];

const rupees = (paise: number) => "₹" + (paise / 100).toLocaleString("en-IN");

export function ProvidersBrowser() {
  const { t } = useI18n();
  const [city, setCity] = useState("all");
  const [zone, setZone] = useState("all");
  const [skill, setSkill] = useState("all");

  const cities = useMemo(() => Array.from(new Set(seed.providers.map((p) => p.city))).sort(), []);
  const zones = useMemo(
    () =>
      Array.from(
        new Set(
          seed.providers
            .filter((p) => city === "all" || p.city === city)
            .map((p) => p.zone),
        ),
      ).sort(),
    [city],
  );

  const filtered = useMemo(
    () =>
      seed.providers.filter(
        (p) =>
          (city === "all" || p.city === city) &&
          (zone === "all" || p.zone === zone) &&
          (skill === "all" || p.skills.includes(skill)),
      ),
    [city, zone, skill],
  );

  const selectClass =
    "rounded-control border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-saffron";

    return (
    <div>
      <div className="mb-8">
        <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">{t("prov.tag")}</span>
        <h1 className="mt-2 text-4xl font-black text-navy">{t("prov.h")}</h1>
        <p className="mt-3 max-w-2xl text-muted">{t("prov.p")}</p>
      </div>
      <div className="flex flex-wrap items-end gap-3 rounded-card border border-line bg-white p-4 shadow-card">
        <label className="block">
          <span className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-muted">{t("prov.city")}</span>
          <select
            value={city}
            onChange={(e) => {
              setCity(e.target.value);
              setZone("all");
            }}
            className={selectClass}
          >
            <option value="all">{t("prov.allIndia")}</option>
            {cities.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-muted">{t("prov.area")}</span>
          <select value={zone} onChange={(e) => setZone(e.target.value)} className={selectClass}>
            <option value="all">{t("prov.allAreas")}</option>
            {zones.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-muted">{t("prov.skill")}</span>
          <select value={skill} onChange={(e) => setSkill(e.target.value)} className={selectClass}>
            <option value="all">{t("prov.allSkills")}</option>
            {SKILLS.map((s) => (
           <option key={s} value={s}>{t(`sk.${s}`)}</option>
            ))}
          </select>
        </label>
        <p className="ml-auto text-sm font-bold text-navy">
          {filtered.length} {t("prov.workers")}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-card border border-dashed border-line bg-white p-6 text-center text-muted">
          {t("prov.empty")}
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => {
            const [from, to] = GRADIENTS[i % GRADIENTS.length];
            return (
              <article key={p.id} className="overflow-hidden rounded-card border border-line bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-lift">
                <div className="relative flex h-28 items-center justify-center" style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}>
                  <span
                    className="flex h-16 w-16 items-center justify-center rounded-pill border-4 border-white/70 text-2xl font-black text-white"
                    style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                  >
                    {p.name.split(" ").map((w) => w.charAt(0)).join("").slice(0, 2)}
                  </span>
                  <span aria-hidden="true" className="absolute left-3 top-3 text-lg">
                    {p.skills[0] === "painting" ? "🎨" : p.skills[0] === "electrical" ? "⚡" : p.skills[0] === "plumbing" ? "🚿" : p.skills[0] === "carpentry" ? "🪚" : "🧽"}
                  </span>
                  {p.badges.includes("kyc_verified") && (
                    <span className="absolute bottom-2 right-3 rounded-pill bg-white/90 px-2 py-0.5 text-xs font-black text-neem">
                      ✓ KYC
                    </span>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-extrabold text-navy">{p.name}</h3>
                    <span className="text-sm font-black text-haldi">★ {p.rating_avg}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {p.city} · {p.zone} · {p.experience_years} yrs · {p.jobs_done} jobs
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.badges.map((b) => (
                      <span key={b} className="rounded-pill border border-line bg-chuna px-2 py-0.5 text-xs font-bold text-navy">
                        {BADGES[b] ?? b}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 border-l-2 border-saffron pl-2 text-sm italic text-muted">“{p.quote}”</p>
                  <div className="mt-4 flex items-center justify-between">
                    <span className="font-black text-navy">
                      {rupees(p.rate_range_paise.min)}–{rupees(p.rate_range_paise.max)}
                      <span className="text-xs font-semibold text-muted">{RATE_UNIT[p.rate_range_paise.unit]}</span>
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}