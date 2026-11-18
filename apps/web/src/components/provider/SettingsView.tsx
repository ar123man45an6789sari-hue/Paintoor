/* SettingsView — appearance (theme + reduce motion), language & region,
   notification switches and security rows including sign-out. The theme
   flips the same gs_theme key and `dark` class the public Header owns, so
   both stay in sync; language goes through the shared i18n provider; the
   motion and notification preferences persist locally per device. */
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useI18n, type Lang } from "@/i18n";
import { Icon, type IconName } from "@/components/Icons";
import { clearSession } from "@/lib/session";
import type { ProviderProfile } from "@/lib/providers";

/* Native names on purpose — a language always shows as it calls itself. */
const LANG_NAME: Record<Lang, string> = { en: "English", hi: "हिन्दी", gu: "ગુજરાતી" };

const NOTIF_KEYS = ["jobs", "quotes", "pay", "offers"] as const;
type NotifKey = (typeof NOTIF_KEYS)[number];
type NotifState = Record<NotifKey, boolean>;
const DEFAULT_NOTIFS: NotifState = { jobs: true, quotes: true, pay: true, offers: false };
const NOTIF_LABEL: Record<NotifKey, string> = { jobs: "pw.set.n1", quotes: "pw.set.n2", pay: "pw.set.n3", offers: "pw.set.n4" };

function readNotifs(): NotifState {
  try {
    const raw = localStorage.getItem("gs_pnotif");
    if (raw) return { ...DEFAULT_NOTIFS, ...(JSON.parse(raw) as Partial<NotifState>) };
  } catch {
    /* private mode */
  }
  return DEFAULT_NOTIFS;
}

function readMotion(): boolean {
  try {
    return localStorage.getItem("gs_motion") === "1";
  } catch {
    return false;
  }
}

