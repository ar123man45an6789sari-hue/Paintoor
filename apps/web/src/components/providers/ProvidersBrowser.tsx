/* ProvidersBrowser v1 — location + skill filters over seeded Vadodara data. */
"use client";

import { useMemo, useState } from "react";
import { seed } from "@gharsahayak/mock-api";

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
  const [zone, setZone] = useState("all");
  const [skill, setSkill] = useState("all");

  const zones = useMemo(
    () => Array.from(new Set(seed.providers.map((p) => p.zone))).sort(),
    [],
  );

  const filtered = useMemo(
    () =>
      seed.providers.filter(
        (p) =>
          (zone === "all" || p.zone === zone) &&
          (skill === "all" || p.skills.includes(skill)),
      ),
    [zone, skill],
  );

  return (
    <div>
      <div className="flex flex-wrap items-end gap-4 rounded-card border border-line bg-white p-4 shadow-card">
        <label className="block">
          <span className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-muted">Location</span>
          <select value={zone} onChange={(e) => setZone(e.target.value)} className="rounded-control border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-saffron">
            <option value="all">All locations</option>
            {zones.map((z) => (
              <option key={z} value={z}>{z}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-muted">Skill</span>
          <select value={skill} onChange={(e) => setSkill(e.target.value)} className="rounded-control border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-saffron">
            <option value="all">All skills</option>
            {SKILLS.map((s) => (
              <option key={s} value={s}>{s[0].toUpperCase() + s.slice(1)}</option>
            ))}
          </select>
        </label>
        <p className="ml-auto text-sm font-bold text-navy">
          {filtered.length} verified worker{filtered.length === 1 ? "" : "s"} available
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="mt-10 rounded-card border border-dashed border-line bg-white p-10 text-center text-muted">
          No workers match this combination yet — try “All locations”.
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => {
            const [from, to] = GRADIENTS[i % GRADIENTS.length];
            return (
              <article key={p.id} className="overflow-hidden rounded-card border border-line bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-lift">
                <div className="flex h-28 items-center justify-center text-5xl font-black text-white" style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}>
                  {p.name.charAt(0)}
                </div>
                <div className="p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-extrabold text-navy">{p.name}</h3>
                    <span className="text-sm font-black text-haldi">★ {p.rating_avg}</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {p.zone} · {p.experience_years} yrs · {p.jobs_done} jobs · {p.rating_count} reviews
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.badges.map((b) => (
                      <span key={b} className="rounded-pill border border-line bg-chuna px-2 py-0.5 text-[11px] font-bold text-navy">
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
                    <button type="button" className="rounded-control border-2 border-navy px-3 py-1.5 text-xs font-extrabold text-navy transition-colors hover:bg-navy hover:text-white">
                      View profile
                    </button>
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