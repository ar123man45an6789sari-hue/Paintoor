import { AISLES } from "@/lib/marketplace";
import { useI18n } from "@/i18n";

export type Toggles = { stock: boolean; open: boolean; offer: boolean };

const chip = (on: boolean) =>
  `rounded-pill border px-3 py-1.5 text-xs font-extrabold transition-colors ${
    on
      ? "border-saffron bg-saffron text-snow"
      : "border-line bg-white text-ink hover:border-saffron hover:text-saffron dark:bg-raatri dark:text-snow"
  }`;

export function FilterBar({
  aisle, counts, onAisle, budget, onBudget, packs, onPacks, fins, onFins,
  rating, onRating, toggles, onToggle,
}: {
  aisle: string; counts: Record<string, number>; onAisle: (k: string) => void;
  budget: [number, number]; onBudget: (b: [number, number]) => void;
  packs: number[]; onPacks: (v: number) => void;
  fins: string[]; onFins: (v: string) => void;
  rating: number; onRating: (v: number) => void;
  toggles: Toggles; onToggle: (k: keyof Toggles) => void;
}) {
  const { t } = useI18n();
  const [lo, hi] = budget;
  const MIN = 200, MAX = 7000;
  const pct = (v: number) => ((v - MIN) / (MAX - MIN)) * 100;
  return (
    <div className="mt-5 space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" className={chip(aisle === "all")} onClick={() => onAisle("all")}>
          All <span className={aisle === "all" ? "opacity-80" : "text-muted"}>{counts.all}</span>
        </button>
        {AISLES.map((a) => (
          <button key={a.key} type="button" className={chip(aisle === a.key)} onClick={() => onAisle(a.key)}>
            {a.label} <span className={aisle === a.key ? "opacity-80" : "text-muted"}>{counts[a.key]}</span>
          </button>
        ))}
        <div className="ml-auto flex min-w-[240px] flex-1 items-center gap-3 sm:max-w-[380px]">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.budget")}</span>
          <div className="mk-range relative h-9 flex-1">
            <span className="track" aria-hidden="true" />
            <span className="fill" style={{ left: `${pct(lo)}%`, right: `${100 - pct(hi)}%` }} aria-hidden="true" />
            <input
              type="range" min={MIN} max={MAX} step={100} value={lo}
              aria-label={t("mk.budget")}
              onChange={(e) => onBudget([Math.min(Number(e.target.value), hi - 200), hi])}
            />
            <input
              type="range" min={MIN} max={MAX} step={100} value={hi}
              aria-label={t("mk.budget")}
              onChange={(e) => onBudget([lo, Math.max(Number(e.target.value), lo + 200)])}
            />
          </div>
          <span className="whitespace-nowrap text-xs font-extrabold text-ink dark:text-snow">
            ₹{lo.toLocaleString("en-IN")} – ₹{hi.toLocaleString("en-IN")}{hi === MAX ? "+" : ""}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <span className="flex items-center gap-2">
          <b className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.pack")}</b>
          {[1, 4, 10, 40].map((v) => (
            <button key={v} type="button" className={chip(packs.includes(v))} onClick={() => onPacks(v)}>
              {v === 40 ? "40 kg" : `${v} L`}
            </button>
          ))}
        </span>
        <span className="flex items-center gap-2">
          <b className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.finish")}</b>
          {["Matt", "Sheen", "Satin", "Gloss"].map((v) => (
            <button key={v} type="button" className={chip(fins.includes(v))} onClick={() => onFins(v)}>{v}</button>
          ))}
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
        <span className="flex items-center gap-2">
          <b className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.rating")}</b>
          {[0, 4, 4.5].map((v) => (
            <button key={v} type="button" className={chip(rating === v)} onClick={() => onRating(v)}>
              {v === 0 ? t("mk.any") : `${v}★ & up`}
            </button>
          ))}
        </span>
        {(Object.keys(toggles) as (keyof Toggles)[]).map((k) => (
          <button key={k} type="button" role="switch" aria-checked={toggles[k]} onClick={() => onToggle(k)} className={chip(toggles[k])}>
            <span aria-hidden="true" className={`mr-1 inline-block h-3 w-3 rounded-[3px] border align-[-0.1em] ${toggles[k] ? "border-snow bg-snow/25" : "border-muted"}`}>
              {toggles[k] ? "✓" : ""}
            </span>
            {k === "stock" ? t("mk.stock") : k === "open" ? t("mk.open") : t("mk.offer")}
          </button>
        ))}
      </div>
    </div>
  );
}