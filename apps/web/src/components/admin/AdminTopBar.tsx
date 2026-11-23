/* AdminTopBar — the control room's own frame. The site header stays hidden
   on /admin, so the panel carries its own brand line plus the controls an
   admin needs while locked in: language pill, dark-mode toggle, a peek at
   the live site, and the lock button that hands the room back to the
   passcode gate (one unlock per tab, exactly like a bank vault). */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useI18n } from "@/i18n";
import type { Lang } from "@/i18n";
import { Icon } from "@/components/Icons";

const GRAD = "linear-gradient(135deg,#E00048,#A80036)";

const LANGS: { code: Lang; label: string }[] = [
  { code: "en", label: "EN" },
  { code: "hi", label: "हि" },
  { code: "gu", label: "ગુ" },
];

export function AdminTopBar({ onLock }: { onLock: () => void }) {
  const { lang, setLang, t } = useI18n();
  const [dark, setDark] = useState(false);

  /* The head script has already painted the right theme before hydration,
     so the live class on <html> is the source of truth here. */
  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const applyTheme = (isDark: boolean) => {
    setDark(isDark);
    document.documentElement.classList.toggle("dark", isDark);
    try {
      localStorage.setItem("gs_theme", isDark ? "dark" : "light");
    } catch {
      /* private mode */
    }
  };

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2">
      <span
        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill text-snow shadow-card"
        style={{ background: GRAD }}
        aria-hidden="true"
      >
        <Icon name="shieldCheck" className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1 basis-[120px]">
        <p className="truncate text-sm font-black tracking-[-0.01em] text-navy">{t("ad.card.h")}</p>
        <p className="truncate text-[10px] font-black uppercase tracking-[0.14em] text-muted">{t("ad.card.demo")}</p>
      </div>

      {/* Language pill */}
      <div role="group" aria-label={t("a11y.lang")} className="flex shrink-0 rounded-pill border-2 border-line bg-white p-0.5">
        {LANGS.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => setLang(l.code)}
            aria-pressed={lang === l.code}
            className={`min-h-9 rounded-pill px-2.5 text-[11px] font-black transition-colors ${
              lang === l.code ? "bg-saffron text-snow" : "text-muted hover:text-saffron"
            }`}
          >
            {l.label}
          </button>
        ))}
      </div>

      {/* Theme */}
      <button
        type="button"
        onClick={() => applyTheme(!dark)}
        aria-label={t("a11y.theme")}
        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-control border-2 border-line bg-white text-muted hover:border-saffron hover:text-saffron"
      >
        <Icon name={dark ? "sun" : "moon"} className="h-[18px] w-[18px]" />
      </button>

        {/* Peek at the live site — always a fresh tab: the control room keeps
          living in its own tab, exactly like a vault that stays open while
          the guard glances outside. */}
      <Link
        href="/"
        target="_blank"
        rel="noopener noreferrer"
        className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-control border-2 border-line bg-white px-3 text-xs font-extrabold text-muted hover:border-saffron hover:text-saffron"
      >
        <Icon name="arrowRight" className="h-3.5 w-3.5" />
        {t("ad.top.viewSite")}
      </Link>

      {/* Lock — hands the room back to the gate */}
      <button
        type="button"
        onClick={onLock}
        className="flex min-h-11 shrink-0 items-center gap-1.5 rounded-control bg-saffron px-3.5 text-xs font-extrabold text-snow hover:shadow-lift"
      >
        <Icon name="lock" className="h-3.5 w-3.5" />
        {t("ad.top.lock")}
      </button>
    </div>
  );
}