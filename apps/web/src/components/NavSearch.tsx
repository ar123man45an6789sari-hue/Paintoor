/* NavSearch — UrbanCompany-style pill: real location sense + service search.
   The place is detected once per browser (GPS, then IP fallback), cached in
   localStorage and mirrored into the URL as /{city-slug}. The browser is
   never asked for permission twice. Desktop: inline pill. Mobile: panel. */
"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Icon, PinIcon, SearchIcon } from "./Icons";
import { useI18n } from "@/i18n";
import { getPlace, nameFromSlug, setPlace, type Place } from "@/lib/city";
import { sensePlace } from "@/lib/geo";
import { isIndianSlug } from "@/lib/india";
import { isLiveSkill, seed } from "@paintoor/mock-api";

const SKILL_KEYS = ["painting", "electrical", "plumbing", "carpentry", "cleaning"];
/* First path segments that are real routes, never city slugs. */
const STATIC = new Set([
  "providers",
  "marketplace",
  "partners",
  "studio",
  "blog",
  "about",
  "faq",
  "privacy",
  "terms",
  "refund",
  "dashboard",
  "login",
]);

const firstSeg = (path: string) => path.split("/").filter(Boolean)[0] ?? "";

/* A cached GPS/IP reading older than this is re-validated in the background. */
const FRESH_MS = 30 * 60 * 1000;

export function NavSearch() {
  const { t } = useI18n();
  const router = useRouter();
  const pathname = usePathname();
  const pathRef = useRef(pathname);
  pathRef.current = pathname;

  const [open, setOpen] = useState(false);
  const [locOpen, setLocOpen] = useState(false);
  const [sugOpen, setSugOpen] = useState(false);
  const [place, setPlaceState] = useState<Place | null>(null);
  const [area, setArea] = useState("");
  const [q, setQ] = useState("");
  const [detecting, setDetecting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const city = place?.name ?? "Mumbai";
  const liveCities = useMemo(
    () =>
      Array.from(
        new Set(seed.providers.filter((p) => p.skills.some(isLiveSkill)).map((p) => p.city)),
      ),
    [],
  );

  /** Store the place, show it in the pill and mirror it into the URL when the
      visitor is on the home page or on a city page. */
  function adopt(p: Place) {
    setPlaceState(p);
    setPlace(p);
    const seg = firstSeg(pathRef.current);
    const onHomeOrCity = pathRef.current === "/" || (seg !== "" && !STATIC.has(seg));
     /* Mirror into the URL ONLY for Indian city slugs — a foreign IP hit must
       never navigate the visitor into a 404 (BUG-1 guard). */
    if (onHomeOrCity && pathRef.current !== "/" + p.slug && isIndianSlug(p.slug)) {
      router.replace("/" + p.slug);
    }
  }

    useEffect(() => {
    const seg = firstSeg(pathRef.current);
    const stored = getPlace();

    /* A city slug in the URL that differs from the cached one is explicit
       visitor intent — a shared link, a bookmark or a typed address. Honour it
       on screen, but never write it into the cache: the cache must only ever
       hold where this person actually is. */
    if (seg !== "" && !STATIC.has(seg) && (!stored || stored.slug !== seg)) {
      const fromUrl: Place = {
        name: nameFromSlug(seg),
        slug: seg,
        region: "",
        country: "",
        source: "url",
        at: Date.now(),
      };
      setPlaceState(fromUrl);
      return;
    }

    /* Paint the cached place instantly so the pill is never empty, and mirror
       it into the URL when the visitor landed on the bare home page. */
    if (stored) {
      setPlaceState(stored);
      if (pathRef.current === "/" && isIndianSlug(stored.slug)) {
        router.replace("/" + stored.slug);
      }
    }

    /* Re-validate in the background unless the cached reading is a real and
       recent location fix. "url" and "default" are not fixes — one is a
       borrowed city, the other a give-up fallback — so both stay retryable
       and an already-poisoned cache heals itself. The browser remembers the
       geolocation grant, so a repeat read never prompts the visitor again. */
    const isRealFix =
      stored !== null &&
      stored.source !== "url" &&
      stored.source !== "default" &&
      Date.now() - stored.at < FRESH_MS;
    if (isRealFix) return;

    setDetecting(stored === null);
    sensePlace().then((p) => {
      setDetecting(false);
      adopt(p);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* Marketplace's "Change" button asks the header pill to open its
     location popover through this tiny event bridge. */
  useEffect(() => {
    const h = () => setLocOpen(true);
    window.addEventListener("pt:open-location", h);
    return () => window.removeEventListener("pt:open-location", h);
  }, []);

  function reSense() {
    setDetecting(true);
    setMsg(null);
    sensePlace().then((p) => {
      setDetecting(false);
      adopt(p);
      setMsg(t("search.locFound", { city: p.name }));
    });
  }

  function go() {
    const params = new URLSearchParams();
    params.set("city", city);
    if (area.trim()) params.set("zone", area.trim());
    if (q.trim()) params.set("q", q.trim());
    setSugOpen(false);
    setOpen(false);
    router.push(`/partners?${params.toString()}`);
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
          className="flex min-h-11 items-center gap-1.5 rounded-l-pill px-3 text-xs font-extrabold text-navy hover:bg-chuna"
        >
          <PinIcon className="h-4 w-4 shrink-0" />
          <span className="max-w-[104px] truncate">{detecting ? "…" : city}</span>
        </button>
        {locOpen && (
          <>
            <button type="button" aria-label={t("notif.close")} onClick={() => setLocOpen(false)} className="fixed inset-0 z-40 cursor-default" />
            <div className="absolute left-0 top-12 z-50 w-72 rounded-card border border-line bg-white p-2 shadow-card">
              <button
                type="button"
                onClick={reSense}
                className="flex min-h-11 w-full items-center gap-2 rounded-control bg-saffron px-3 py-2 text-xs font-extrabold text-snow"
              >
                <Icon name="target" className="h-4 w-4" />{t("search.useLoc")}
              </button>
              {detecting && <p className="mt-1 px-1 text-xs font-semibold text-muted">{t("geo.detecting")}</p>}
              {msg && <p className="mt-1 px-1 text-xs font-semibold text-muted">{msg}</p>}
              {place?.source === "ip" && <p className="mt-1 px-1 text-xs font-semibold text-muted">{t("geo.ip")}</p>}
              {!liveCities.includes(city) && (
                <p className="mt-1 rounded-control bg-chuna px-2 py-1.5 text-xs font-semibold text-saffron">{t("geo.note", { city })}</p>
              )}
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
                <Icon name="palette" className="mr-2 h-4 w-4 shrink-0" />{t(`sk.${s}`)}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
     <button type="button" onClick={go} aria-label={t("search.ph")} className="flex min-h-11 items-center rounded-r-pill bg-saffron px-4 text-snow hover:shadow-lift">
        <SearchIcon className="h-4 w-4" />
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
        className="flex h-9 w-9 items-center justify-center rounded-pill border border-line bg-chuna text-muted hover:border-saffron hover:text-saffron md:hidden"
      >
        <SearchIcon className="h-4 w-4" />
      </button>
      {open && <div className="absolute right-0 top-12 z-50 w-[92vw] md:hidden">{pill}</div>}
    </div>
  );
}
