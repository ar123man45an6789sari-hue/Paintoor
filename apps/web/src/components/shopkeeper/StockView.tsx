/* StockView — the godown: every SKU with steppers, low-stock filters and a
   restock sheet whose default quantity is (min × 2 − current), i.e. enough
   to get back to a comfortable double-buffer. changeStock() from shopState
   is the only writer. */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { changeStock, getShopState, onShopStateChange } from "@/lib/shopState";
import type { ShopProduct } from "@/lib/shopState";

export function StockView() {
  const { t } = useI18n();
  const [products, setProducts] = useState<ShopProduct[]>([]);
  const [filter, setFilter] = useState<"all" | "low">("all");
  const [restock, setRestock] = useState<ShopProduct | null>(null);
  const [qty, setQty] = useState(0);

  const reload = useCallback(() => setProducts(getShopState().products), []);
  useEffect(() => {
    reload();
    const off = onShopStateChange(reload);
    return off;
  }, [reload]);

  const lowCount = products.filter((p) => p.stock <= p.lowStockAt).length;
  const shown = useMemo(
    () => (filter === "low" ? products.filter((p) => p.stock <= p.lowStockAt) : products),
    [products, filter],
  );

  function openRestock(p: ShopProduct) {
    setRestock(p);
    setQty(Math.max(0, p.lowStockAt * 2 - p.stock));
  }

  function confirmRestock() {
    if (!restock || qty <= 0) return;
    changeStock(restock.id, restock.stock + qty);
    setRestock(null);
  }

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("sw.stock.eye")}</p>
      <div className="mt-1 flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("sw.stock.h")}</h2>
          <p className="mt-1 text-sm font-bold text-muted">{t("sw.stock.sub", { n: products.length })}</p>
        </div>
        <div className="flex gap-1.5" role="tablist" aria-label={t("sw.stock.filterAria")}>
          {(["all", "low"] as const).map((f) => (
            <button
              key={f}
              type="button"
              role="tab"
              aria-selected={filter === f}
              onClick={() => setFilter(f)}
              className={`min-h-10 rounded-pill border-2 px-3.5 py-1.5 text-xs font-extrabold transition-colors ${
                filter === f ? "border-saffron bg-saffron text-snow" : "border-line bg-white text-muted hover:border-saffron hover:text-saffron"
              }`}
            >
              {f === "all" ? t("sw.stock.all") : t("sw.stock.lowTab", { n: lowCount })}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        {shown.map((p) => {
          const out = p.stock <= 0;
          const low = !out && p.stock <= p.lowStockAt;
          return (
            <article key={p.id} className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-white p-3.5 shadow-card">
              <div className="min-w-0 flex-1 basis-[180px]">
                <h3 className="truncate text-sm font-extrabold text-navy">{p.name}</h3>
                <p className="truncate text-xs font-semibold text-muted">
                  {p.brand} · {t(`shcat.${p.category}`)} · {t("sw.stock.min", { n: p.lowStockAt })}
                </p>
              </div>
              <span
                className={`rounded-pill px-2.5 py-0.5 text-[11px] font-black ${
                  out ? "bg-[rgba(199,0,60,0.12)] text-[#C7003C]" : low ? "bg-saffron/15 text-saffron" : "bg-[rgba(14,159,110,0.12)] text-[#0E9F6E]"
                }`}
              >
                {out ? t("sw.pill.out") : low ? t("sw.pill.low", { n: p.stock }) : t("sw.pill.in", { n: p.stock })}
              </span>
              <span className="flex items-center gap-1 rounded-control border-2 border-line p-1">
                <button
                  type="button"
                  aria-label={t("sw.stock.decAria")}
                  disabled={p.stock <= 0}
                  onClick={() => changeStock(p.id, p.stock - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-control text-navy hover:bg-saffron hover:text-snow disabled:cursor-not-allowed disabled:opacity-30"
                >
                  <Icon name="minus" className="h-3.5 w-3.5" />
                </button>
                <b className="w-9 text-center text-sm font-black tabular-nums text-navy">{p.stock}</b>
                <button
                  type="button"
                  aria-label={t("sw.stock.incAria")}
                  onClick={() => changeStock(p.id, p.stock + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-control text-navy hover:bg-saffron hover:text-snow"
                >
                  <Icon name="plus" className="h-3.5 w-3.5" />
                </button>
              </span>
              <button
                type="button"
                onClick={() => openRestock(p)}
                className="min-h-10 rounded-control bg-saffron px-3.5 py-2 text-xs font-extrabold text-snow hover:shadow-lift"
              >
                <Icon name="truck" className="mr-1 inline h-3.5 w-3.5" />
                {t("sw.stock.restock")}
              </button>
            </article>
          );
        })}
        {shown.length === 0 && (
          <div className="rounded-card border-2 border-dashed border-line bg-white p-6 text-center">
            <Icon name="checkCircle" className="mx-auto h-8 w-8 text-[#0E9F6E]" />
            <p className="mt-2 font-extrabold text-navy">{t("sw.stock.clear")}</p>
          </div>
        )}
      </div>

      {/* Restock sheet */}
      {restock && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-ink/45 p-4 sm:items-center" role="dialog" aria-modal="true">
          <div className="w-[min(94vw,420px)] rounded-card border border-line bg-white p-5 shadow-lift">
            <h3 className="text-lg font-black text-navy">{t("sw.rs.h", { name: restock.name })}</h3>
            <p className="mt-1 text-xs font-bold text-muted">{t("sw.rs.sub")}</p>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-xs font-extrabold">
              <div className="rounded-control bg-chuna px-3 py-2">
                <dt className="font-bold text-muted">{t("sw.rs.now")}</dt>
                <dd className="mt-0.5 text-sm font-black tabular-nums text-navy">{restock.stock} {restock.unit}</dd>
              </div>
              <div className="rounded-control bg-chuna px-3 py-2">
                <dt className="font-bold text-muted">{t("sw.rs.after")}</dt>
                <dd className="mt-0.5 text-sm font-black tabular-nums text-saffron">{restock.stock + qty} {restock.unit}</dd>
              </div>
            </dl>
            <label className="mt-4 block text-xs font-black uppercase tracking-[0.14em] text-muted" htmlFor="restock-qty">
              {t("sw.rs.qty")}
            </label>
            <input
              id="restock-qty"
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(0, Number(e.target.value)))}
              className="mt-1.5 min-h-11 w-full rounded-control border-2 border-line bg-white px-3 py-2.5 text-sm font-black tabular-nums text-navy focus:border-saffron focus:outline-none"
            />
            <p className="mt-1.5 text-[11px] font-bold text-muted">
              {t("sw.rs.hint", { n: Math.max(0, restock.lowStockAt * 2 - restock.stock) })}
            </p>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={confirmRestock} disabled={qty <= 0} className="min-h-11 flex-1 rounded-control bg-saffron px-4 py-2.5 text-sm font-extrabold text-snow hover:shadow-lift disabled:opacity-40">
                {t("sw.rs.go")}
              </button>
              <button
                type="button"
                onClick={() => setRestock(null)}
                className="min-h-10 rounded-control border-2 border-line px-3 py-2 text-xs font-extrabold text-navy hover:border-saffron hover:text-saffron"
              >
                {t("sw.cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}