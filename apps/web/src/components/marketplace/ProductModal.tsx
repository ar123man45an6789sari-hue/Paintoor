import { useEffect, useRef } from "react";
import Image from "next/image";
import { brandOf, cheapest, offPct, priceAt, storesFor, type Product } from "@/lib/marketplace";
import { Icon } from "@/components/Icons";
import { useI18n } from "@/i18n";

export function ProductModal({ p, onClose, onAddAt }: { p: Product | null; onClose: () => void; onAddAt: (p: Product, storeId: string) => void }) {
  const { t } = useI18n();
  const closeRef = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    if (p) closeRef.current?.focus();
  }, [p]);
  if (!p) return null;
  const b = brandOf(p.b);
  const list = storesFor(p);
  const rows = list.map((s) => ({ s, v: priceAt(p, s) })).sort((a, x) => a.v - x.v);
  const ch = cheapest(p);
  return (
    <div className="mk-modal" role="dialog" aria-modal="true" aria-label={p.n} onClick={onClose}>
      <div className="mk-modal-card rounded-sheet border border-line bg-white shadow-card dark:bg-[#12161a]" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start gap-4 border-b border-line p-5">
          <span className="h-20 w-20 flex-none rounded-card border border-line" style={{ backgroundImage: `linear-gradient(135deg, ${p.sh[0]}, ${p.sh[2]})` }} aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <Image src={`/brands/${p.b}.png`} alt="" width={24} height={24} className="h-6 w-6 rounded-pill border border-line bg-white object-contain p-0.5 dark:bg-raatri" />
              <span className="text-xs font-extrabold text-muted">{b.name}</span>
              <span className="ml-auto flex items-center gap-1 text-sm font-black text-haldi"><Icon name="star" className="h-3.5 w-3.5" />{p.r}</span>
            </div>
            <h2 className="mt-1 text-lg font-black leading-tight text-navy dark:text-snow">{p.n}</h2>
            <div className="mt-2 flex flex-wrap items-baseline gap-2">
              <span className="text-[28px] font-black leading-none text-ink dark:text-snow">₹{ch.p.toLocaleString("en-IN")}</span>
              <span className="text-sm font-semibold text-muted line-through">₹{p.mrp.toLocaleString("en-IN")}</span>
              <span className="rounded-pill bg-saffron/10 px-2 py-0.5 text-xs font-black text-saffron">{offPct(p)}% {t("mk.off")}</span>
            </div>
          </div>
          <button ref={closeRef} type="button" onClick={onClose} aria-label={t("mk.close")} className="flex h-9 w-9 flex-none items-center justify-center rounded-pill border border-line text-muted transition-colors hover:border-saffron hover:text-saffron">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>
        <div className="grid gap-5 p-5 md:grid-cols-2">
          <div>
            <div className="flex gap-2">{p.sh.map((c) => <span key={c} className="h-8 w-8 rounded-pill border border-line" style={{ background: c }} />)}</div>
            <table className="mt-4 w-full text-sm">
              <tbody className="divide-y divide-line">
                {[
                  [t("mk.spec.cat"), p.cat],
                  [t("mk.spec.fin"), p.fin || "—"],
                  [t("mk.spec.cov"), p.size === 40 ? `≈ ${p.cov} sq ft/kg` : `≈ ${p.cov} sq ft/L`],
                  [t("mk.spec.dry"), p.dry],
                  [t("mk.spec.pack"), p.size === 40 ? "40 kg" : `${p.size} L`],
                ].map(([k, v]) => (
                  <tr key={k}>
                    <td className="py-2 pr-3 text-xs font-bold uppercase tracking-wide text-muted">{k}</td>
                    <td className="py-2 text-sm font-extrabold capitalize text-ink dark:text-snow">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.compare")}</p>
            <table className="mt-2 w-full text-sm">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-muted">
                  <th className="py-1.5 pr-2">Store</th><th className="py-1.5 pr-2">Dist</th><th className="py-1.5 pr-2">Price</th><th className="py-1.5">Delivery</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map(({ s, v }) => (
                  <tr key={s.id} className={s.id === ch.s.id ? "bg-saffron/10 font-black text-saffron" : "text-ink dark:text-snow"}>
                    <td className="py-2 pr-2 font-extrabold">{s.n.split(" ")[0]}</td>
                    <td className="py-2 pr-2 text-xs">{s.km} km</td>
                    <td className="py-2 pr-2 font-black">₹{v.toLocaleString("en-IN")}</td>
                    <td className="py-2 text-xs">{s.km <= 3 ? t("mk.today") : t("mk.tomorrow")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button type="button" onClick={() => onAddAt(p, ch.s.id)} className="mt-4 min-h-11 w-full rounded-control bg-saffron px-4 py-2 text-sm font-extrabold text-snow transition-colors hover:bg-[#a80036]">
              {t("mk.addAt", { x: ch.p.toLocaleString("en-IN"), s: ch.s.n.split(" ")[0] })}
            </button>
            <button
              type="button"
              onClick={() => { rows.forEach(({ s }) => onAddAt(p, s.id)); }}
              className="mt-2 min-h-11 w-full rounded-control border border-line bg-white px-4 py-2 text-sm font-extrabold text-ink transition-colors hover:border-saffron hover:text-saffron dark:bg-raatri dark:text-snow"
            >
              {t("mk.addAll")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}