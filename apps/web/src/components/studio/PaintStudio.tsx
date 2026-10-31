/* PaintStudio v1 — the full wall-paint simulator page body: upload up to six
   photos, tap a wall colour to select every matching pixel, refine with brush
   and eraser, recolour with the full shade wall and save a PNG. Everything is
   computed on the visitor's device. */
"use client";

import { useRef } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n";
import { ColourPalette } from "./ColourPalette";
import { PaintStage } from "./PaintStage";
import { usePaintStudio } from "./usePaintStudio";

export function PaintStudio() {
  const { t } = useI18n();
  const router = useRouter();
  const bag = usePaintStudio(1400);
  const fileRef = useRef<HTMLInputElement>(null);

  const toolBtn = (on: boolean) =>
    `min-h-11 rounded-control border-2 px-3 py-2 text-xs font-extrabold transition-colors ${
      on
        ? "border-saffron bg-saffron text-snow"
        : "border-line bg-white text-muted hover:border-saffron hover:text-saffron"
    }`;

  const slider = (
    label: string,
    value: number,
    min: number,
    max: number,
    onChange: (v: number) => void,
    suffix = "",
  ) => (
    <label className="mt-3 block text-xs font-bold text-ink">
      {label}: <span className="font-black text-saffron">{value}{suffix}</span>
      <input
        type="range"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(+e.target.value)}
        className="mt-1 w-full accent-saffron"
      />
    </label>
  );

  return (
    <section className="bg-chuna px-5 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="text-center">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">{t("st.title")}</span>
          <h1 className="mt-1 text-3xl font-black text-navy md:text-4xl">{t("st.head")}</h1>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted">{t("st.sub")}</p>
          <p className="mt-3 inline-block rounded-pill border border-line bg-white px-3 py-1 text-xs font-extrabold text-neem">
            🔒 {t("st.privacy")}
          </p>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            void bag.addPhotos(e.target.files ?? []);
            e.target.value = "";
          }}
        />

        {bag.photos.length === 0 ? (
          <div
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              void bag.addPhotos(e.dataTransfer.files);
            }}
            className="mx-auto mt-10"
          >
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex min-h-[280px] w-full max-w-2xl flex-col items-center justify-center gap-3 rounded-sheet border-2 border-dashed border-line bg-white p-10 text-center transition-colors hover:border-saffron"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-pill bg-saffron text-3xl font-black text-snow">
                +
              </span>
              <span className="text-lg font-extrabold text-navy">{t("st.upload")}</span>
              <span className="text-xs font-semibold text-muted">{t("st.uploadSub")}</span>
              <span className="text-xs font-bold text-muted/70">{t("st.drop")}</span>
            </button>
          </div>
        ) : (
          <div className="mt-10 grid gap-6 lg:grid-cols-[1.55fr_1fr]">
            <div>
              <PaintStage bag={bag} />

              <div className="mt-3 flex flex-wrap items-center gap-2">
                {bag.photos.map((p) => (
                  <span key={p.id} className="relative inline-block">
                    <button
                      type="button"
                      onClick={() => bag.selectPhoto(p.id)}
                      aria-label={p.name}
                      className={`block h-14 w-14 overflow-hidden rounded-control border-2 transition-transform hover:-translate-y-0.5 ${
                        p.id === bag.activeId ? "border-saffron" : "border-line"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt={p.name} className="h-full w-full object-cover" />
                    </button>
                    <button
                      type="button"
                      onClick={() => bag.removePhoto(p.id)}
                      aria-label={t("st.remove")}
                      title={t("st.remove")}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-pill bg-raatri text-[10px] font-black text-snow shadow-card transition-colors hover:bg-danger"
                    >
                      ✕
                    </button>
                  </span>
                ))}
                {bag.photos.length < bag.maxPhotos && (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    aria-label={t("st.add")}
                    className="flex h-14 w-14 items-center justify-center rounded-control border-2 border-dashed border-line bg-white text-xl font-black text-muted transition-colors hover:border-saffron hover:text-saffron"
                  >
                    +
                  </button>
                )}
                <span className="text-xs font-semibold text-muted">{t("st.max")}</span>
              </div>
            </div>

            <div className="space-y-4">
              <div className="rounded-card border border-line bg-white p-4 shadow-card">
                <p className="text-xs font-black uppercase tracking-wider text-muted">{t("st.step1")}</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button type="button" onClick={() => bag.setTool("pick")} className={toolBtn(bag.tool === "pick")}>
                    🎯 {t("st.pick")}
                  </button>
                  <button type="button" onClick={() => bag.setTool("brush")} className={toolBtn(bag.tool === "brush")}>
                    🖌️ {t("st.brush")}
                  </button>
                  <button type="button" onClick={() => bag.setTool("erase")} className={toolBtn(bag.tool === "erase")}>
                    ⌫ {t("st.erase")}
                  </button>
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={bag.undo}
                    disabled={!bag.canUndo}
                    className={`${toolBtn(false)} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-muted`}
                  >
                    ↩ {t("st.undo")}
                  </button>
                  <button
                    type="button"
                    onClick={bag.redo}
                    disabled={!bag.canRedo}
                    className={`${toolBtn(false)} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-muted`}
                  >
                    ↪ {t("st.redo")}
                  </button>
                  <button type="button" onClick={bag.reset} className={toolBtn(false)}>
                    ♻ {t("st.reset")}
                  </button>
                </div>
                <div className="mt-3 rounded-control border border-line bg-chuna p-3">
                  <button
                    type="button"
                    onClick={bag.saveProgress}
                    disabled={bag.selected <= 0}
                    className="min-h-11 w-full rounded-control bg-raatri px-3 py-2 text-xs font-extrabold text-snow transition-colors hover:brightness-125 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    💾 {t("st.save")}
                  </button>
                  <p className="mt-1.5 text-[11px] font-semibold text-muted">
                    {bag.layers > 0 ? t("st.layers", { n: bag.layers }) : t("st.saveSub")}
                  </p>
                </div>
                {slider(t("st.size"), bag.brush, 6, 120, bag.setBrush, " px")}
                {slider(t("st.tol"), bag.tol, 5, 100, bag.setTol)}
                {slider(t("st.intensity"), bag.intensity, 30, 100, bag.setIntensity, "%")}
                <label className="mt-3 flex items-start gap-2 text-xs font-bold text-ink">
                  <input
                    type="checkbox"
                    checked={bag.connected}
                    onChange={(e) => bag.setConnected(e.target.checked)}
                    className="mt-0.5 h-4 w-4 accent-saffron"
                  />
                  <span>
                    {t("st.connected")}
                    <span className="block text-[11px] font-semibold text-muted">{t("st.connectedSub")}</span>
                  </span>
                </label>
              </div>

              <div className="rounded-card border border-line bg-white p-4 shadow-card">
                <p className="text-xs font-black uppercase tracking-wider text-muted">{t("st.step2")} · {t("st.shades")}</p>
                <div className="mt-2">
                  <ColourPalette shade={bag.shade} onPick={bag.setShade} maxHeight="max-h-56" />
                </div>
              </div>

              <button
                type="button"
                onClick={() => router.push("/providers?q=painting")}
                className="min-h-12 w-full rounded-control bg-saffron px-4 py-3 text-sm font-extrabold text-snow transition-shadow hover:shadow-lift"
              >
                🎨 {t("st.cta")}
              </button>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}