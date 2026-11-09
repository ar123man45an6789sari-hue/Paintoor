import { BRANDS, brandOf, offPct, storesFor, priceAt, type Product } from "@/lib/marketplace";
import { Icon } from "@/components/Icons";
import { useI18n } from "@/i18n";

export function ProductModal({ p, onClose, onAddAt }: { p: Product | null; onClose: () => void; onAddAt: (p: Product, sid: string) => void }) {
  const { t } = useI18n();
  if (!p) return null;
  const b = brandOf(p.b);
  const brand = BRANDS.find((x) => x.slug === p.b)!;
  const rows = storesFor(p);
  const min = Math.min(...rows.map((s) => priceAt(p, s)));
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center md:items-center" role="dialog" aria-modal="true" aria-label={p.n}>
      <button type="button" aria-label={t("mk.close")} onClick={onClose} className="absolute inset-0 bg-navy/60" />
      <div className="relative z-10 max-h-[90vh] w-full max-w-[720px] overflow-y-auto rounded-t-sheet border border-line bg-white shadow-lift md:rounded-sheet dark:bg-raatri">
        <div className="sticky top-0 z-10 flex items-center gap-3 border-b border-line bg-white/95 px-5 py-4 backdrop-blur dark:bg-raatri/95">
          <span className="h-8 w-8 flex-none rounded-pill" style={{ background: brand.c }} aria-hidden="true" />
          <h2 className="flex-1 text-base font-black text-navy dark:text-snow">{p.n}</h2>
          <button type="button" onClick={onClose} aria-label={t("mk.close")} className="flex h-9 w-9 flex-none items-center justify-center rounded-pill border border-line text-muted transition-colors hover:border-saffron hover:text-saffron">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>
        <div className="p-5">
          <div className="flex flex-wrap items-baseline gap-3">
            <span className="text-[26px] font-black text-ink dark:text-snow">₹{p.price.toLocaleString("en-IN")}</span>
            <span className="text-base font-semibold text-muted line-through">₹{p.mrp.toLocaleString("en-IN")}</span>
            {offPct(p) >= 1 && <span className="rounded-pill bg-saffron px-2 py-0.5 text-xs font-black text-snow">{offPct(p)}% {t("mk.off")}</span>}
            <span className="ml-auto flex items-center gap-1 text-sm font-black text-haldi"><Icon name="star" className="h-4 w-4" />{p.r}</span>
            <span className="text-sm text-muted">{p.sold} sold</span>
          </div>
          <dl className="mt-4 grid gap-3 rounded-card border border-line bg-chuna p-4 sm:grid-cols-2 dark:bg-[#0B0E11]">
            {([[t("mk.spec.cat"), p.cat], [t("mk.spec.fin"), p.fin || "—"], [t("mk.spec.cov"), `≈ ${p.cov} sq ft/${p.size === 40 ? "kg" : "L"}`], [t("mk.spec.dry"), `${p.dry} h`], [t("mk.spec.pack"), p.size === 40 ? "40 kg" : `${p.size} L`]] as const).map(([k, v]) => (
              <div key={k} className="flex justify-between gap-3 text-sm">
                <dt className="font-bold text-muted">{k}</dt>
                <dd className="font-extrabold text-ink dark:text-snow">{v}</dd>
              </div>
            ))}
          </dl>
          <h3 className="mt-5 text-sm font-black uppercase tracking-[0.14em] text-muted">{t("mk.atStores")}</h3>
          <div className="mt-2 overflow-hidden rounded-card border border-line">
            <table className="w-full text-sm">
              <thead className="bg-chuna text-xs font-black uppercase tracking-[0.12em] text-muted dark:bg-[#0B0E11]">
                <tr><th className="px-3 py-2 text-left">{t("mk.storeCol")}</th><th className="px-3 py-2 text-left">{t("mk.priceCol")}</th><th className="px-3 py-2 text-left">{t("mk.delivery")}</th><th className="px-3 py-2 text-right">{t("mk.action")}</th></tr>
              </thead>
              <tbody className="divide-y divide-line">
                {rows.map((s) => {
                  const price = priceAt(p, s);
                  const eta = s.km <= 3 ? t("mk.today") : t("mk.tomorrow");
                  return (
                    <tr key={s.id} className={price === min ? "bg-saffron/5" : "bg-white dark:bg-raatri"}>
                      <td className="px-3 py-2.5">
                        <b className="font-extrabold text-ink dark:text-snow">{s.n}</b>
                        <span className="block text-xs text-muted">{s.km} km · {s.open ? `${t("mk.openTill")} ${s.cls}` : t("mk.opensAt")}</span>
                      </td>
                      <td className="px-3 py-2.5 font-black text-ink dark:text-snow">₹{price.toLocaleString("en-IN")}{price === min && <span className="ml-1.5 rounded-pill bg-saffron px-1.5 py-0.5 text-[10px] font-black text-snow">{t("mk.best")}</span>}</td>
                      <td className="px-3 py-2.5 font-bold text-muted">{eta}</td>
                      <td className="px-3 py-2.5 text-right">
                        <button type="button" onClick={() => onAddAt(p, s.id)} className="min-h-9 rounded-control bg-saffron px-3 py-1.5 text-xs font-extrabold text-snow transition-colors hover:bg-[#a80036]">
                          {t("mk.addAt")} ₹{price.toLocaleString("en-IN")}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <button type="button" onClick={() => onAddAt(p, rows.reduce((a, s) => (priceAt(p, s) < priceAt(p, a) ? s : a)).id)} className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-control bg-navy px-6 py-2.5 text-sm font-extrabold text-snow transition-colors hover:bg-saffron dark:bg-snow dark:text-navy">
            <Icon name="cart" className="h-4 w-4" />{t("mk.add")} — {t("mk.best")}
          </button>
        </div>
      </div>
    </div>
  );
}