/* Header v5 — theme toggle (smooth dark mode), globe i18n, dual auth CTAs,
   mobile Entrance button, guest nav = marketing links only. */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { AuthModal } from "./auth/AuthModal";
import type { AuthMode } from "./auth/types";
import { onAuthRequest } from "@/lib/authEvents";
import { useI18n } from "@/i18n";
import type { Lang } from "@/i18n";

const NAV = [
  { href: "#services", key: "nav.services" },
  { href: "#how", key: "nav.how" },
  { href: "#workers", key: "nav.workers" },
  { href: "#why", key: "nav.why" },
];

const LANGS: { code: Lang; label: string; tag: string }[] = [
  { code: "en", label: "English", tag: "EN" },
  { code: "hi", label: "हिंदी", tag: "HI" },
  { code: "gu", label: "ગુજરાતી", tag: "GU" },
];

const LANGS_SOON = ["తెలుగు", "தமிழ்", "മലയാളം", "मराठी"];

export function Header() {
  const { lang, setLang, t } = useI18n();
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<AuthMode>("signup");
  const [langOpen, setLangOpen] = useState(false);
  const [dark, setDark] = useState(false);

  useEffect(() => onAuthRequest((m) => { setAuthMode(m); setAuthOpen(true); }), []);

  /* Theme init: saved choice jeetta hai, warna system preference. */
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
    setAuthOpen(true);
  }

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/60 bg-white/92 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-3 px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2 text-navy">
            <Logo className="h-8 w-8" />
            <span className="text-lg font-black tracking-tight md:text-xl">
              {t("brand.pre")}
              <span className="text-saffron">{t("brand.post")}</span>
            </span>
          </Link>

          <nav className="mx-auto hidden items-center gap-7 lg:flex" aria-label="Primary">
            {NAV.map((item) => (
              <a key={item.href} href={item.href} className="text-sm font-semibold text-muted transition-colors hover:text-navy">
                {t(item.key)}
              </a>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => applyTheme(!dark, true)}
            aria-label="Toggle dark mode"
            className="ml-auto flex h-9 w-9 items-center justify-center rounded-pill border border-line bg-chuna text-base transition-colors hover:border-saffron lg:ml-0"
          >
            {dark ? "☀️" : "🌙"}
          </button>

          <div className="relative">
            <button
              type="button"
              onClick={() => setLangOpen((v) => !v)}
              aria-label="Change language"
              className="flex h-9 w-9 items-center justify-center rounded-pill border border-line bg-chuna text-base text-navy transition-colors hover:border-saffron"
            >
              🌐
            </button>
            {langOpen && (
              <div className="absolute right-0 top-11 z-50 min-w-[180px] rounded-card border border-line bg-white p-1.5 shadow-card">
                {LANGS.map((l) => (
                  <button
                    key={l.code}
                    type="button"
                    onClick={() => { setLang(l.code); setLangOpen(false); }}
                    className={`flex w-full items-center justify-between rounded-control px-3 py-2 text-left text-sm hover:bg-chuna ${lang === l.code ? "font-extrabold text-navy" : "text-ink"}`}
                  >
                    {l.label} <span className="text-[10px] font-black text-muted">{l.tag}</span>
                  </button>
                ))}
                {LANGS_SOON.map((l) => (
                  <button key={l} type="button" disabled className="flex w-full items-center justify-between rounded-control px-3 py-2 text-left text-sm text-muted/60">
                    {l} <span className="rounded-pill border border-line px-1.5 text-[9px] font-black">SOON</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => openAuth("login")}
            className="hidden rounded-control border-2 border-navy px-4 py-2 text-sm font-extrabold text-navy transition-colors hover:bg-navy hover:text-white sm:block"
          >
            {t("nav.login")}
          </button>
          <button
            type="button"
            onClick={() => openAuth("signup")}
            className="hidden rounded-control bg-saffron px-4 py-2 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lift sm:block"
          >
            {t("nav.signup")}
          </button>
          <button
            type="button"
            onClick={() => openAuth("signup")}
            className="rounded-control bg-saffron px-4 py-2 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lift sm:hidden"
          >
            {t("nav.entrance")}
          </button>
        </div>
      </header>

      <AuthModal open={authOpen} initialMode={authMode} onClose={() => setAuthOpen(false)} />
    </>
  );
}