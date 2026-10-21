/* Header v9 — flush logo (exact brand lockup in light, mark+word in dark),
   cities dropdown, nav: Services/Marketplace/Partners/Blog/About,
   single account icon with login+register menu, bell, theme, globe.
   Every dropdown closes on outside click. */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Logo } from "./Logo";
import { AuthModal } from "./auth/AuthModal";
import type { AuthMode } from "./auth/types";
import { onAuthRequest } from "@/lib/authEvents";
import { useI18n } from "@/i18n";
import type { Lang } from "@/i18n";
import { clearSession, getSession, onSessionChange } from "@/lib/session";
import type { Session } from "@/lib/session";
import { NotificationBell } from "./NotificationBell";
import { LIVE_CITIES, SOON_CITIES, getCity, onCityChange, setCity } from "@/lib/city";

const NAV = [
  { href: "#services", key: "nav.services" },
  { href: "#how", key: "nav.marketplace" },
  { href: "#workers", key: "nav.partners" },
  { href: "/blog", key: "nav.blog" },
  { href: "/about", key: "nav.about" },
];

const LANGS: { code: Lang; label: string; tag: string }[] = [
  { code: "en", label: "English", tag: "EN" },
  { code: "hi", label: "हिंदी", tag: "HI" },
  { code: "gu", label: "ગુજરાતી", tag: "GU" },
];

const LANGS_SOON = ["తెలుగు", "தமிழ்", "മലയാളം", "मराठी"];

const ROLE_CHIP: Record<Session["role"], { key: string; emoji: string }> = {
  customer: { key: "chip.c", emoji: "🏠" },
  provider: { key: "chip.p", emoji: "🔧" },
  shopkeeper: { key: "chip.s", emoji: "🏪" },
};

