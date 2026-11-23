/* SettingsView — the counter's control room: store open/paused, alert
   preferences (new-order reminder, low stock, payouts), language, theme
   (same gs_theme key the public Header owns), bank row and account help.
   Language and theme follow the exact patterns of the customer settings. */
"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon, type IconName } from "@/components/Icons";
import { getFlow, onFlowChange, setPref, setStoreOpen } from "@/lib/shopflow";
import type { ShopPrefs } from "@/lib/shopflow";

/* Native names on purpose — a language always shows as it calls itself. */
const LANG_NAME: Record<string, string> = { en: "English", hi: "हिन्दी", gu: "ગુજરાતી" };
const LANGS = ["en", "hi", "gu"] as const;

function Toggle({ on, onClick, label }: { on: boolean; onClick: () => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={onClick}
      className={`relative h-6 w-11 shrink-0 rounded-pill transition-colors ${on ? "bg-saffron" : "bg-ink/20"}`}
    >
      <span className={`absolute top-0.5 h-5 w-5 rounded-pill bg-white shadow-card transition-all ${on ? "left-[22px]" : "left-0.5"}`} />
    </button>
  );
}

function PrefRow({ icon, title, sub, on, onFlip }: { icon: IconName; title: string; sub: string; on: boolean; onFlip: () => void }) {
  return (
    <div className="flex items-center gap-3 rounded-control border border-line bg-white px-3.5 py-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-saffron/10 text-saffron">
        <Icon name={icon} className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <b className="block text-sm font-extrabold text-navy">{title}</b>
        <span className="block text-xs font-semibold text-muted">{sub}</span>
      </span>
      <Toggle on={on} onClick={onFlip} label={title} />
    </div>
  );
}

