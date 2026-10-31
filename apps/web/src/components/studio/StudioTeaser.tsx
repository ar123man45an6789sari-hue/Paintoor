/* StudioTeaser v1 — landing showpiece: a real room the visitor repaints in
   one tap. The bundled sample photo is decoded only once the section scrolls
   into view, so the landing stays fast; the full tool (upload, sliders,
   multi-photo) lives on /studio. */
"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n";
import { PaintStage } from "./PaintStage";
import { usePaintStudio } from "./usePaintStudio";

const TEASER_SHADES = [
  "#E00048",
  "#F39AB5",
  "#F5E6C8",
  "#FFFFFF",
  "#F2C94C",
  "#F2994A",
  "#1D6FB8",
  "#0E9F8A",
  "#1E9E5A",
  "#8E6BC8",
  "#8F8A90",
  "#241F26",
];

export function StudioTeaser() {
  const { t } = useI18n();
  const router = useRouter();
  const bag = usePaintStudio(1100);
  const sectionRef = useRef<HTMLElement>(null);
  const startedRef = useRef(false);

  const loadSample = bag.load;

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        if (!entry?.isIntersecting || startedRef.current) return;
        startedRef.current = true;
        io.disconnect();
        void loadSample("/studio-sample.jpg");
      },
      { rootMargin: "240px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadSample]);

  const toolBtn = (on: boolean) =>
    `min-h-10 rounded-control border-2 px-3 py-1.5 text-xs font-extrabold transition-colors ${
      on
        ? "border-saffron bg-saffron text-snow"
        : "border-line bg-white text-muted hover:border-saffron hover:text-saffron"
    }`;

  return (
    <section ref={sectionRef} id="studio" className="bg-chuna px-5 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="text-center">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">{t("st.tag")}</span>
          <h2 className="mt-1 text-3xl font-black text-navy md:text-4xl">{t("st.teaserH")}</h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm text-muted">{t("st.teaserP")}</p>
          <p className="mt-3 inline-block rounded-pill border border-line bg-white px-3 py-1 text-xs font-extrabold text-neem">
            🔒 {t("st.privacy")}
          </p>
        </div>

        <div className="mt-8">
          <PaintStage bag={bag} />
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
          {TEASER_SHADES.map((hex) => (
            <button
              key={hex}
              type="button"
              aria-label={hex}
              title={hex}
              onClick={() => bag.setShade(hex)}
              className={`h-9 w-9 rounded-pill border-2 transition-transform hover:-translate-y-0.5 ${
                bag.shade.toLowerCase() === hex.toLowerCase() ? "border-saffron" : "border-line"
              }`}
              style={{ background: hex }}
            />
          ))}
          <span className="mx-1 hidden h-6 w-px bg-line sm:block" />
          <button type="button" onClick={() => bag.setTool("pick")} className={toolBtn(bag.tool === "pick")}>
            🎯 {t("st.pick")}
          </button>
          <button type="button" onClick={() => bag.setTool("brush")} className={toolBtn(bag.tool === "brush")}>
            🖌️ {t("st.brush")}
          </button>
          <button type="button" onClick={() => bag.setTool("erase")} className={toolBtn(bag.tool === "erase")}>
            ⌫ {t("st.erase")}
          </button>
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
          <button
            type="button"
            onClick={bag.saveProgress}
            disabled={bag.selected <= 0}
            className={`${toolBtn(false)} disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-line disabled:hover:text-muted`}
          >
            💾 {t("st.save")}
          </button>
          <button type="button" onClick={bag.reset} className={toolBtn(false)}>
            ♻ {t("st.reset")}
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/studio")}
            className="min-h-12 rounded-control bg-saffron px-6 py-3 text-sm font-extrabold text-snow transition-shadow hover:shadow-lift"
          >
             {t("st.open")}
          </button>
          <p className="text-xs font-semibold text-muted">{t("st.openSub")}</p>
        </div>
      </div>
    </section>
  );
}