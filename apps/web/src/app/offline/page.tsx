/* Offline fallback — what the service worker serves when the network is
   gone and nothing is cached for the requested page. Honest, branded,
   one retry button. */
"use client";

import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { Logo } from "@/components/Logo";
import { Wordmark } from "@/components/Wordmark";

export default function OfflinePage() {
  const { t } = useI18n();
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      <div className="flex items-center gap-3">
        <Logo className="h-12 w-12" />
        <Wordmark className="text-3xl font-black tracking-tight text-navy" />
      </div>
      <span className="flex h-16 w-16 items-center justify-center rounded-pill bg-saffron/10 text-saffron">
        <Icon name="refresh" className="h-8 w-8" />
      </span>
      <h1 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("pwa.off.h")}</h1>
      <p className="max-w-md text-sm font-semibold leading-relaxed text-muted">{t("pwa.off.sub")}</p>
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="min-h-12 rounded-control bg-saffron px-6 py-3 text-sm font-extrabold text-snow hover:shadow-lift"
      >
        {t("pwa.off.retry")}
      </button>
    </main>
  );
}