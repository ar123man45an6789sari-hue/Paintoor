/* PwaSetup — registers the service worker (production only, so dev servers
   never cache stale shells) and owns the install experience: Chrome's
   beforeinstallprompt becomes a dismissible brand pill; iOS Safari, which
   has no install event, gets a one-line "Share → Add to Home Screen"
   hint for the session instead. */
"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
const DISMISSED = "gs_pwa_dismissed";
const IOS_DISMISSED = "gs_pwa_ios_dismissed";

export function PwaSetup() {
  const { t } = useI18n();
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [iosHint, setIosHint] = useState(false);

  useEffect(() => {
    if (process.env.NODE_ENV === "production" && "serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        /* offline stays a bonus, never a requirement */
      });
    }

    const onPrompt = (e: Event) => {
      e.preventDefault();
      let dismissed = false;
      try {
        dismissed = localStorage.getItem(DISMISSED) === "1";
      } catch {
        /* private mode */
      }
      if (!dismissed) setDeferred(e as BIPEvent);
    };
    window.addEventListener("beforeinstallprompt", onPrompt);

    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (navigator as unknown as { standalone?: boolean }).standalone === true;
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    if (ios && !standalone) {
      let dismissed = false;
      try {
        dismissed = sessionStorage.getItem(IOS_DISMISSED) === "1";
      } catch {
        /* private mode */
      }
      if (!dismissed) setIosHint(true);
    }
    return () => window.removeEventListener("beforeinstallprompt", onPrompt);
  }, []);

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    setDeferred(null);
  };

  const dismiss = () => {
    setDeferred(null);
    try {
      localStorage.setItem(DISMISSED, "1");
    } catch {
      /* private mode */
    }
  };

  const dismissIos = () => {
    setIosHint(false);
    try {
      sessionStorage.setItem(IOS_DISMISSED, "1");
    } catch {
      /* private mode */
    }
  };

  if (!deferred && !iosHint) return null;

  return (
    <div className="fixed bottom-24 left-3 z-50 w-[min(92vw,340px)] rounded-card border border-line bg-white p-4 shadow-lift lg:bottom-6">
      {deferred ? (
        <>
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-saffron/10 text-saffron">
              <Icon name="download" className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-black text-navy">{t("pwa.install.h")}</p>
              <p className="text-[11px] font-bold leading-snug text-muted">{t("pwa.install.sub")}</p>
            </div>
          </div>
          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={install}
              className="min-h-10 flex-1 rounded-control bg-saffron px-3 text-xs font-extrabold text-snow hover:shadow-lift"
            >
              {t("pwa.install.go")}
            </button>
            <button
              type="button"
              onClick={dismiss}
              className="min-h-10 rounded-control border-2 border-line px-3 text-xs font-extrabold text-muted hover:border-saffron hover:text-saffron"
            >
              {t("pwa.install.later")}
            </button>
          </div>
        </>
      ) : (
        <>
          <p className="text-xs font-bold leading-relaxed text-navy">{t("pwa.ios")}</p>
          <button
            type="button"
            onClick={dismissIos}
            className="mt-2 min-h-9 rounded-control border-2 border-line px-2.5 text-[11px] font-extrabold text-muted hover:border-saffron hover:text-saffron"
          >
            {t("pwa.install.later")}
          </button>
        </>
      )}
    </div>
  );
}