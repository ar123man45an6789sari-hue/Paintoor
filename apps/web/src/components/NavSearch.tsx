/* NavSearch v1 — UrbanCompany-style pill: location sense + service search.
   Desktop: brand/cities ke baad inline. Mobile: icon tap pe panel. */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n";
import { getCity, nearestCity, setCity } from "@/lib/city";

const SKILL_KEYS = ["painting", "electrical", "plumbing", "carpentry", "cleaning"];

export function NavSearch() {
  const { t } = useI18n();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const [sugOpen, setSugOpen] = useState(false);
  const [city, setCityState] = useState("Vadodara");
  const [area, setArea] = useState("");
  const [q, setQ] = useState("");
  const [locMsg, setLocMsg] = useState<string | null>(null);

  useEffect(() => setCityState(getCity()), []);
    /* Pehli visit pe location apne aap sense karo; mana kar de to manual. */
  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("gs_city");
    } catch {
      stored = null;
    }
    if (!stored) sense();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function sense() {
    setLocMsg("…");
    if (!("geolocation" in navigator)) {
      setLocMsg(t("search.locDenied"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const c = nearestCity(pos.coords.latitude, pos.coords.longitude);
        setCity(c);
        setCityState(c);
        setLocMsg(t("search.locFound", { city: c }));
      },
      () => setLocMsg(t("search.locDenied")),
      { timeout: 6000 },
    );
  }

  function go() {
    const params = new URLSearchParams();
    params.set("city", city);
    if (area.trim()) params.set("zone", area.trim());
    if (q.trim()) params.set("q", q.trim());
    setSugOpen(false);
    setOpen(false);
    router.push(`/providers?${params.toString()}`);
  }

  const suggestions = q.trim()
    ? SKILL_KEYS.filter(
        (s) => t(`sk.${s}`).toLowerCase().includes(q.trim().toLowerCase()) || s.includes(q.trim().toLowerCase()),
      )
    : [];

  const pill = (
    <div className="flex min-h-11 items-stretch overflow-visible rounded-pill border border-line bg-white shadow-card">
      <div className="relative flex items-center border-r border-line">
        <button
          type="button"
          onClick={() => setLocOpen((v) => !v)}
          className="flex min-h-11 items-center gap-1 rounded-l-pill px-3 text-xs font-extrabold text-navy hover:bg-chuna"
        >
          📍 {city} <span aria-hidden="true" className="text-[10px]">▾</span>
        </button>
        {locOpen && (
          <>
            <button type="button" aria-label={t("notif.close")} onClick={() => setLocOpen(false)} className="fixed inset-0 z-40 cursor-default" />
            <div className="absolute left-0 top-12 z-50 w-64 rounded-card border border-line bg-white p-2 shadow-card">
              <button
                type="button"
                onClick={sense}
                className="flex min-h-11 w-full items-center gap-2 rounded-control bg-saffron px-3 py-2 text-xs font-extrabold text-snow"
              >
                🎯 {t("search.useLoc")}
              </button>
              {locMsg && <p className="mt-1 px-1 text-xs font-semibold text-muted">{locMsg}</p>}
              <input
                value={area}
                onChange={(e) => setArea(e.target.value)}
                placeholder={t("search.locPh")}
                className="mt-2 w-full rounded-control border border-line bg-white px-3 py-2 text-sm outline-none focus:border-saffron"
              />
            </div>
          </>
        )}
      </div>
      <div className="relative flex flex-1 items-center">
        <input
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setSugOpen(true);
          }}
          onKeyDown={(e) => {
            if (e.key === "Enter") go();
          }}
          placeholder={t("search.ph")}
          className="min-h-11 w-full bg-transparent px-3 text-sm outline-none"
        />
        {sugOpen && suggestions.length > 0 && (
          <>
            <button type="button" aria-label={t("notif.close")} onClick={() => setSugOpen(false)} className="fixed inset-0 z-40 cursor-default" />
            <div className="absolute left-0 top-12 z-50 w-56 rounded-card border border-line bg-white p-1.5 shadow-card">
              {suggestions.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => {
                    setQ(t(`sk.${s}`));
                    setSugOpen(false);
                    go();
                  }}
                  className="flex w-full rounded-control px-3 py-2 text-left text-sm text-ink hover:bg-chuna"
                >
                  🎨 {t(`sk.${s}`)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
      <button type="button" onClick={go} aria-label={t("search.ph")} className="flex min-h-11 items-center rounded-r-pill bg-saffron px-4 text-snow hover:shadow-lift">
        🔍
      </button>
    </div>
  );

  return (
    <div className="relative flex items-center md:contents">
      <div className="hidden min-w-[340px] flex-1 md:flex md:px-2">{pill}</div>
      <button
        type="button"
        aria-label={t("search.ph")}
        onClick={() => setOpen((v) => !v)}
        className="flex h-9 w-9 items-center justify-center rounded-pill border border-line bg-chuna text-base hover:border-saffron md:hidden"
      >
        🔍
      </button>
      {open && <div className="absolute right-0 top-12 z-50 w-[92vw] md:hidden">{pill}</div>}
    </div>
  );
}