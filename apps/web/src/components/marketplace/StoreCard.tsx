import { BRANDS, type Store } from "@/lib/marketplace";
import { Icon } from "@/components/Icons";
import { useI18n } from "@/i18n";

export function StoreCard({ s, active, onPick }: { s: Store; active: boolean; onPick: (id: string) => void }) {
  const { t } = useI18n();
  const delta = (10 - s.f) * 10;
  return (
    <article className={`flex w-[300px] flex-none flex-col overflow-hidden rounded-card border bg-white shadow-card transition-all hover:-translate-y-1 hover:shadow-lift md:w-[320px] dark:bg-raatri ${active ? "border-saffron ring-2 ring-saffron/30" : "border-line"}`}>
      <div className="relative flex h-[104px] items-center justify-center" style={{ backgroundImage: "linear-gradient(135deg,#e00048,#a80036)" }}>
        <span className="flex h-[60px] w-[60px] items-center justify-center rounded-pill border-4 border-snow/70 bg-white/15 text-xl font-black text-snow">
          {s.n.split(" ").map((w) => w.charAt(0)).join("").slice(0, 2)}
        </span>
        <span className="absolute bottom-2 right-3 flex items-center gap-1 rounded-pill bg-white/90 px-2 py-0.5 text-xs font-black text-ink">
          <span className={`h-1.5 w-1.5 rounded-full ${s.open ? "bg-[#0e9f8a]" : "bg-muted"}`} aria-hidden="true" />
          {s.open ? `${t("mk.openTill")} ${s.cls}` : t("mk.opensAt")}
        </span>
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-extrabold text-navy dark:text-snow">{s.n}</h3>
          <span className="flex items-center gap-1 text-sm font-black text-haldi">
            <Icon name="star" className="h-3.5 w-3.5" />{s.r}
          </span>
        </div>
        <p className="mt-0.5 text-xs text-muted">{s.o} · {s.a}</p>
        <p className="mt-0.5 text-xs text-muted">{s.km} km · since {s.y} · {s.rv} reviews</p>
        <div className="mt-2 flex flex-wrap gap-1">
          {s.br.map((slug) => {
            const b = BRANDS.find((x) => x.slug === slug);
            return (
              <span key={slug} title={b?.name} className="h-3.5 w-3.5 rounded-pill border border-line" style={{ background: b?.c }} />
            );
          })}
        </div>
        <p className={`mt-2 text-xs font-bold ${delta > 0 ? "text-[#0e9f8a]" : "text-muted"}`}>
          {delta > 0 ? t("mk.belowAvg", { n: String(delta) }) : delta < 0 ? t("mk.aboveAvg", { n: String(-delta) }) : t("mk.atAvg")}
        </p>
        <button
          type="button"
          onClick={() => onPick(s.id)}
          className={`mt-3 min-h-9 rounded-control px-4 py-2 text-sm font-extrabold transition-colors ${active ? "bg-saffron text-snow" : "border border-line bg-white text-ink hover:border-saffron hover:text-saffron dark:bg-raatri dark:text-snow"}`}
        >
          {active ? t("mk.allStores") : t("mk.shopStore")}
        </button>
      </div>
    </article>
  );
}