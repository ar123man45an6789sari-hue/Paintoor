/* ColourPalette v1 — the paint shade wall: curated families + free colour
   input. Pure presentational component, shared by teaser and full studio. */
"use client";

import { useI18n } from "@/i18n";

export type Family = { key: string; shades: string[] };

export const FAMILIES: Family[] = [
  { key: "fam.whites", shades: ["#FFFFFF", "#F7F3EE", "#EFE9E2", "#E8E2D9", "#F2EFE9", "#EAE6DF"] },
  { key: "fam.creams", shades: ["#F5E6C8", "#EFD9B4", "#E8CFA8", "#F2E3CD", "#E5D5B5", "#F7EBD9"] },
  { key: "fam.yellows", shades: ["#F6D76B", "#F2C94C", "#E8B830", "#F9E08A", "#DFA920", "#F4CE5A"] },
  { key: "fam.oranges", shades: ["#F2994A", "#EB8C33", "#E07B20", "#F6A85C", "#D96C15", "#F4B27A"] },
  { key: "fam.reds", shades: ["#D64545", "#C03434", "#B02A2A", "#E05A5A", "#9C2222", "#E87070"] },
  { key: "fam.pinks", shades: ["#F39AB5", "#E85D8A", "#E0447C", "#E00048", "#F6B3C8", "#C40040"] },
  { key: "fam.purples", shades: ["#8E6BC8", "#7A54B5", "#6C4BD8", "#A58BD8", "#5A3D9E", "#B7A0E0"] },
  { key: "fam.blues", shades: ["#1D6FB8", "#165A99", "#123A6B", "#4A90D9", "#0E2E55", "#6FB0E8", "#2A5C96", "#8CC4F0"] },
  { key: "fam.greens", shades: ["#1E9E5A", "#17824A", "#0E9F8A", "#35B877", "#0B6B3D", "#6BC89A", "#4CA66C", "#A0D8BC"] },
  { key: "fam.teals", shades: ["#0E9F8A", "#0B8070", "#22AC99", "#54C2B1", "#096256", "#8FD9CC"] },
  { key: "fam.browns", shades: ["#8B5E3C", "#7A4F2E", "#6B4226", "#A0714B", "#5A3620", "#C09068"] },
  { key: "fam.greys", shades: ["#8F8A90", "#B9B3B8", "#6E696F", "#D9D4D8", "#4A464C", "#EFEAEE"] },
  { key: "fam.darks", shades: ["#241F26", "#182028", "#2E2A31", "#0B0E11"] },
];

export function ColourPalette({
  shade,
  onPick,
  maxHeight = "max-h-64",
}: {
  shade: string;
  onPick: (hex: string) => void;
  maxHeight?: string;
}) {
  const { t } = useI18n();
  return (
    <div>
      <div className={`${maxHeight} space-y-2.5 overflow-y-auto pr-1`}>
        {FAMILIES.map((f) => (
          <div key={f.key}>
            <p className="text-[11px] font-extrabold uppercase tracking-wider text-muted">{t(f.key)}</p>
            <div className="mt-1 flex flex-wrap gap-1.5">
              {f.shades.map((hex) => (
                <button
                  key={hex}
                  type="button"
                  aria-label={hex}
                  title={hex}
                  onClick={() => onPick(hex)}
                  className={`h-8 w-8 rounded-pill border-2 transition-transform hover:-translate-y-0.5 ${
                    shade.toLowerCase() === hex.toLowerCase() ? "border-saffron" : "border-line"
                  }`}
                  style={{ background: hex }}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
      <label className="mt-3 flex items-center gap-2 text-xs font-bold text-ink">
        {t("st.custom")}
        <input
          type="color"
          value={shade}
          onChange={(e) => onPick(e.target.value)}
          className="h-9 w-12 cursor-pointer rounded-control border border-line bg-white"
        />
        <span className="font-black uppercase tracking-wider text-muted">{shade}</span>
      </label>
    </div>
  );
}