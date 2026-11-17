/* Paint store — the dashboard-native shop shelf.

   The dashboard view embeds the public marketplace browser itself so both
   surfaces look and behave identically: same search, filters, cards, store
   compare and cart. Only the heading and the account identity strip are
   dashboard-specific; checkout runs through the global cart drawer, which
   gates guests and records the signed-in identity. */
"use client";

import { Suspense } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { MarketplaceBrowser } from "@/components/marketplace/MarketplaceBrowser";
import { useProfile } from "@/lib/profile";
import type { Session } from "@/lib/session";

export function PaintStore({ session }: { session: Session }) {
  const { t } = useI18n();
  const [profile] = useProfile();

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("cd.nav.store")}</h1>
        <p className="mt-1 text-sm font-bold text-muted">{t("cd.store.sub")}</p>
      </div>

      <p className="flex items-start gap-1.5 rounded-control bg-ink/10 px-2.5 py-2 text-[11px] font-bold text-ink">
        <Icon name="shield" className="mt-0.5 h-3.5 w-3.5 shrink-0" />
        <span className="min-w-0">
          <b className="font-extrabold">{t("cd.store.idas")}:</b> {session.name}, {profile.phone}
          <span className="mt-0.5 block font-bold text-muted">{t("cd.store.idnote")}</span>
        </span>
      </p>

      <Suspense fallback={null}>
        <MarketplaceBrowser embedded />
      </Suspense>
    </div>
  );
}