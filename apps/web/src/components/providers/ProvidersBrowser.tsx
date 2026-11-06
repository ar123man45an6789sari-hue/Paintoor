/* PartnersBrowser — the Partner Bazaar. A shop-style shelf of verified
   painters: live search, city + area filters, sorting and an honest trust
   strip. Painting is the only live skill at launch, so there is no skill
   dropdown — the shelf simply shows bookable painters. Everything reads the
   offline seed; no network. */
"use client";
import { useEffect, useMemo, useState } from "react";
import { isLiveSkill, seed } from "@paintoor/mock-api";
import { useI18n } from "@/i18n";
import { useSearchParams } from "next/navigation";
import { getCity } from "@/lib/city";
import { requestAuth } from "@/lib/authEvents";
import { Icon, type IconName } from "@/components/Icons";

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

const BADGES: Record<string, string> = {
  kyc_verified: "KYC ✓",
  top_rated: "Top rated",
  skill_tested: "Skill tested",
  material_capable: "Material capable",
  fast_responder: "Fast responder",
  certified: "Certified",
};

const SORTS = ["top", "jobs", "rateLow", "rateHigh", "exp"] as const;
type Sort = (typeof SORTS)[number];

const GRADIENTS = [
  ["#e00048", "#a80036"],
  ["#182028", "#10151a"],
  ["#182028", "#10151a"],
  ["#e00048", "#a80036"],
  ["#a80036", "#7c0028"],
  ["#182028", "#182028"],
];

const rupees = (paise: number) => "₹" + (paise / 100).toLocaleString("en-IN");

