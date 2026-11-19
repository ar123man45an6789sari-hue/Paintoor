/* ProfileView — how the storefront reads to painters: location, rating,
   counter hours (editable), categories, GST/KYC status and the brand wall.
   Paint brands show their real logos from /brands; hardware and sanitary
   get neutral category tiles — a paint logo never sits on the wrong brand. */
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import type { ShopProfile } from "@/lib/shopState";
import { getFlow, onFlowChange, setHours } from "@/lib/shopflow";
import type { ShopHours } from "@/lib/shopflow";
import type { ShopView } from "./shopNav";

const GRAD = "linear-gradient(135deg,#E00048,#A80036)";

/* Real logos exist only for paint brands stocked at the counter; the rest
   fall back to a category tile so no hardware brand ever wears paint livery. */
const BRAND_LOGO: Record<string, string> = {
  "Asian Paints": "/brands/asian-paints.png",
  Berger: "/brands/berger.png",
  Nerolac: "/brands/nerolac.png",
  "Birla White": "/brands/birla-opus.png",
};

const BRAND_CATEGORY: Record<string, string> = {
  Finolex: "hardware",
  Havells: "hardware",
  Anchor: "hardware",
  Astral: "sanitary",
  Parryware: "sanitary",
  Generic: "sanitary",
};

function BrandChip({ brand }: { brand: string }) {
  const { t } = useI18n();
  const logo = BRAND_LOGO[brand];
  const cat = BRAND_CATEGORY[brand];
  return (
    <li className="flex items-center gap-2.5 rounded-control border border-line bg-white px-3 py-2.5">
      {logo ? (
        <Image src={logo} alt={brand} width={32} height={32} className="h-8 w-8 rounded-pill border border-line bg-white object-contain p-0.5" />
      ) : (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-pill bg-chuna text-navy">
          <Icon name={cat === "hardware" ? "bolt" : "droplet"} className="h-4 w-4" />
        </span>
      )}
      <span className="min-w-0">
        <b className="block truncate text-xs font-extrabold text-navy">{brand}</b>
        <span className="block text-[10px] font-bold text-muted">
          {t(`shcat.${logo ? "paints" : cat ?? "paints"}`)}
        </span>
      </span>
    </li>
  );
}

