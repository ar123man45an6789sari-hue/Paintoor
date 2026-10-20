/* CatalogGrid v1 — product grid with stock steppers and low-stock flags. */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { changeStock, getShopState, onShopStateChange } from "@/lib/shopState";
import type { ShopProduct } from "@/lib/shopState";

export function CatalogGrid() {
  const { t } = useI18n();
  const [products, setProducts] = useState<ShopProduct[]>([]);

  const reload = useCallback(() => setProducts(getShopState().products), []);

  useEffect(() => {
    reload();
    return onShopStateChange(reload);
  }, [reload]);

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-black text-navy">📦 {t("sh.catalogH")}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {products.map((p) => {
          const out = p.stock === 0;
          const low = !out && p.stock <= p.lowStockAt;
          return (
            <article key={p.id} className="rounded-card border border-line bg-white p-4 shadow-card">
              <div className="flex items-baseline justify-between gap-2">
                <h3 className="text-sm font-extrabold text-navy">{p.name}</h3>
                <span className="text-sm font-black tabular-nums text-navy">₹{p.price.toLocaleString("en-IN")}</span>
              </div>
              <p className="mt-0.5 text-xs font-semibold text-muted">
                {p.brand} · {t(`shcat.${p.category}`)}
              </p>
              <div className="mt-3 flex items-center justify-between">
                <span
                  className={`rounded-pill px-2.5 py-1 text-xs font-black ${
                    out ? "bg-danger/15 text-danger" : low ? "bg-haldi/20 text-navy" : "bg-neem/15 text-neem"
                  }`}
                >
                  {out ? t("sh.outOfStock") : low ? `${t("sh.lowStock")} · ${p.stock}` : `${t("sh.stock")}: ${p.stock}`}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    aria-label={`- ${p.name}`}
                    onClick={() => changeStock(p.id, -1)}
                    className="flex h-11 w-11 items-center justify-center rounded-control border-2 border-line text-lg font-black text-muted hover:border-danger hover:text-danger"
                  >
                    −
                  </button>
                  <button
                    type="button"
                    aria-label={`+ ${p.name}`}
                    onClick={() => changeStock(p.id, 1)}
                    className="flex h-11 w-11 items-center justify-center rounded-control border-2 border-line text-lg font-black text-muted hover:border-neem hover:text-neem"
                  >
                    +
                  </button>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}