export function ProvidersBrowser() {
  const { t } = useI18n();
  const params = useSearchParams();

  // Only cities that actually have a bookable (live-skill) partner are listed,
  // so the dropdown can never select a city with zero results.
  const cities = useMemo(
    () =>
      Array.from(
        new Set(seed.providers.filter((p) => p.skills.some(isLiveSkill)).map((p) => p.city)),
      ).sort(),
    [],
  );

  // First paint starts neutral ("all") on server AND client. A linked city
  // (?city=...) is safe to read here; the saved city lives in localStorage,
  // which only exists in the browser, so it is applied after mount — reading
  // it during render would desync server and client (hydration error).
  const [city, setCity] = useState(() => {
    const linked = params.get("city");
    if (linked === null || linked === "all") return "all";
    return cities.includes(linked) ? linked : "all";
  });
  useEffect(() => {
    if (params.get("city")) return;
    const saved = getCity();
    if (saved !== "all" && cities.includes(saved)) setCity(saved);
  }, [params, cities]);

  const [zone, setZone] = useState(params.get("zone") ?? "all");
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [sort, setSort] = useState<Sort>("top");

  const zones = useMemo(
    () =>
      Array.from(
        new Set(
          seed.providers.filter((p) => city === "all" || p.city === city).map((p) => p.zone),
        ),
      ).sort(),
    [city],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = seed.providers.filter(
      (p) =>
        p.skills.some(isLiveSkill) &&
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

  const selectClass =
    "rounded-control border border-line bg-white px-3 py-2.5 text-sm font-semibold text-ink outline-none focus:border-saffron dark:bg-raatri dark:text-snow";

  return (
    <div>
      {/* Headline */}
      <div className="mb-6">
        <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">{t("pt.tag")}</span>
        <h1 className="mt-2 text-4xl font-black text-navy dark:text-snow">{t("pt.h")}</h1>
        <p className="mt-3 max-w-2xl text-muted">{t("pt.p")}</p>
      </div>

      {/* Toolbar: search + city + area + sort */}
      <div className="rounded-card border border-line bg-white p-4 shadow-card dark:bg-raatri">
        <div className="flex flex-wrap items-end gap-3">
          <label className="block min-w-[180px] flex-1">
            <span className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-muted">{t("pt.search")}</span>
            <div className="flex items-center gap-2 rounded-control border border-line bg-white px-3 focus-within:border-saffron dark:bg-raatri">
              <Icon name="search" className="h-4 w-4 text-muted" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full bg-transparent py-2.5 text-sm font-semibold text-ink outline-none dark:text-snow"
              />
            </div>
          </label>
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
            <span className="mb-1 block text-xs font-extrabold uppercase tracking-wider text-muted">{t("pt.sort")}</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as Sort)} className={selectClass}>
              {SORTS.map((s) => (
                <option key={s} value={s}>{t(`pt.sort.${s}`)}</option>
              ))}
            </select>
          </label>
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-3 border-t border-line pt-3 text-sm">
          <span className="font-bold text-navy dark:text-snow">{t("pt.count", { n: filtered.length })}</span>
          <span className="flex items-center gap-1 text-muted">
            <Icon name="shield" className="h-4 w-4 text-neem" />{kycCount} {t("pt.trust1")}
          </span>
          <button
            type="button"
            onClick={clearFilters}
            className="ml-auto rounded-control border border-line px-3 py-1.5 text-xs font-extrabold text-muted hover:border-saffron hover:text-saffron"
          >
            {t("pt.clear")}
          </button>
        </div>
      </div>

      {/* The shelf */}
      {filtered.length === 0 ? (
        <div className="mt-10 rounded-card border border-dashed border-line bg-white p-8 text-center text-muted dark:bg-raatri">
          {t("prov.empty")}
          <div className="mt-4">
            <button type="button" onClick={clearFilters} className="rounded-control bg-saffron px-4 py-2 text-sm font-extrabold text-snow">
              {t("pt.clear")}
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p, i) => {
            const [from, to] = GRADIENTS[i % GRADIENTS.length];
            return (
              <article
                key={p.id}
                className="flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-lift dark:bg-raatri"
              >
                <div
                  className="relative flex h-28 items-center justify-center"
                  style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                >
                  <span
                    className="flex h-16 w-16 items-center justify-center rounded-pill border-4 border-snow/70 text-2xl font-black text-snow"
                    style={{ backgroundImage: `linear-gradient(135deg, ${from}, ${to})` }}
                  >
                    {p.name.split(" ").map((w) => w.charAt(0)).join("").slice(0, 2)}
                  </span>
                  <Icon name={SKILL_ICON[p.skills[0]] ?? "wrench"} className="absolute left-3 top-3 h-5 w-5 text-snow" />
                  {p.badges.includes("kyc_verified") && (
                    <span className="absolute bottom-2 right-3 rounded-pill bg-white/90 px-2 py-0.5 text-xs font-black text-ink">
                      <Icon name="check" className="mr-1 inline h-3 w-3 align-[-0.15em]" />KYC
                    </span>
                  )}
                </div>
                <div className="flex flex-1 flex-col p-4">
                  <div className="flex items-baseline justify-between gap-2">
                    <h3 className="font-extrabold text-navy dark:text-snow">{p.name}</h3>
                    <span className="flex items-center gap-1 text-sm font-black text-haldi">
                      <Icon name="star" className="h-3.5 w-3.5" />{p.rating_avg}
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted">
                    {p.city} · {p.zone} · {p.experience_years} yrs · {p.jobs_done} jobs
                  </p>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.skills.map((s) => (
                      <span key={s} className="flex items-center gap-1 rounded-pill bg-saffron/10 px-2 py-0.5 text-xs font-bold text-saffron">
                        <Icon name={SKILL_ICON[s] ?? "wrench"} className="h-3 w-3" />{t(`sk.${s}`)}
                      </span>
                    ))}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-1">
                    {p.badges.filter((b) => b !== "kyc_verified").map((b) => (
                      <span key={b} className="rounded-pill border border-line bg-chuna px-2 py-0.5 text-xs font-bold text-navy dark:bg-raatri dark:text-snow">
                        {BADGES[b] ?? b}
                      </span>
                    ))}
                  </div>
                  <p className="mt-3 border-l-2 border-saffron pl-2 text-sm italic text-muted">“{p.quote}”</p>
                  <div className="mt-auto flex items-center justify-between pt-4">
                    <span className="font-black text-navy dark:text-snow">
                      {rupees(p.rate_range_paise.min)}–{rupees(p.rate_range_paise.max)}
                      <span className="text-xs font-semibold text-muted">{RATE_UNIT[p.rate_range_paise.unit]}</span>
                    </span>
                    <button
                      type="button"
                      onClick={() => requestAuth("signup")}
                      className="rounded-control bg-saffron px-4 py-2 text-sm font-extrabold text-snow transition-transform hover:-translate-y-0.5 hover:shadow-lift"
                    >
                      {t("pt.hire")}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      {/* Trust strip */}
      <div className="mt-10 grid gap-4 rounded-card border border-line bg-chuna p-5 sm:grid-cols-3 dark:bg-raatri">
        {(["pt.trust1", "pt.trust2", "pt.trust3"] as const).map((k) => (
          <p key={k} className="flex items-center gap-2 text-sm font-bold text-navy dark:text-snow">
            <Icon name="checkCircle" className="h-4 w-4 text-neem" />{t(k)}
          </p>
        ))}
      </div>
    </div>
  );
}