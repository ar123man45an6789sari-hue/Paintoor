/* Find partner grid — the dashboard-native partner shelf.

   Reuses the public bazaar's data (liveProviders) and its hire plumbing:
   "Hire" stores pt_post_provider and opens the post box, where
   PostJobWizard pre-fills that partner. Toolbar and cards are the compact
   dashboard variants of ProvidersBrowser — search, city, area and sort.
   Painting is the only live skill at launch, so there is no skill filter. */
"use client";

import { useEffect, useMemo, useState } from "react";
import { LIVE_CITY_NAMES, liveProviders } from "@paintoor/mock-api";
import { useI18n } from "@/i18n";
import { Icon, type IconName } from "@/components/Icons";
import { getCity } from "@/lib/city";
import { getSession } from "@/lib/session";
import { requestAuth } from "@/lib/authEvents";

const SKILL_ICON: Record<string, IconName> = {
  painting: "palette",
  electrical: "bolt",
  plumbing: "droplet",
  carpentry: "hammer",
  cleaning: "spray",
  waterproofing: "shield",
};

const RATE_UNIT: Record<string, string> = {
  per_sqft: "/sqft",
  per_visit: "/visit",
  per_day: "/day",
};

const SORTS = ["top", "jobs", "rateLow", "rateHigh", "exp"] as const;
type Sort = (typeof SORTS)[number];

const GRAD = "linear-gradient(135deg,#E00048,#A80036)";
const rupees = (paise: number) => "₹" + (paise / 100).toLocaleString("en-IN");