export function ProfileView({ profile, go }: { profile: ShopProfile; go: (v: ShopView) => void }) {
  const { t } = useI18n();
  const [hours, setHoursLocal] = useState<ShopHours>({ open: "09:00", close: "21:00" });

  useEffect(() => {
    setHoursLocal(getFlow().hours);
    return onFlowChange(() => setHoursLocal(getFlow().hours));
  }, []);

  const paintBrands = ["Asian Paints", "Berger", "Nerolac", "Birla White"];
  const tradeBrands = ["Finolex", "Havells", "Anchor", "Astral", "Parryware"];
  const hasGst = Boolean(profile.gstin);

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("sw.prof.eye")}</p>
      <div className="mt-1">
        <h2 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("sw.prof.h")}</h2>
        <p className="mt-1 text-sm font-bold text-muted">{t("sw.prof.sub")}</p>
      </div>

      {/* Storefront card */}
      <section className="mt-4 overflow-hidden rounded-sheet border border-line bg-white shadow-card">
        <div className="h-20 md:h-24" style={{ background: GRAD }} />
        <div className="px-5 pb-5">
          <div className="-mt-9 flex flex-wrap items-end gap-3 md:-mt-10">
            <span className="flex h-[68px] w-[68px] shrink-0 items-center justify-center rounded-pill border-4 border-white bg-snow text-xl font-black text-saffron shadow-card">
              {profile.name.split(" ").map((x) => x[0]).slice(0, 2).join("")}
            </span>
            <div className="min-w-0 flex-1 pb-0.5">
              <h3 className="truncate text-lg font-black text-navy">{profile.name}</h3>
              <p className="truncate text-xs font-bold text-muted">
                <Icon name="mapPin" className="mr-1 inline h-3.5 w-3.5 align-[-0.15em] text-saffron" />
                {profile.zone}, {profile.city}
              </p>
            </div>
            <span className="mb-0.5 flex items-center gap-1 rounded-pill bg-saffron/10 px-3 py-1.5 text-xs font-black text-saffron">
              <Icon name="star" className="h-3.5 w-3.5" />
              {profile.rating} {t("sw.prof.rating")}
            </span>
          </div>

          <dl className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-control bg-chuna p-3.5">
              <dt className="text-[11px] font-black uppercase tracking-[0.14em] text-muted">{t("sw.prof.hours")}</dt>
              <dd className="mt-2 flex items-center gap-2">
                <label className="sr-only" htmlFor="shop-open">{t("sw.prof.openAt")}</label>
                <input
                  id="shop-open"
                  type="time"
                  value={hours.open}
                  onChange={(e) => {
                    const next = { ...hours, open: e.target.value };
                    setHoursLocal(next);
                    setHours(next);
                  }}
                  className="min-h-10 rounded-control border-2 border-line bg-white px-2.5 text-xs font-extrabold tabular-nums text-navy focus:border-saffron focus:outline-none"
                />
                <span className="text-xs font-black text-muted">{t("sw.prof.to")}</span>
                <label className="sr-only" htmlFor="shop-close">{t("sw.prof.closeAt")}</label>
                <input
                  id="shop-close"
                  type="time"
                  value={hours.close}
                  onChange={(e) => {
                    const next = { ...hours, close: e.target.value };
                    setHoursLocal(next);
                    setHours(next);
                  }}
                  className="min-h-10 rounded-control border-2 border-line bg-white px-2.5 text-xs font-extrabold tabular-nums text-navy focus:border-saffron focus:outline-none"
                />
              </dd>
            </div>
            <div className="rounded-control bg-chuna p-3.5">
              <dt className="text-[11px] font-black uppercase tracking-[0.14em] text-muted">{t("sw.prof.cats")}</dt>
              <dd className="mt-2 flex flex-wrap gap-1.5">
                {profile.categories.map((c) => (
                  <span key={c} className="rounded-pill bg-saffron/10 px-2.5 py-1 text-[11px] font-extrabold text-saffron">
                    {t(`shcat.${c}`)}
                  </span>
                ))}
              </dd>
            </div>
          </dl>

          {/* GST / KYC */}
          <div className="mt-3 rounded-control border border-line p-3.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-control bg-saffron/10 text-saffron">
                <Icon name={hasGst ? "shieldCheck" : "alert"} className="h-[18px] w-[18px]" />
              </span>
              <div className="min-w-0 flex-1">
                <b className="block text-sm font-extrabold text-navy">{hasGst ? t("sw.prof.kycOk") : t("sw.prof.kycPending")}</b>
                <span className="block truncate text-xs font-semibold text-muted">
                  {hasGst ? `GSTIN ${profile.gstin}` : t("sw.prof.kycPendingSub")}
                </span>
              </div>
              <span
                className={`shrink-0 rounded-pill px-2.5 py-0.5 text-[11px] font-black ${
                  hasGst ? "bg-[rgba(14,159,110,0.12)] text-[#0E9F6E]" : "bg-saffron/15 text-saffron"
                }`}
              >
                {hasGst ? t("sw.prof.verified") : t("sw.prof.action")}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Brand wall */}
      <section className="mt-4 rounded-card border border-line bg-white p-5 shadow-card">
        <h3 className="text-sm font-black text-navy">{t("sw.prof.brands")}</h3>
        <p className="mt-0.5 text-xs font-bold text-muted">{t("sw.prof.brandsSub")}</p>
        <p className="mt-3 text-[11px] font-black uppercase tracking-[0.14em] text-muted">{t("sw.prof.paintBrands")}</p>
        <ul className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-4">
          {paintBrands.map((b) => <BrandChip key={b} brand={b} />)}
        </ul>
        <p className="mt-3 text-[11px] font-black uppercase tracking-[0.14em] text-muted">{t("sw.prof.tradeBrands")}</p>
        <ul className="mt-2 grid grid-cols-2 gap-2 lg:grid-cols-5">
          {tradeBrands.map((b) => <BrandChip key={b} brand={b} />)}
        </ul>
      </section>

      <button
        type="button"
        onClick={() => go("settings")}
        className="mt-4 flex min-h-12 w-full items-center gap-2.5 rounded-card border border-line bg-white px-4 py-3 text-left text-sm font-extrabold text-navy shadow-card hover:border-saffron hover:text-saffron"
      >
        <Icon name="gear" className="h-4 w-4 shrink-0 text-saffron" />
        {t("sw.prof.toSettings")}
        <Icon name="chevRight" className="ml-auto h-4 w-4 shrink-0" />
      </button>
    </div>
  );
}