/* Journal listing: header block, featured pair, category chips, post grid
   and a closing band. No email capture — there is no backend yet. */
"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { CATEGORIES, POSTS } from "@/lib/journal";
import type { Category } from "@/lib/journal";
import { FeaturedCard, PostCard } from "./JournalCards";

export function JournalIndex() {
  const { t } = useI18n();
  const [active, setActive] = useState<Category | "all">("all");

  const featured = POSTS.filter((p) => p.featured);
  const grid =
    active === "all"
      ? POSTS.filter((p) => !p.featured)
      : POSTS.filter((p) => p.category === active);

  return (
    <div className="px-4 py-14 md:px-8 md:py-20">
      <div className="mx-auto max-w-6xl space-y-12 md:space-y-16">
        <header className="max-w-3xl">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">
            {t("jn.eyebrow")}
          </span>
          <h1 className="mt-4 text-4xl font-black leading-tight text-navy md:text-5xl">
            {t("jn.h")}
          </h1>
          <p className="mt-5 leading-relaxed text-muted">{t("jn.sub")}</p>
        </header>

        <section aria-label={t("jn.featured")} className="space-y-5">
          <h2 className="text-xs font-extrabold uppercase tracking-[0.18em] text-muted">
            {t("jn.featured")}
          </h2>
          <div className="grid gap-5 lg:grid-cols-2">
            {featured.map((p) => (
              <FeaturedCard key={p.slug} post={p} />
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <div className="flex flex-wrap gap-2" role="group" aria-label={t("jn.filter")}>
            <button
              type="button"
              onClick={() => setActive("all")}
              className={
                active === "all"
                  ? "rounded-pill bg-saffron px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-snow"
                  : "rounded-pill border-2 border-line px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-muted transition-colors hover:border-saffron hover:text-saffron"
              }
            >
              {t("jn.all")}
            </button>
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setActive(c)}
                className={
                  active === c
                    ? "rounded-pill bg-saffron px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-snow"
                    : "rounded-pill border-2 border-line px-4 py-2 text-xs font-extrabold uppercase tracking-[0.12em] text-muted transition-colors hover:border-saffron hover:text-saffron"
                }
              >
                {t("jn.cat." + c)}
              </button>
            ))}
          </div>

          {grid.length === 0 ? (
            <p className="rounded-card border border-line bg-white p-8 text-center text-sm font-semibold text-muted">
              {t("jn.empty")}
            </p>
          ) : (
            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {grid.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          )}
        </section>

        <section className="rounded-sheet bg-chuna px-6 py-12 text-center md:py-16">
          <h2 className="text-2xl font-black text-navy md:text-3xl">{t("jn.closingH")}</h2>
          <p className="mx-auto mt-4 max-w-xl text-sm leading-relaxed text-muted">
            {t("jn.closingP")}
          </p>
        </section>
      </div>
    </div>
  );
}