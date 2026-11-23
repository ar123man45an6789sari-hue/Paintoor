/* ContentView — storefront control: the two demo banners that drive the
   marketing strip on the home page (announce + festival), plus a preview
   grid of every marketplace aisle and store so the admin can see what
   customers see. Banner toggles flip flags in adminState; wiring the
   banners to a CMS is Phase 4 work. */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon, type IconName } from "@/components/Icons";
import { AISLES, STORES } from "@/lib/marketplace";
import { getAdmin, onAdminChange, setBanner } from "@/lib/adminState";

type Banner = {
  id: "announce" | "festival";
  icon: IconName;
  tone: "saffron" | "green";
};

const BANNERS: Banner[] = [
  { id: "announce", icon: "info", tone: "saffron" },
  { id: "festival", icon: "sparkle", tone: "green" },
];

export function ContentView({ onToast }: { onToast: (msg: string) => void }) {
  const { t } = useI18n();
  const [tick, setTick] = useState(0);

  useEffect(() => onAdminChange(() => setTick((v) => v + 1)), []);

  const admin = getAdmin();
  void tick;
  const hiddenShops = new Set(STORES.filter((s) => admin.blocked[`shop:${s.id}`]).map((s) => s.id));

  const flip = useCallback(
    (b: Banner) => {
      const on = !admin.banners[b.id];
      setBanner(b.id, on);
      onToast(on ? t("ad.content.toastOn", { what: t(`ad.content.banner.${b.id}`) }) : t("ad.content.toastOff", { what: t(`ad.content.banner.${b.id}`) }));
    },
    [admin.banners, onToast, t],
  );

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("ad.content.eye")}</p>
      <div className="mt-1">
        <h2 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("ad.content.h")}</h2>
        <p className="mt-1 text-sm font-bold text-muted">{t("ad.content.sub")}</p>
      </div>

      {/* Banners */}
      <section className="mt-4 space-y-2.5">
        {BANNERS.map((b) => {
          const on = Boolean(admin.banners[b.id]);
          return (
            <div key={b.id} className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-white p-4 shadow-card">
              <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-control text-snow ${b.tone === "green" ? "bg-[#0E9F6E]" : "bg-saffron"}`}>
                <Icon name={b.icon} className="h-5 w-5" />
              </span>
              <div className="min-w-0 flex-1 basis-[180px]">
                <b className="block truncate text-sm font-extrabold text-navy">{t(`ad.content.banner.${b.id}`)}</b>
                <p className="truncate text-xs font-semibold text-muted">{t(`ad.content.bannerDetail.${b.id}`)}</p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={t(`ad.content.banner.${b.id}`)}
                onClick={() => flip(b)}
                className={`relative h-7 w-12 shrink-0 rounded-pill transition-colors ${on ? "bg-saffron" : "bg-[rgba(15,23,42,0.18)]"}`}
              >
                <span className={`absolute top-1 h-5 w-5 rounded-pill bg-white shadow-sm transition-all ${on ? "left-6" : "left-1"}`} />
              </button>
            </div>
          );
        })}
        <p className="flex items-start gap-2 rounded-control bg-chuna px-3 py-2.5 text-[11px] font-bold leading-relaxed text-muted">
          <Icon name="info" className="mt-0.5 h-3.5 w-3.5 shrink-0 text-saffron" />
          {t("ad.content.honest")}
        </p>
      </section>

      {/* Storefront preview */}
      <section className="mt-4 rounded-card border border-line bg-white p-5 shadow-card">
        <h3 className="text-sm font-black text-navy">{t("ad.content.preview")}</h3>
        <p className="mt-0.5 text-xs font-semibold text-muted">{t("ad.content.previewSub")}</p>
        <div className="mt-3 flex flex-wrap gap-2">
          {AISLES.map((a) => (
            <span key={a.key} className="rounded-pill border border-line bg-chuna px-3 py-1.5 text-xs font-extrabold text-navy">
              {a.label}
            </span>
          ))}
        </div>
        <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {STORES.map((s) => {
            const hidden = hiddenShops.has(s.id);
            return (
              <div key={s.id} className={`rounded-control border border-line p-3 text-center ${hidden ? "opacity-45" : ""}`}>
                <span className="mx-auto flex h-10 w-10 items-center justify-center rounded-pill bg-chuna text-[13px] font-black text-navy">
                  {s.n.slice(0, 2)}
                </span>
                <b className="mt-2 block truncate text-xs font-extrabold text-navy">{s.n}</b>
                <span className="block text-[10px] font-bold text-muted">{s.a} · {s.km} km</span>
                {hidden && <span className="mt-1 block text-[10px] font-black text-saffron">{t("ad.content.hiddenByAdmin")}</span>}
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
}