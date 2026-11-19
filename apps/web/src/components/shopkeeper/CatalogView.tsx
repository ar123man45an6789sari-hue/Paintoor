/* CatalogView — the shelf: search, category chips, brand tiles (real paint
   logos from /brands, monogram tiles for hardware/sanitary so no wrong logo
   ever shows), listing toggles and stock pills. Editing stock lives in the
   Stock & Restock view; this one is the storefront mirror. */
"use client";

import Image from "next/image";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { getShopState, onShopStateChange } from "@/lib/shopState";
import type { ShopProduct } from "@/lib/shopState";
import { listedFor, onFlowChange, setListed } from "@/lib/shopflow";
import type { ShopView } from "./shopNav";

/* Paint brands carry their real logo; everything else gets a neutral
   monogram tile — never a paint logo on a hardware brand. */
const LOGO: Record<string, string> = {
  "Asian Paints": "/brands/asian-paints.png",
  Berger: "/brands/berger.png",
  Nerolac: "/brands/nerolac.png",
  "Birla White": "/brands/birla-opus.png",
};

function BrandTile({ brand }: { brand: string }) {
  const src = LOGO[brand];
  if (src) {
    return <Image src={src} alt={brand} width={36} height={36} className="h-9 w-9 rounded-pill border border-line bg-white object-contain p-1" />;
  }
  return (
    <span className="flex h-9 w-9 items-center justify-center rounded-pill border border-line bg-chuna text-[10px] font-black text-navy">
      {brand.slice(0, 2).toUpperCase()}
    </span>
  );
}

export function CatalogView({ go }: { go: (v: ShopView) => void }) {
  const { t } = useI18n();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [tick, setTick] = useState(0);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("all");

  const reload = useCallback(() => setProducts(getShopState().products), []);
  useEffect(() => {
    reload();
    const offS = onShopStateChange(reload);
    const offF = onFlowChange(() => setTick((v) => v + 1));
    return () => { offS(); offF(); };
  }, [reload]);

  const cats = useMemo(() => ["all", ...Array.from(new Set(products.map((p) => p.category)))], [products]);
  const shown = useMemo(() => {
    void tick;
    const q = query.trim().toLowerCase();
    return products.filter(
      (p) => (cat === "all" || p.category === cat) && (!q || p.name.toLowerCase().includes(q) || p.brand.toLowerCase().includes(q)),
    );
  }, [products, cat, query, tick]);

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("sw.cat.eye")}</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("sw.cat.h")}</h2>
          <p className="mt-1 text-sm font-bold text-muted">{t("sw.cat.sub", { n: products.length })}</p>
        </div>
        <button
          type="button"
          onClick={() => go("stock")}
          className="min-h-10 rounded-control border-2 border-line px-3 py-2 text-xs font-extrabold text-navy hover:border-saffron hover:text-saffron"
        >
          <Icon name="package" className="mr-1 inline h-3.5 w-3.5" />
          {t("sw.cat.toStock")}
        </button>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="relative min-w-0 flex-1 sm:max-w-[280px]">
          <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("sw.cat.search")}
            aria-label={t("sw.cat.search")}
            className="min-h-11 w-full rounded-control border-2 border-line bg-white pl-9 pr-3 py-2.5 text-sm font-bold text-navy placeholder:font-semibold placeholder:text-muted focus:border-saffron focus:outline-none"
          />
        </label>
        <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={t("sw.cat.filters")}>
          {cats.map((c) => (
            <button
              key={c}
              type="button"
              role="tab"
              aria-selected={cat === c}
              onClick={() => setCat(c)}
              className={`min-h-10 rounded-pill border-2 px-3.5 py-1.5 text-xs font-extrabold transition-colors ${
                cat === c ? "border-saffron bg-saffron text-snow" : "border-line bg-white text-muted hover:border-saffron hover:text-saffron"
              }`}
            >
              {c === "all" ? t("sw.cat.all") : t(`shcat.${c}`)}
            </button>
          ))}
        </div>
      </div>

      {shown.length === 0 ? (
        <div className="mt-4 rounded-card border-2 border-dashed border-line bg-white p-6 text-center">
          <Icon name="search" className="mx-auto h-8 w-8 text-saffron" />
          <p className="mt-2 font-extrabold text-navy">{t("sw.cat.noMatch")}</p>
        </div>
      ) : (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {shown.map((p) => {
            const listed = listedFor(p.id);
            const out = p.stock <= 0;
            const low = !out && p.stock <= p.lowStockAt;
            return (
              <article key={p.id} className={`rounded-card border border-line bg-white p-4 shadow-card ${listed ? "" : "opacity-70"}`}>
                <div className="flex items-start gap-3">
                  <BrandTile brand={p.brand} />
                  <div className="min-w-0 flex-1">
                    <h3 className="truncate text-sm font-extrabold text-navy">{p.name}</h3>
                    <p className="truncate text-xs font-semibold text-muted">
                      {p.brand} · {t(`shcat.${p.category}`)} · {p.unit}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-pill bg-ink/8 px-2.5 py-0.5 text-xs font-black tabular-nums text-navy">
                    ₹{p.price.toLocaleString("en-IN")}
                  </span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <span
                    className={`rounded-pill px-2.5 py-0.5 text-[11px] font-black ${
                      out ? "bg-[rgba(199,0,60,0.12)] text-[#C7003C]" : low ? "bg-saffron/15 text-saffron" : "bg-[rgba(14,159,110,0.12)] text-[#0E9F6E]"
                    }`}
                  >
                    {out ? t("sw.pill.out") : low ? t("sw.pill.low", { n: p.stock }) : t("sw.pill.in", { n: p.stock })}
                  </span>
                  <button
                    type="button"
                    onClick={() => setListed(p.id, !listed)}
                    className={`ml-auto flex min-h-9 items-center gap-1.5 rounded-control border-2 px-2.5 py-1 text-[11px] font-extrabold transition-colors ${
                      listed ? "border-line text-muted hover:border-saffron hover:text-saffron" : "border-saffron bg-saffron/10 text-saffron"
                    }`}
                  >
                    <Icon name="eye" className={`h-3.5 w-3.5 ${listed ? "" : "opacity-40"}`} />
                    {listed ? t("sw.cat.listed") : t("sw.cat.hidden")}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}