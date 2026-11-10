/* Compare tray + modal — pick up to 3 products from the cards; a slim tray
   rides at the bottom of the screen and the modal lays them out side by
   side, cheapest-store row included (per-store pricing is our edge — no
   competitor shows it). */
"use client";

import { PRODUCTS, brandOf, cheapest, offPct, type Product } from "@/lib/marketplace";
import { Icon } from "@/components/Icons";
import { useI18n } from "@/i18n";

export function CompareTray({
  ids, onRemove, onClear, onOpen,
}: {
  ids: number[]; onRemove: (id: number) => void; onClear: () => void; onOpen: () => void;
}) {
  const { t } = useI18n();
  if (ids.length === 0) return null;
  const items = ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter((p): p is Product => !!p);
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-4 py-3 backdrop-blur md:px-8 dark:bg-raatri/95">
      <div className="mx-auto flex max-w-6xl items-center gap-3 overflow-x-auto">
        <span className="hidden whitespace-nowrap text-xs font-black uppercase tracking-[0.14em] text-muted sm:block">{t("cmp.hint")}</span>
        {items.map((p) => (
          <span key={p.id} className="flex flex-none items-center gap-2 rounded-pill border border-line bg-chuna px-3 py-1.5 text-xs font-extrabold text-ink dark:bg-[#12161a] dark:text-snow">
            <span className="h-3.5 w-3.5 rounded-pill" style={{ background: p.sh[1] }} aria-hidden="true" />
            {p.n.length > 22 ? `${p.n.slice(0, 22)}…` : p.n}
            <button type="button" onClick={() => onRemove(p.id)} aria-label={t("mk.remove")} className="text-muted hover:text-saffron">✕</button>
          </span>
        ))}
        <button type="button" onClick={onOpen} disabled={ids.length < 2} className="ml-auto flex-none rounded-control bg-saffron px-5 py-2 text-sm font-extrabold text-snow transition-colors hover:bg-[#a80036] disabled:opacity-40">
          {t("cmp.open")} ({ids.length})
        </button>
        <button type="button" onClick={onClear} className="flex-none rounded-control border border-line bg-white px-4 py-2 text-sm font-extrabold text-ink transition-colors hover:border-saffron hover:text-saffron dark:bg-raatri dark:text-snow">
          {t("cmp.clear")}
        </button>
      </div>
    </div>
  );
}

export function CompareModal({ ids, onClose, onAdd }: { ids: number[]; onClose: () => void; onAdd: (p: Product) => void }) {
  const { t } = useI18n();
  const items = ids.map((id) => PRODUCTS.find((p) => p.id === id)).filter((p): p is Product => !!p);
  if (items.length === 0) return null;
  const best = items.map((p) => cheapest(p).p);
  const minBest = Math.min(...best);
  const rows: [string, (p: Product) => string][] = [
    [t("mk.spec.pack"), (p) => (p.size === 40 ? "40 kg" : `${p.size} L`)],
    [t("mk.spec.fin"), (p) => p.fin || "—"],
    [t("mk.spec.cov"), (p) => `≈ ${p.cov} sq ft/${p.size === 40 ? "kg" : "L"}`],
    [t("mk.spec.dry"), (p) => `${p.dry} h`],
    [t("mk.rating"), (p) => `${p.r}★`],
    [t("mk.off"), (p) => `${offPct(p)}%`],
  ];
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy/60 p-4" role="dialog" aria-modal="true" aria-label={t("cmp.title")} onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-3xl overflow-y-auto rounded-sheet border border-line bg-white shadow-lift dark:bg-raatri" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-line bg-white/95 px-5 py-4 backdrop-blur dark:bg-raatri/95">
          <h2 className="text-base font-black text-navy dark:text-snow">{t("cmp.title")}</h2>
          <button type="button" onClick={onClose} aria-label={t("mk.close")} className="flex h-9 w-9 items-center justify-center rounded-pill border border-line text-muted transition-colors hover:border-saffron hover:text-saffron">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>
        <div className="overflow-x-auto p-5">
          <div className="grid min-w-[560px] gap-x-3" style={{ gridTemplateColumns: `130px repeat(${items.length}, minmax(0, 1fr))` }}>
            <span />
            {items.map((p, i) => (
              <div key={p.id} className={`rounded-card border p-3 ${best[i] === minBest ? "border-saffron ring-2 ring-saffron/25" : "border-line"}`}>
                <span className="block h-14 rounded-control" style={{ backgroundImage: `linear-gradient(135deg, ${p.sh[0]}, ${p.sh[2]})` }} aria-hidden="true" />
                <p className="mt-2 text-xs font-extrabold text-muted">{brandOf(p.b).name}</p>
                <p className="mk-clamp2 text-sm font-extrabold text-navy dark:text-snow">{p.n}</p>
              </div>
            ))}
            {rows.map(([label, fn]) => (
              <div key={label} className="contents">
                <span className="border-t border-line py-2.5 pr-2 text-xs font-bold uppercase tracking-wide text-muted">{label}</span>
                {items.map((p) => (
                  <span key={p.id} className="border-t border-line py-2.5 text-sm font-extrabold text-ink dark:text-snow">{fn(p)}</span>
                ))}
              </div>
            ))}
            <span className="border-t border-line py-2.5 pr-2 text-xs font-bold uppercase tracking-wide text-muted">{t("cmp.best")}</span>
            {items.map((p, i) => {
              const ch = cheapest(p);
              return (
                <span key={p.id} className={`border-t border-line py-2.5 text-sm ${best[i] === minBest ? "font-black text-saffron" : "font-extrabold text-ink dark:text-snow"}`}>
                  ₹{ch.p.toLocaleString("en-IN")}
                  <span className="block text-xs font-bold text-muted">{ch.s.n.split(" ")[0]} · {ch.s.km} km</span>
                </span>
              );
            })}
            <span className="border-t border-line py-3 pr-2" />
            {items.map((p) => (
              <span key={p.id} className="border-t border-line py-3">
                <button type="button" onClick={() => onAdd(p)} className="min-h-9 w-full rounded-control bg-saffron px-3 py-2 text-xs font-extrabold text-snow transition-colors hover:bg-[#a80036]">
                  {t("mk.add")}
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}