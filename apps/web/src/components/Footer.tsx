/* Footer v3 — fully localised; language list removed by owner decision. */
"use client";

import { useI18n } from "@/i18n";

export function Footer() {
  const { t } = useI18n();
  const cols: { head: string; links: string[] }[] = [
    { head: t("foot.h1"), links: ["fl.about", "fl.careers", "fl.blog", "fl.press"] },
    { head: t("foot.h2"), links: ["fl.refund", "fl.terms", "fl.privacy", "fl.safety"] },
    { head: t("foot.h3"), links: ["fl.worker", "fl.store", "fl.rwa"] },
  ];

  return (
    <footer className="bg-raatri px-4 py-10 text-sm text-slate-400 md:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <h2 className="mb-2 font-black text-white">
            {t("brand.pre")}
            <span className="text-saffron">{t("brand.post")}</span>
          </h2>
          <p className="max-w-[280px] text-sm">{t("foot.about")}</p>
          <p className="mt-3 text-sm">{t("foot.help")}</p>
        </div>
        {cols.map((col) => (
          <div key={col.head}>
            <h2 className="mb-2 text-white">{col.head}</h2>
            {col.links.map((k) => (
              <a key={k} href="#" className="mb-1.5 block hover:text-haldi">
                {t(k)}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-2 border-t border-white/10 pt-4 text-xs md:flex-row md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} Paintoor</span>
        <span>{t("foot.made")}</span>
      </div>
    </footer>
  );
}