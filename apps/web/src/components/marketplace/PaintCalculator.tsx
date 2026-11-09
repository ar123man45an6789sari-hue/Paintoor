import { useState } from "react";
import { BRANDS, buildKit, packLabel, type Kit } from "@/lib/marketplace";
import { useI18n } from "@/i18n";

const ROOMS = [
  { key: "1bhk", label: "1 BHK", area: 120 },
  { key: "2bhk", label: "2 BHK", area: 320 },
  { key: "3bhk", label: "3 BHK", area: 520 },
];

const seg = (on: boolean) =>
  `min-h-11 flex-1 rounded-control px-4 text-sm font-extrabold transition-colors ${
    on ? "bg-saffron text-snow" : "border border-line bg-white text-ink hover:border-saffron hover:text-saffron dark:bg-raatri dark:text-snow"
  }`;

export function PaintCalculator({ onAddKit }: { onAddKit: (kit: Kit, brand: string, area: number, coats: number, surface: string) => void }) {
  const { t } = useI18n();
  const [room, setRoom] = useState("2bhk");
  const [area, setArea] = useState(320);
  const [surface, setSurface] = useState("interior");
  const [coats, setCoats] = useState(2);
  const [brand, setBrand] = useState(BRANDS[0].slug);
  const kit = buildKit(area, coats, surface, brand);
  const bName = BRANDS.find((b) => b.slug === brand)?.name ?? brand;
  const rows: { label: string; meta: string; price: number }[] = [];
  if (!kit.wood) {
    rows.push({ label: t("mk.calc.putty"), meta: `${kit.puttyKg} kg`, price: kit.puttyPrice });
    rows.push({ label: t("mk.calc.primer"), meta: packLabel(kit.primerPacks), price: kit.primerPrice });
  }
  rows.push({ label: kit.wood ? t("mk.calc.enamel") : t("mk.calc.top"), meta: packLabel(kit.topPacks), price: kit.topPrice });
  rows.push({ label: t("mk.calc.tools"), meta: kit.wood ? "sandpaper + brush" : "roller + brush", price: kit.tools });
  return (
    <section className="mx-auto max-w-6xl px-4 pb-16 md:px-8 md:pb-24">
      <div className="grid gap-8 rounded-sheet bg-chuna px-6 py-10 md:px-10 md:py-12 lg:grid-cols-2 dark:bg-raatri">
        <div>
          <span className="inline-block rounded-pill bg-saffron/10 px-3 py-1 text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("mk.calc.eyebrow")}</span>
          <h2 className="mt-3 text-[22px] font-black text-navy md:text-[26px] dark:text-snow">{t("mk.calc.title")}</h2>
          <p className="mt-2 text-sm leading-relaxed text-muted">{t("mk.calc.lead")}</p>
          <p className="mt-6 text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.calc.room")}</p>
          <div className="mt-2 flex gap-2">
            {ROOMS.map((r) => (
              <button key={r.key} type="button" className={seg(room === r.key)} onClick={() => { setRoom(r.key); setArea(r.area); }}>{r.label}</button>
            ))}
            <button key="custom" type="button" className={seg(room === "custom")} onClick={() => setRoom("custom")}>Custom</button>
          </div>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.calc.area")}</p>
          <input
            type="number" min={20} max={20000} value={area}
            onChange={(e) => { setRoom("custom"); setArea(Math.max(20, Number(e.target.value) || 0)); }}
            className="mt-2 min-h-11 w-full rounded-control border border-line bg-white px-4 text-sm font-bold text-ink focus:border-saffron focus:outline-none dark:bg-raatri dark:text-snow"
          />
          <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.calc.surface")}</p>
          <div className="mt-2 flex gap-2">
            {[["interior", t("mk.calc.interior")], ["exterior", t("mk.calc.exterior")], ["wood", t("mk.calc.wood")]].map(([k, label]) => (
              <button key={k} type="button" className={seg(surface === k)} onClick={() => setSurface(k)}>{label}</button>
            ))}
          </div>
          {!kit.wood && (
            <>
              <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.calc.coats")}</p>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3].map((c) => (
                  <button key={c} type="button" className={seg(coats === c)} onClick={() => setCoats(c)}>{c} coat{c > 1 ? "s" : ""}</button>
                ))}
              </div>
            </>
          )}
          <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.calc.brand")}</p>
          <select value={brand} onChange={(e) => setBrand(e.target.value)} className="mt-2 min-h-11 w-full rounded-control border border-line bg-white px-3 py-2.5 text-sm font-bold text-ink focus:border-saffron focus:outline-none dark:bg-raatri dark:text-snow">
            {BRANDS.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
          </select>
        </div>
        <div className="flex flex-col rounded-card border border-line bg-white p-5 shadow-card md:p-6 dark:bg-[#12161a]">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.calc.work")}</p>
          <ul className="mt-3 space-y-1 text-xs text-muted">
            {!kit.wood && (
              <>
                <li>Putty @ 12 sq ft/kg → <b className="text-ink dark:text-snow">{kit.puttyKg} kg</b></li>
                <li>Primer @ 130 sq ft/L → <b className="text-ink dark:text-snow">{kit.primerL} L</b> ({packLabel(kit.primerPacks)})</li>
              </>
            )}
            <li>{kit.wood ? "Enamel" : "Topcoat"} @ {kit.wood ? 110 : 150} sq ft/L × {coats} coat{coats > 1 ? "s" : ""} → <b className="text-ink dark:text-snow">{kit.topL} L</b> ({packLabel(kit.topPacks)})</li>
          </ul>
          <p className="mt-5 text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.calc.kit")}</p>
          <ul className="mt-2 divide-y divide-dashed divide-line">
            {rows.map((r) => (
              <li key={r.label} className="flex items-baseline justify-between gap-3 py-2.5">
                <span className="text-sm font-extrabold text-ink dark:text-snow">{r.label}<span className="ml-2 text-xs font-semibold text-muted">{r.meta}</span></span>
                <span className="text-sm font-black text-ink dark:text-snow">₹{r.price.toLocaleString("en-IN")}</span>
              </li>
            ))}
          </ul>
          <div className="mt-3 flex items-baseline justify-between border-t border-line pt-3">
            <span className="text-sm font-black text-ink dark:text-snow">{t("mk.calc.total")}</span>
            <span className="text-[28px] font-black leading-none text-ink dark:text-snow">₹{kit.total.toLocaleString("en-IN")}</span>
          </div>
          <p className="mt-2 text-xs text-muted">{brand === "shalimar" ? t("mk.calc.noteV", { brand: bName }) : t("mk.calc.note", { brand: bName, x: String(Math.max(0, kit.total - buildKit(area, coats, surface, "shalimar").total) ) })}</p>
          <button type="button" onClick={() => onAddKit(kit, brand, area, coats, surface)} className="mt-4 min-h-12 w-full rounded-control bg-saffron px-6 py-3 text-sm font-extrabold text-snow transition-colors hover:bg-[#a80036]">
            {t("mk.calc.add")}
          </button>
        </div>
      </div>
    </section>
  );
}