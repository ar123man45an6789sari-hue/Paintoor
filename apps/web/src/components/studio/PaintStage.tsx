/* PaintStage v2 — the shared photo stage: base <img> + dried-paint canvas +
   transparent live overlay + colour chip + brush ring. The <img> paints the
   photo on the first frame; the second canvas shows original + saved layers
   so frozen paint stays visible; the top canvas carries the live selection. */
"use client";

import { useI18n } from "@/i18n";
import type { PaintStudioBag } from "./usePaintStudio";

export function PaintStage({ bag }: { bag: PaintStudioBag }) {
  const { t } = useI18n();
  const photo = bag.active;
  const hint =
    bag.tool === "pick" ? t("st.hintPick") : bag.tool === "brush" ? t("st.hintBrush") : t("st.hintErase");

  return (
    <div className="relative overflow-hidden rounded-sheet border border-line bg-white shadow-card">
      {photo ? (
        /* Base photo: plain <img> so the picture appears instantly while the
           pixel analysis runs behind it. */
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo.url}
          alt={t("st.photoAlt")}
          draggable={false}
          className="block w-full select-none"
        />
      ) : (
        <div className="aspect-[4/3] w-full" />
      )}

      {/* Dried paint: original photo + every saved layer. Sits above the
          <img> and under the live overlay, and only shows while something
          is saved — so saved colour stays on screen forever. */}
      <canvas
        ref={bag.baseCanvasRef}
        className="pointer-events-none absolute inset-0 h-full w-full"
        style={{
          opacity: bag.compare || bag.layers === 0 ? 0 : 1,
          transition: "opacity 120ms ease",
        }}
      />

      <canvas
        ref={bag.canvasRef}
        className="absolute inset-0 h-full w-full touch-none"
        style={{
          opacity: bag.compare ? 0 : 1,
          cursor: bag.tool === "pick" ? "crosshair" : "none",
          transition: "opacity 120ms ease",
        }}
        onPointerDown={bag.onPointerDown}
        onPointerMove={bag.onPointerMove}
        onPointerUp={bag.onPointerUp}
        onPointerCancel={bag.onPointerUp}
        onPointerLeave={bag.onPointerLeave}
      />

      {/* live colour under the cursor */}
      <div
        ref={bag.chipRef}
        className="pointer-events-none absolute left-2 top-2 flex items-center gap-2 rounded-pill bg-raatri/90 px-2.5 py-1.5 opacity-0 shadow-card transition-opacity duration-150 sm:left-3 sm:top-3"
      >
        <span ref={bag.chipSwatchRef} className="h-5 w-5 rounded-full border-2 border-snow/50" style={{ background: "#ffffff" }} />
        <span ref={bag.chipTextRef} className="text-[11px] font-black tracking-wider text-snow">
          #FFFFFF
        </span>
        <span className="hidden text-[10px] font-bold text-snow/60 sm:inline">{t("st.wall")}</span>
      </div>

      {/* brush / picker cursor */}
      <div
        ref={bag.ringRef}
        className="pointer-events-none absolute left-0 top-0 rounded-full border-2 border-white opacity-0 mix-blend-difference"
        style={{ willChange: "transform, width, height" }}
      />

      {/* corner actions */}
      <div className="absolute right-2 top-2 flex gap-1.5 sm:right-3 sm:top-3 sm:gap-2">
        <button
          type="button"
          onPointerDown={() => bag.setCompare(true)}
          onPointerUp={() => bag.setCompare(false)}
          onPointerLeave={() => bag.setCompare(false)}
          className="min-h-9 rounded-pill bg-raatri/85 px-2.5 py-1.5 text-[11px] font-extrabold text-snow backdrop-blur-sm transition-colors hover:bg-raatri sm:min-h-10 sm:px-3 sm:text-xs"
        >
          👁 {t("st.compare")}
        </button>
        <button
          type="button"
          onClick={() => void bag.download()}
          className="min-h-9 rounded-pill bg-saffron px-2.5 py-1.5 text-[11px] font-extrabold text-snow transition-colors hover:brightness-110 sm:min-h-10 sm:px-3 sm:text-xs"
        >
          ⬇ {t("st.download")}
        </button>
      </div>

      {/* bottom bar: selection readout + contextual hint, wraps on phones */}
      <div className="pointer-events-none absolute inset-x-2 bottom-2 flex flex-wrap items-end justify-between gap-1.5 sm:inset-x-3 sm:bottom-3 sm:gap-2">
        <span className="flex flex-wrap items-end gap-1.5 sm:gap-2">
          <span className="rounded-pill bg-snow/90 px-3 py-1.5 text-[11px] font-extrabold text-ink shadow-card">
            {bag.selected > 0 ? t("st.selected", { n: Math.round(bag.selected * 100) }) : t("st.none")}
          </span>
          {bag.layers > 0 && (
            <span className="flex items-center gap-1 rounded-pill bg-raatri/85 py-1.5 pl-3 pr-1.5 text-[11px] font-extrabold text-snow shadow-card">
              💾 {t("st.layers", { n: bag.layers })}
              <button
                type="button"
                onClick={bag.clearSaved}
                aria-label={t("st.unsave")}
                title={t("st.unsave")}
                className="pointer-events-auto flex h-5 w-5 items-center justify-center rounded-pill bg-snow/15 text-[10px] font-black transition-colors hover:bg-danger"
              >
                ✕
              </button>
            </span>
          )}
        </span>
        {!bag.compare && (
          <span className="max-w-full truncate rounded-pill bg-snow/90 px-3 py-1.5 text-[11px] font-extrabold text-ink shadow-card sm:max-w-[55%]">
            {hint}
          </span>
        )}
      </div>

      {(bag.loading || !bag.ready) && photo && (
        <div className="absolute inset-0 flex items-center justify-center bg-snow/40">
          <span className="rounded-pill bg-raatri/85 px-4 py-2 text-xs font-extrabold text-snow">
            {t("st.preparing")}
          </span>
        </div>
      )}
    </div>
  );
}