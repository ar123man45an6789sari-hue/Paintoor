/* Partner paint store — the same embedded marketplace browser the customer
   dashboard uses, with a partner-angle heading and buying-identity strip.
   Role-first authentication is inherent: this surface only renders for a
   signed-in provider, and checkout runs through the global cart drawer. */
"use client";

import { Suspense } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { MarketplaceBrowser } from "@/components/marketplace/MarketplaceBrowser";
import type { ProviderProfile } from "@/lib/providers";

export function PartnerStore({ profile }: { profile: ProviderProfile }) {
  const { t } = useI18n();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("pw.store.h")}</h1>
        <p className="mt-1 text-sm font-bold text-muted">{t("pw.store.sub")}</p>
      </div>

      <p className="flex items-start gap-1.5 rounded-control bg-ink/10 px-2.5 py-2 text-[11px] font-bold text-ink">
        <Icon name="shield" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0">
          <b className="font-extrabold">{t("pw.store.as")}:</b> {profile.name}, {profile.zone} · {profile.city}
          <span className="mt-0.5 block font-bold text-muted">{t("pw.store.note")}</span>
        </span>
      </p>

      <Suspense fallback={null}>
        <MarketplaceBrowser embedded />
      </Suspense>
    </div>
  );
}