function Switch({ on, onChange, label }: { on: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => onChange(!on)}
      className={`relative h-6 w-11 shrink-0 rounded-pill transition-colors ${on ? "bg-saffron" : "bg-line"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-pill bg-white shadow-card transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function Card({ icon, title, children }: { icon: IconName; title: string; children: ReactNode }) {
  return (
    <section className="rounded-card border border-line bg-white p-5 shadow-card">
      <span className="flex items-center gap-2.5">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-saffron/10 text-saffron">
          <Icon name={icon} className="h-4 w-4" />
        </span>
        <span className="text-sm font-extrabold text-navy">{title}</span>
      </span>
      <div className="mt-4">{children}</div>
    </section>
  );
}

export function SettingsView({ profile, onToast }: { profile: ProviderProfile; onToast: (msg: string) => void }) {
  const { lang, setLang, t } = useI18n();
  /* Null until mount: the dark class is applied by a pre-paint script, so
     reading it during render would desync server and client. */
  const [dark, setDark] = useState<boolean | null>(null);
  const [motion, setMotion] = useState(false);
  const [notifs, setNotifs] = useState<NotifState>(DEFAULT_NOTIFS);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    setMotion(readMotion());
    setNotifs(readNotifs());
  }, []);

  function flipTheme(next: boolean) {
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    try {
      localStorage.setItem("gs_theme", next ? "dark" : "light");
    } catch {
      /* private mode */
    }
  }

  function flipMotion(next: boolean) {
    setMotion(next);
    document.documentElement.classList.toggle("motion-off", next);
    try {
      localStorage.setItem("gs_motion", next ? "1" : "0");
    } catch {
      /* private mode */
    }
  }

  function flipNotif(key: NotifKey, next: boolean) {
    const state = { ...notifs, [key]: next };
    setNotifs(state);
    try {
      localStorage.setItem("gs_pnotif", JSON.stringify(state));
    } catch {
      /* private mode */
    }
  }

  const segBase = "flex-1 rounded-control border px-3 py-2 text-xs font-extrabold transition-colors";
  const segOn = "border-saffron bg-saffron text-snow";
  const segOff = "border-line text-muted hover:border-saffron hover:text-saffron";

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("pw.v.settings")}</p>
      <h2 className="mt-1 text-2xl font-black tracking-[-0.02em] text-navy">{t("pw.set.h")}</h2>
      <p className="mt-1 text-sm font-bold text-muted">{t("pw.set.sub")}</p>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Card icon="sun" title={t("pw.set.look")}>
          <p className="text-xs font-bold text-muted">{t("cd.set.theme")}</p>
          <span className="mt-2 flex gap-1.5">
            <button type="button" onClick={() => dark && flipTheme(false)} className={`${segBase} ${dark === false ? segOn : segOff}`}>
              <Icon name="sun" className="mr-1 inline h-3.5 w-3.5 align-[-0.15em]" />
              {t("cd.set.light")}
            </button>
            <button type="button" onClick={() => !dark && flipTheme(true)} className={`${segBase} ${dark === true ? segOn : segOff}`}>
              <Icon name="moon" className="mr-1 inline h-3.5 w-3.5 align-[-0.15em]" />
              {t("cd.set.dark")}
            </button>
          </span>
          <div className="mt-4 flex items-center justify-between gap-3">
            <span className="min-w-0">
              <b className="block text-xs font-extrabold text-navy">{t("pw.set.motion")}</b>
              <span className="block text-[11px] font-semibold text-muted">{t("pw.set.motionSub")}</span>
            </span>
            <Switch on={motion} onChange={flipMotion} label={t("pw.set.motion")} />
          </div>
        </Card>

        <Card icon="globe" title={t("pw.set.lang")}>
          <span className="flex gap-1.5">
            {(["en", "hi", "gu"] as Lang[]).map((l) => (
              <button key={l} type="button" onClick={() => setLang(l)} className={`${segBase} ${lang === l ? segOn : segOff}`}>
                {LANG_NAME[l]}
              </button>
            ))}
          </span>
          <p className="mt-3 text-xs font-bold text-muted">
            <Icon name="mapPin" className="mr-1 inline h-3.5 w-3.5 align-[-0.15em]" />
            {t("pw.set.region")} · {profile.zone}, {profile.city}
          </p>
        </Card>

        <Card icon="bell" title={t("pw.set.notif")}>
          <ul className="space-y-3">
            {NOTIF_KEYS.map((k) => (
              <li key={k} className="flex items-center justify-between gap-3">
                <span className="text-xs font-extrabold text-navy">{t(NOTIF_LABEL[k])}</span>
                <Switch on={notifs[k]} onChange={(next) => flipNotif(k, next)} label={t(NOTIF_LABEL[k])} />
              </li>
            ))}
          </ul>
        </Card>

        <Card icon="shieldCheck" title={t("pw.set.sec")}>
          <ul className="space-y-3">
            <li className="flex items-center justify-between gap-3">
              <span className="text-xs font-extrabold text-navy">{t("pw.set.kycRow")}</span>
              <span className="rounded-pill bg-[rgba(14,159,110,0.12)] px-2.5 py-0.5 text-[11px] font-black text-[#0E9F6E]">
                <Icon name="checkCircle" className="mr-1 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />
                {t("pw.kyc")}
              </span>
            </li>
            <li className="flex items-center justify-between gap-3">
              <span className="min-w-0">
                <b className="block text-xs font-extrabold text-navy">{t("pw.set.phone")}</b>
                <span className="block text-[11px] font-semibold text-muted">+91 98••• ••417</span>
              </span>
              <button
                type="button"
                onClick={() => onToast(t("pw.set.phoneToast"))}
                className="min-h-10 rounded-control border-2 border-line px-3 py-2 text-xs font-extrabold text-navy hover:border-saffron hover:text-saffron"
              >
                <Icon name="pencil" className="mr-1 inline h-3.5 w-3.5" />
                {t("pw.set.phoneEdit")}
              </button>
            </li>
            <li className="pt-1">
              <button
                type="button"
                onClick={() => clearSession()}
                className="flex w-full items-center justify-between gap-3 rounded-control border-2 border-line p-3 text-left transition-colors hover:border-saffron"
              >
                <span className="min-w-0">
                  <b className="block text-xs font-extrabold text-navy">{t("pw.set.out")}</b>
                  <span className="block text-[11px] font-semibold text-muted">{t("pw.set.outSub")}</span>
                </span>
                <Icon name="logout" className="h-4 w-4 shrink-0 text-saffron" />
              </button>
            </li>
          </ul>
        </Card>
      </div>
    </div>
  );
}