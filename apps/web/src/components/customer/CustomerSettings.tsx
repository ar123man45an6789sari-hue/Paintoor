/* Settings — six quick cards, each one tap away from its full surface.

   Profile / alerts / language / security all open the existing profile
   drawer (single source of truth, lib/profile). The escrow card links to
   the wallet view; the appearance card flips the same gs_theme key and
   `dark` class the public Header owns, so both stay in sync. */
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useI18n } from "@/i18n";
import { Icon, type IconName } from "@/components/Icons";
import { useProfile, initialsOf } from "@/lib/profile";
import { heldOf, SEED_ESCROW } from "@/lib/escrow";
import { inr } from "@/lib/jobs";

const GRAD = "linear-gradient(135deg,#E00048,#A80036)";

/* Native names on purpose — a language always shows as it calls itself. */
const LANG_NAME: Record<string, string> = { en: "English", hi: "हिन्दी", gu: "ગુજરાતી" };

function Card({
  icon,
  title,
  children,
}: {
  icon: IconName;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="flex flex-col rounded-card border border-line bg-white p-4 shadow-card">
      <span className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-saffron/10 text-saffron">
          <Icon name={icon} className="h-4 w-4" />
        </span>
        <span className="text-sm font-extrabold text-navy">{title}</span>
      </span>
      <div className="mt-3 flex-1">{children}</div>
    </section>
  );
}

export function CustomerSettings({
  onProfile,
  onEscrow,
}: {
  onProfile: () => void;
  onEscrow: () => void;
}) {
  const { lang, t } = useI18n();
  const [profile] = useProfile();
  /* Null until mount: the dark class is applied by a pre-paint script, so
     reading it during render would desync server and client. */
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
  }, []);

  const alertsOn = Object.values(profile.alerts).filter(Boolean).length;

  function flipTheme() {
    const next = !(dark ?? false);
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("gs_theme", next ? "dark" : "light");
    } catch {
      /* private mode */
    }
  }

  const actionClass =
    "mt-3 inline-flex items-center gap-1.5 self-start rounded-control border border-line px-3 py-1.5 text-xs font-extrabold text-navy transition-colors hover:border-saffron hover:text-saffron";

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("cd.nav.settings")}</h1>
        <p className="mt-1 text-sm font-bold text-muted">{t("cd.set.sub")}</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {/* 1 — Profile */}
        <Card icon="user" title={t("cd.set.profile")}>
          <span className="flex items-center gap-3">
            {profile.photo ? (
              /* eslint-disable-next-line @next/next/no-img-element -- user upload, data URL */
              <img src={profile.photo} alt="" className="h-10 w-10 shrink-0 rounded-pill object-cover" />
            ) : (
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill text-xs font-black text-snow"
                style={{ background: GRAD }}
                aria-hidden="true"
              >
                {initialsOf(profile.name)}
              </span>
            )}
            <span className="min-w-0">
              <span className="block truncate text-xs font-extrabold text-navy">{profile.name}</span>
              <span className="block truncate text-[11px] font-bold text-muted">{profile.email}</span>
            </span>
          </span>
          <button type="button" onClick={onProfile} className={actionClass}>
            <Icon name="pencil" className="h-3.5 w-3.5" />
            {t("cd.set.edit")}
          </button>
        </Card>

        {/* 2 — Alerts */}
        <Card icon="bell" title={t("cd.set.alerts")}>
          <p className="text-xs font-bold text-muted">{t("cd.set.alertson", { n: alertsOn })}</p>
          <button type="button" onClick={onProfile} className={actionClass}>
            <Icon name="gear" className="h-3.5 w-3.5" />
            {t("cd.set.manage")}
          </button>
        </Card>

        {/* 3 — Language & region */}
        <Card icon="globe" title={t("cd.set.lang")}>
          <p className="text-xs font-bold text-muted">
            <b className="font-extrabold text-navy">{LANG_NAME[lang] ?? lang}</b> · ₹ INR · IST
          </p>
          <button type="button" onClick={onProfile} className={actionClass}>
            <Icon name="globe" className="h-3.5 w-3.5" />
            {t("cd.set.change")}
          </button>
        </Card>

        {/* 4 — Security */}
        <Card icon="shieldCheck" title={t("cd.set.sec")}>
          <p className="flex items-center gap-2 text-xs font-bold text-muted">
            {t("cd.set.twostep")}
            <span
              className={`rounded-pill px-2 py-0.5 text-[10px] font-extrabold ${
                profile.twoStep ? "bg-ink/15 text-ink" : "bg-[rgba(199,119,0,0.12)] text-[#C77700]"
              }`}
            >
              {profile.twoStep ? t("cd.set.on") : t("cd.set.off")}
            </span>
          </p>
          <button type="button" onClick={onProfile} className={actionClass}>
            <Icon name="monitor" className="h-3.5 w-3.5" />
            {t("cd.set.sessions")}
          </button>
        </Card>

        {/* 5 — Escrow & payments */}
        <Card icon="wallet" title={t("cd.set.money")}>
          <p className="text-xs font-bold text-muted">
            {t("cd.set.heldnow")}:{" "}
            <b className="font-extrabold text-navy">{inr(heldOf(SEED_ESCROW))}</b>
          </p>
          <button type="button" onClick={onEscrow} className={actionClass}>
            <Icon name="arrowRight" className="h-3.5 w-3.5" />
            {t("cd.set.openesc")}
          </button>
        </Card>

        {/* 6 — Appearance */}
        <Card icon="sun" title={t("cd.set.look")}>
          <p className="text-xs font-bold text-muted">{t("cd.set.theme")}</p>
          <span className="mt-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => dark && flipTheme()}
              className={`flex-1 rounded-control border px-3 py-1.5 text-xs font-extrabold transition-colors ${
                dark === false ? "border-saffron bg-saffron text-snow" : "border-line text-muted hover:border-saffron hover:text-saffron"
              }`}
            >
              <Icon name="sun" className="mr-1 inline h-3.5 w-3.5 align-[-0.15em]" />
              {t("cd.set.light")}
            </button>
            <button
              type="button"
              onClick={() => !dark && flipTheme()}
              className={`flex-1 rounded-control border px-3 py-1.5 text-xs font-extrabold transition-colors ${
                dark === true ? "border-saffron bg-saffron text-snow" : "border-line text-muted hover:border-saffron hover:text-saffron"
              }`}
            >
              <Icon name="moon" className="mr-1 inline h-3.5 w-3.5 align-[-0.15em]" />
              {t("cd.set.dark")}
            </button>
          </span>
        </Card>
      </div>
    </div>
  );
}