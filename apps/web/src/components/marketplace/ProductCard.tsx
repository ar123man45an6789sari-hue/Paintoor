import Image from "next/image";
import { brandOf, cheapest, offPct, storesFor, type Product } from "@/lib/marketplace";
import { Icon } from "@/components/Icons";
import { useI18n } from "@/i18n";

export function ProductCard({
  p, wished, onWish, onAdd, onOpen, comparing, onCompare,
}: {
  p: Product; wished: boolean; onWish: (id: number) => void;
  onAdd: (p: Product) => void; onOpen: (p: Product) => void;
  comparing: boolean; onCompare: (id: number) => void;
}) {
  const { t } = useI18n();
  const b = brandOf(p.b);
  const ch = cheapest(p);
  const n = storesFor(p).length;
  return (
    <article className="mk-card flex flex-col overflow-hidden rounded-card border border-line bg-white shadow-card transition-all hover:-translate-y-1 hover:border-saffron hover:shadow-lift dark:bg-raatri">
      <div className="mk-media relative flex h-[116px] items-end" style={{ backgroundImage: `linear-gradient(135deg, ${p.sh[0]}, ${p.sh[2]})` }}>
        {offPct(p) >= 1 && (
          <span className="absolute left-3 top-3 rounded-pill bg-saffron px-2 py-0.5 text-xs font-black text-snow">
            {offPct(p)}% {t("mk.off")}
          </span>
        )}
        <button
          type="button"
          aria-label={t("mk.wish")}
          onClick={() => onWish(p.id)}
          className={`absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-pill border border-line bg-white/90 transition-colors ${wished ? "text-saffron" : "text-muted hover:text-saffron"}`}
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill={wished ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M12 20.5s-7.5-4.7-9.3-9.2C1.4 8 3.6 4.9 6.9 4.9c2 0 3.6 1.1 5.1 3 1.5-1.9 3.1-3 5.1-3 3.3 0 5.5 3.1 4.2 6.4-1.8 4.5-9.3 9.2-9.3 9.2Z" />
          </svg>
        </button>
        <span className="absolute bottom-2 left-3 rounded-pill bg-white/90 px-2 py-0.5 text-xs font-black text-ink">
          {p.size === 40 ? "40 kg" : `${p.size} L`}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-center gap-2">
          <Image
            src={`/brands/${p.b}.png`}
            alt=""
            width={28}
            height={28}
            className="h-7 w-7 rounded-pill border border-line bg-white object-contain p-0.5 dark:bg-raatri"
          />
          <span className="text-xs font-extrabold text-navy dark:text-snow">{b.name}</span>
          <span className="ml-auto flex items-center gap-1 text-xs font-black text-haldi">
            <Icon name="star" className="h-3.5 w-3.5" />{p.r}
          </span>
          <span className="text-xs text-muted">{p.sold} sold</span>
        </div>
        <button type="button" onClick={() => onOpen(p)} className="mk-clamp2 mt-2 text-left text-[15px] font-extrabold leading-snug text-navy hover:text-saffron dark:text-snow" aria-label={t("mk.quick")}>
          {p.n}
        </button>
        <p className="mt-1 text-xs text-muted">
          {p.fin ? `${p.fin} · ≈ ${p.cov} sq ft/L` : p.size === 40 ? `≈ ${p.cov} sq ft/kg` : "—"}
        </p>
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-[19px] font-black text-ink dark:text-snow">₹{p.price.toLocaleString("en-IN")}</span>
          <span className="text-sm font-semibold text-muted line-through">₹{p.mrp.toLocaleString("en-IN")}</span>
        </div>
        <p className="mt-1 flex items-center gap-1 text-xs font-bold text-saffron">
          <span aria-hidden="true">🏪</span> {t("mk.cheapest")} {ch.s.n.split(" ")[0]} · {ch.s.km} km · {t("mk.stores", { n: String(n) })}
        </p>
        <div className="mt-3 flex gap-2">
          <button type="button" onClick={() => onAdd(p)} className="min-h-9 flex-1 rounded-control bg-saffron px-4 py-2 text-sm font-extrabold text-snow transition-colors hover:bg-[#a80036]">
            {t("mk.add")}
          </button>
          <button
            type="button"
            onClick={() => onCompare(p.id)}
            aria-pressed={comparing}
            className={`min-h-9 rounded-control border px-4 py-2 text-sm font-extrabold transition-colors ${
              comparing
                ? "border-saffron bg-saffron text-snow"
                : "border-line bg-white text-ink hover:border-saffron hover:text-saffron dark:bg-raatri dark:text-snow"
            }`}
          >
            {t("mk.compare")}
          </button>
        </div>
      </div>
    </article>
  );
}