export function SettingsView({ onToast }: { onToast: (msg: string) => void }) {
  const { lang, setLang, t } = useI18n();
  const [open, setOpen] = useState(true);
  const [prefs, setPrefs] = useState<ShopPrefs>({ remind: true, low: true, payout: true });
  /* Null until mount: the dark class is applied by a pre-paint script, so
     reading it during render would desync server and client. */
  const [dark, setDark] = useState<boolean | null>(null);

  useEffect(() => {
    setDark(document.documentElement.classList.contains("dark"));
    const reload = () => {
      const f = getFlow();
      setOpen(f.open);
      setPrefs(f.prefs);
    };
    reload();
    return onFlowChange(reload);
  }, []);

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

  function flipOpen() {
    const next = !open;
    setOpen(next);
    setStoreOpen(next);
    onToast(next ? t("sw.set.openOn") : t("sw.set.openOff"));
  }

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("sw.set.eye")}</p>
        <h2 className="mt-1 text-2xl font-black tracking-[-0.02em] text-navy">{t("sw.set.h")}</h2>
        <p className="mt-1 text-sm font-bold text-muted">{t("sw.set.sub")}</p>
      </div>

      {/* Store status */}
      <section className="rounded-card border border-line bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-saffron/10 text-saffron">
            <Icon name="store" className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <b className="block text-sm font-extrabold text-navy">{open ? t("sw.open") : t("sw.paused")}</b>
            <span className="block text-xs font-semibold text-muted">{t("sw.set.openSub")}</span>
          </div>
          <Toggle on={open} onClick={flipOpen} label={t("sw.set.openAria")} />
        </div>
      </section>

      {/* Alert preferences */}
      <section>
        <h3 className="text-sm font-black text-navy">{t("sw.set.alerts")}</h3>
        <div className="mt-2 space-y-2">
          <PrefRow
            icon="bell"
            title={t("sw.set.a1")}
            sub={t("sw.set.a1s")}
            on={prefs.remind}
            onFlip={() => setPref("remind", !prefs.remind)}
          />
          <PrefRow
            icon="package"
            title={t("sw.set.a2")}
            sub={t("sw.set.a2s")}
            on={prefs.low}
            onFlip={() => setPref("low", !prefs.low)}
          />
          <PrefRow
            icon="wallet"
            title={t("sw.set.a3")}
            sub={t("sw.set.a3s")}
            on={prefs.payout}
            onFlip={() => setPref("payout", !prefs.payout)}
          />
        </div>
      </section>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Language */}
        <section className="rounded-card border border-line bg-white p-4 shadow-card">
          <span className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-saffron/10 text-saffron">
              <Icon name="globe" className="h-4 w-4" />
            </span>
            <b className="text-sm font-extrabold text-navy">{t("sw.set.lang")}</b>
          </span>
          <div className="mt-3 flex gap-1.5">
            {LANGS.map((l) => (
              <button
                key={l}
                type="button"
                onClick={() => setLang(l)}
                className={`min-h-11 flex-1 rounded-control border-2 px-2 py-2 text-xs font-extrabold transition-colors ${
                  lang === l ? "border-saffron bg-saffron text-snow" : "border-line text-muted hover:border-saffron hover:text-saffron"
                }`}
              >
                {LANG_NAME[l]}
              </button>
            ))}
          </div>
        </section>

        {/* Theme */}
        <section className="rounded-card border border-line bg-white p-4 shadow-card">
          <span className="flex items-center gap-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-saffron/10 text-saffron">
              <Icon name="sun" className="h-4 w-4" />
            </span>
            <b className="text-sm font-extrabold text-navy">{t("sw.set.look")}</b>
          </span>
          <p className="mt-2 text-xs font-bold text-muted">{t("sw.set.themeNote")}</p>
          <span className="mt-2 flex gap-1.5">
            <button
              type="button"
              onClick={() => dark && flipTheme()}
              className={`min-h-11 flex-1 rounded-control border px-3 py-2 text-xs font-extrabold transition-colors ${
                dark === false ? "border-saffron bg-saffron text-snow" : "border-line text-muted hover:border-saffron hover:text-saffron"
              }`}
            >
              <Icon name="sun" className="mr-1 inline h-3.5 w-3.5 align-[-0.15em]" />
              {t("sw.set.light")}
            </button>
            <button
              type="button"
              onClick={() => !dark && flipTheme()}
              className={`min-h-11 flex-1 rounded-control border px-3 py-2 text-xs font-extrabold transition-colors ${
                dark === true ? "border-saffron bg-saffron text-snow" : "border-line text-muted hover:border-saffron hover:text-saffron"
              }`}
            >
              <Icon name="moon" className="mr-1 inline h-3.5 w-3.5 align-[-0.15em]" />
              {t("sw.set.dark")}
            </button>
          </span>
        </section>
      </div>

      {/* Bank */}
      <section className="rounded-card border border-line bg-white p-4 shadow-card">
        <div className="flex flex-wrap items-center gap-3">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-saffron/10 text-saffron">
            <Icon name="card" className="h-5 w-5" />
          </span>
          <div className="min-w-0 flex-1">
            <b className="block text-sm font-extrabold text-navy">{t("sw.set.bank")}</b>
            <span className="block truncate text-xs font-semibold text-muted">{t("sw.set.bankSub")}</span>
          </div>
          <span className="shrink-0 rounded-pill bg-[rgba(14,159,110,0.12)] px-2.5 py-0.5 text-[11px] font-black text-[#0E9F6E]">
            {t("sw.prof.verified")}
          </span>
        </div>
      </section>

      {/* Account */}
      <section className="grid gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => onToast(t("sw.set.pwToast"))}
          className="flex min-h-12 items-center gap-2.5 rounded-card border border-line bg-white px-4 py-3 text-left text-sm font-extrabold text-navy shadow-card hover:border-saffron hover:text-saffron"
        >
          <Icon name="lock" className="h-4 w-4 shrink-0 text-saffron" />
          {t("sw.set.pw")}
        </button>
        <button
          type="button"
          onClick={() => onToast(t("sw.set.helpToast"))}
          className="flex min-h-12 items-center gap-2.5 rounded-card border border-line bg-white px-4 py-3 text-left text-sm font-extrabold text-navy shadow-card hover:border-saffron hover:text-saffron"
        >
          <Icon name="headset" className="h-4 w-4 shrink-0 text-saffron" />
          {t("sw.set.help")}
        </button>
      </section>
    </div>
  );
}                                                   