export function FindPartnerGrid({ onHire }: { onHire?: () => void }) {
  const { t } = useI18n();
  const cities = useMemo(() => LIVE_CITY_NAMES, []);
  /* Neutral first paint ("all") on server AND client; the saved city lives
     in localStorage, so it is applied after mount — reading it during
     render would desync server and client (hydration error). */
  const [city, setCity] = useState("all");
  const [zone, setZone] = useState("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("top");

  useEffect(() => {
    const saved = getCity();
    if (saved !== "all" && cities.includes(saved)) setCity(saved);
  }, [cities]);

  const zones = useMemo(
    () =>
      Array.from(
        new Set(liveProviders.filter((p) => city === "all" || p.city === city).map((p) => p.zone)),
      ).sort(),
    [city],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = liveProviders.filter(
      (p) =>
        (city === "all" || p.city === city) &&
        (zone === "all" || p.zone === zone) &&
        (!q ||
          p.name.toLowerCase().includes(q) ||
          p.zone.toLowerCase().includes(q) ||
          p.skills.some((s) => s.includes(q))),
    );
    type P = (typeof list)[number];
    const by: Record<Sort, (a: P, b: P) => number> = {
      top: (a, b) => b.rating_avg - a.rating_avg,
      jobs: (a, b) => b.jobs_done - a.jobs_done,
      rateLow: (a, b) => a.rate_range_paise.min - b.rate_range_paise.min,
      rateHigh: (a, b) => b.rate_range_paise.min - a.rate_range_paise.min,
      exp: (a, b) => b.experience_years - a.experience_years,
    };
    return [...list].sort(by[sort]);
  }, [city, zone, query, sort]);

  const kycCount = useMemo(
    () => filtered.filter((p) => p.badges.includes("kyc_verified")).length,
    [filtered],
  );

  function clearFilters() {
    setCity("all");
    setZone("all");
    setQuery("");
    setSort("top");
  }

  /* Same handshake as the public bazaar: the flag feeds PostJobWizard's
     pre-fill; onHire flips the dashboard to the post box. */
  function hire(name: string) {
    const s = getSession();
    if (s?.role === "customer") {
      sessionStorage.setItem("pt_post_provider", name);
      onHire?.();
    } else {
      requestAuth("signup");
    }
  }

  const selectClass =
    "rounded-control border border-line bg-white px-3 py-2 text-sm font-bold text-navy outline-none focus:border-saffron";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("dash.tab.find")}</h1>
        <p className="mt-1 text-sm font-bold text-muted">{t("cd.find.sub")}</p>
        <p className="mt-1 flex items-center gap-1.5 text-xs font-extrabold text-muted">
          <Icon name="bulb" className="h-3.5 w-3.5 text-saffron" />
          {t("cd.find.hint")}
        </p>
      </div>

      {/* Toolbar: search + city + area + sort */}
      <section className="rounded-card border border-line bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block min-w-[180px] flex-1">
            <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.14em] text-muted">{t("pt.search")}</span>
            <span className="flex items-center gap-2 rounded-control border border-line bg-white px-3 focus-within:border-saffron">
              <Icon name="search" className="h-4 w-4 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent py-2 text-sm font-bold text-navy outline-none"
              />
            </span>
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.14em] text-muted">{t("prov.city")}</span>
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
            <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.14em] text-muted">{t("prov.area")}</span>
            <select value={zone} onChange={(e) => setZone(e.target.value)} className={selectClass}>
              <option value="all">{t("prov.allAreas")}</option>
              {zones.map((z) => (
                <option key={z} value={z}>{z}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className="mb-1 block text-[10px] font-black uppercase tracking-[0.14em] text-muted">{t("pt.sort")}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={selectClass}>
              {SORTS.map((s) => (
                <option key={s} value={s}>{t(`pt.sort.${s}`)}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3 text-xs">
          <span className="font-extrabold text-navy">{t("pt.count", { n: filtered.length })}</span>
          <span className="flex items-center gap-1 font-bold text-muted">
            <Icon name="shield" className="h-3.5 w-3.5 text-ink" />{kycCount} {t("pt.trust1")}
          </span>
          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto rounded-control border border-line px-3 py-1.5 text-xs font-extrabold text-muted transition-colors hover:border-saffron hover:text-saffron"
          >
            {t("pt.clear")}
          </button>
        </div>
      </section>

      {/* The grid */}
      {filtered.length === 0 ? (
        <div className="rounded-card border border-dashed border-line bg-white p-8 text-center text-sm font-bold text-muted">
          {t("prov.empty")}
          <div className="mt-4">
            <button
              type="button"
              onClick={clearFilters}
              className="rounded-control bg-saffron px-4 py-2 text-sm font-extrabold text-snow transition-opacity hover:opacity-90"
            >
              {t("pt.clear")}
            </button>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map((p) => (
            <article
              key={p.id}
              className="flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
            >
              <div className="relative flex h-16 items-center justify-center" style={{ background: GRAD }}>
                <span className="flex h-12 w-12 -translate-y-3 items-center justify-center rounded-pill border-4 border-snow/70 text-sm font-black text-snow shadow-card" style={{ background: GRAD }}>
                  {p.name.split(" ").map((w) => w.charAt(0)).join("").slice(0, 2)}
                </span>
                <Icon name={SKILL_ICON[p.skills[0]] ?? "wrench"} className="absolute left-3 top-3 h-4 w-4 text-snow" />
                {p.badges.includes("kyc_verified") && (
                  <span className="absolute bottom-2 right-3 rounded-pill bg-snow/90 px-2 py-0.5 text-[10px] font-black text-navy">
                    <Icon name="check" className="mr-0.5 inline h-2.5 w-2.5 align-[-0.1em]" />KYC
                  </span>
                )}
              </div>
              <div className="flex flex-1 flex-col p-4 pt-1">
                <div className="mt-2 flex items-baseline justify-between gap-2">
                  <h3 className="text-sm font-extrabold text-navy">{p.name}</h3>
                  <span className="flex shrink-0 items-center gap-1 text-xs font-black text-haldi">
                    <Icon name="star" className="h-3 w-3" />{p.rating_avg}
                  </span>
                </div>
                <p className="mt-0.5 text-xs font-bold text-muted">
                  {p.city} · {p.zone} · {p.experience_years} {t("cd.find.yrs")} · {p.jobs_done} {t("cd.find.jobsg")}
                </p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {p.skills.map((s) => (
                    <span key={s} className="flex items-center gap-1 rounded-pill bg-saffron/10 px-2 py-0.5 text-[11px] font-extrabold text-saffron">
                      <Icon name={SKILL_ICON[s] ?? "wrench"} className="h-3 w-3" />{t(`sk.${s}`)}
                    </span>
                  ))}
                </div>
                <div className="mt-auto flex items-center justify-between gap-2 pt-3">
                  <span className="text-sm font-black text-navy">
                    {rupees(p.rate_range_paise.min)}–{rupees(p.rate_range_paise.max)}
                    <span className="text-[11px] font-bold text-muted">{RATE_UNIT[p.rate_range_paise.unit]}</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => hire(p.name)}
                    className="rounded-control bg-saffron px-3.5 py-1.5 text-xs font-extrabold text-snow transition-opacity hover:opacity-90"
                  >
                    {t("pt.hire")}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}