export function Header() {
  const { lang, setLang, t } = useI18n();
  const router = useRouter();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [langOpen, setLangOpen] = useState(false);
  const [cityOpen, setCityOpen] = useState(false);
  const [acctOpen, setAcctOpen] = useState(false);
  const [dark, setDark] = useState(false);
  const [city, setCityState] = useState("Vadodara");
  const [session, setSessionState] = useState<Session | null>(null);

  useEffect(() => onAuthRequest((m) => { setAuthMode(m); setAuthOpen(true); }), []);

  useEffect(() => {
    setSessionState(getSession());
    setCityState(getCity());
    const offSession = onSessionChange(() => setSessionState(getSession()));
    const offCity = onCityChange(() => setCityState(getCity()));
    return () => {
      offSession();
      offCity();
    };
  }, []);

  useEffect(() => {
    let saved: string | null = null;
    try {
      saved = localStorage.getItem("gs_theme");
    } catch {
      saved = null;
    }
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    applyTheme(saved ? saved === "dark" : prefersDark, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function applyTheme(isDark: boolean, animate: boolean) {
    const root = document.documentElement;
    if (animate) {
      root.classList.add("theme-anim");
      window.setTimeout(() => root.classList.remove("theme-anim"), 550);
    }
    root.classList.toggle("dark", isDark);
    setDark(isDark);
    try {
      localStorage.setItem("gs_theme", isDark ? "dark" : "light");
    } catch {
      /* private mode */
    }
  }

  function openAuth(mode: AuthMode) {
    setAuthMode(mode);
    setAcctOpen(false);
    setAuthOpen(true);
  }

  function logout() {
    clearSession();
    router.push("/");
  }

  const iconBtn =
    "flex h-9 w-9 items-center justify-center rounded-pill border border-line bg-chuna text-base transition-colors hover:border-saffron";

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/60 bg-white/90 backdrop-blur">
        <div className="flex h-16 w-full items-center gap-3 px-3 md:gap-4 md:px-4">
          <Link href={session ? "/dashboard" : "/"} className="flex items-center gap-2 text-navy">
            <span className="dark:hidden">
              <Image src="/paintoor-horizontal.png" alt="Paintoor" width={1000} height={263} className="h-8 w-auto" priority />
            </span>
            <span className="hidden items-center gap-2 dark:flex">
              <Logo className="h-8 w-8" />
              <span className="text-lg font-black tracking-tight text-snow md:text-xl">
                {t("brand.pre")}
                {t("brand.post")}
              </span>
            </span>
          </Link>

          <div className="relative">
            <button
              type="button"
              onClick={() => setCityOpen((v) => !v)}
              className="flex min-h-9 items-center gap-1 rounded-control border border-line bg-chuna px-2.5 py-1.5 text-xs font-extrabold text-navy transition-colors hover:border-saffron"
            >
              📍 {city}
              <span aria-hidden="true" className="text-[10px]">▾</span>
            </button>
            {cityOpen && (
              <>
                <button type="button" aria-label={t("notif.close")} onClick={() => setCityOpen(false)} className="fixed inset-0 z-40 cursor-default" />
                <div className="absolute left-0 top-11 z-50 max-h-72 min-w-[180px] overflow-y-auto rounded-card border border-line bg-white p-1.5 shadow-card">
                  {LIVE_CITIES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => {
                        setCity(c);
                        setCityOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-control px-3 py-2 text-left text-sm hover:bg-chuna ${city === c ? "font-extrabold text-navy" : "text-ink"}`}
                    >
                      {c} {city === c && <span className="text-xs font-black text-saffron">✓</span>}
                    </button>
                  ))}
                  {SOON_CITIES.map((c) => (
                    <button key={c} type="button" disabled className="flex w-full items-center justify-between rounded-control px-3 py-2 text-left text-sm text-muted/60">
                      {c} <span className="rounded-pill border border-line px-1.5 text-xs font-black">{t("cities.more")}</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          <nav className="mx-auto hidden items-center gap-6 lg:flex" aria-label="Primary">
            {NAV.map((item) =>
              item.href.startsWith("/") ? (
                <Link key={item.href} href={item.href} className="text-sm font-semibold text-muted transition-colors hover:text-navy">
                  {t(item.key)}
                </Link>
              ) : (
                <a key={item.href} href={item.href} className="text-sm font-semibold text-muted transition-colors hover:text-navy">
                  {t(item.key)}
                </a>
              ),
            )}
          </nav>

          <button type="button" onClick={() => applyTheme(!dark, true)} aria-label="Toggle dark mode" className={`${iconBtn} ml-auto lg:ml-0`}>
            {dark ? "☀️" : "🌙"}
          </button>

          <div className="relative">
            <button type="button" onClick={() => setLangOpen((v) => !v)} aria-label="Change language" className={`${iconBtn} text-navy`}>
              🌐
            </button>
            {langOpen && (
              <>
                <button type="button" aria-label={t("notif.close")} onClick={() => setLangOpen(false)} className="fixed inset-0 z-40 cursor-default" />
                <div className="absolute right-0 top-11 z-50 min-w-[180px] rounded-card border border-line bg-white p-1.5 shadow-card">
                  {LANGS.map((l) => (
                    <button
                      key={l.code}
                      type="button"
                      onClick={() => {
                        setLang(l.code);
                        setLangOpen(false);
                      }}
                      className={`flex w-full items-center justify-between rounded-control px-3 py-2 text-left text-sm hover:bg-chuna ${lang === l.code ? "font-extrabold text-navy" : "text-ink"}`}
                    >
                      {l.label} <span className="text-xs font-black text-muted">{l.tag}</span>
                    </button>
                  ))}
                  {LANGS_SOON.map((l) => (
                    <button key={l} type="button" disabled className="flex w-full items-center justify-between rounded-control px-3 py-2 text-left text-sm text-muted/60">
                      {l} <span className="rounded-pill border border-line px-1.5 text-xs font-black">SOON</span>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {session && <NotificationBell />}

          {session ? (
            <>
              <Link
                href="/dashboard"
                className="hidden items-center gap-2 rounded-control border border-line bg-chuna px-3 py-2 text-xs font-extrabold text-navy hover:border-saffron sm:flex"
              >
                <span aria-hidden="true">{ROLE_CHIP[session.role].emoji}</span>
                {t(ROLE_CHIP[session.role].key)} · {t("dash.open")}
              </Link>
              <button type="button" onClick={logout} className="rounded-control border-2 border-line px-3 py-2 text-xs font-extrabold text-muted hover:border-danger hover:text-danger">
                {t("dash.logout")}
              </button>
            </>
          ) : (
            <div className="relative">
              <button
                type="button"
                aria-label={t("nav.entrance")}
                onClick={() => setAcctOpen((v) => !v)}
                className={`${iconBtn} ${acctOpen ? "border-saffron" : ""}`}
              >
                👤
              </button>
              {acctOpen && (
                <>
                  <button type="button" aria-label={t("notif.close")} onClick={() => setAcctOpen(false)} className="fixed inset-0 z-40 cursor-default" />
                  <div className="absolute right-0 top-11 z-50 min-w-[170px] rounded-card border border-line bg-white p-1.5 shadow-card">
                    <button
                      type="button"
                      onClick={() => openAuth("login")}
                      className="flex w-full rounded-control px-3 py-2.5 text-left text-sm font-extrabold text-ink hover:bg-chuna"
                    >
                      🔑 {t("nav.login")}
                    </button>
                    <button
                      type="button"
                      onClick={() => openAuth("signup")}
                      className="flex w-full rounded-control bg-saffron px-3 py-2.5 text-left text-sm font-extrabold text-snow hover:shadow-lift"
                    >
                      ✨ {t("nav.signup")}
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </header>

      <AuthModal open={authOpen} initialMode={authMode} onClose={() => setAuthOpen(false)} />
    </>
  );
}