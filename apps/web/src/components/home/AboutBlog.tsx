/* About + Blog views — client so all copy flows through i18n packs. */
"use client";

import { useI18n } from "@/i18n";

export function AboutView() {
  const { t } = useI18n();
  return (
    <div className="px-4 py-14 md:px-6">
      <div className="mx-auto max-w-3xl space-y-5">
        <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">Paintoor</span>
        <h1 className="text-4xl font-black text-navy">{t("about.h")}</h1>
        <p className="text-lg text-ink">{t("about.p1")}</p>
        <p className="text-muted">{t("about.p2")}</p>
      </div>
    </div>
  );
}

export function BlogView() {
  const { t } = useI18n();
  const posts = ["b1", "b2", "b3"];
  return (
    <div className="px-4 py-14 md:px-6">
      <div className="mx-auto max-w-5xl space-y-8">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">Paintoor</span>
          <h1 className="mt-1 text-4xl font-black text-navy">{t("blog.h")}</h1>
          <p className="mt-2 text-muted">{t("blog.p")}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {posts.map((p) => (
            <article key={p} className="rounded-card border border-line bg-white p-6 shadow-card">
              <h2 className="font-extrabold text-navy">{t(`${p}.t`)}</h2>
              <p className="mt-2 text-sm text-muted">{t(`${p}.p`)}</p>
              <p className="mt-4 rounded-control bg-chuna px-3 py-2 text-xs font-extrabold text-saffron">{t("blog.soon")}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}