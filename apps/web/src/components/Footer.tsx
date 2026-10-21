/* Footer v4 — always-dark band that stays readable in BOTH modes:
   body text uses the flipping muted token, headings stay white,
   top border separates it from the page in dark mode. */
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
    <footer className="border-t border-line bg-raatri px-4 py-10 text-sm text-muted md:px-6">
      <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
           <h2 className="mb-2 font-black text-snow">
            {t("brand.pre")}
            {t("brand.post")}
          </h2>
          <p className="max-w-[280px] text-sm">{t("foot.about")}</p>
          <p className="mt-3 text-sm">{t("foot.help")}</p>
        </div>
        {cols.map((col) => (
          <div key={col.head}>
            <h2 className="mb-2 text-snow">{col.head}</h2>
            {col.links.map((k) => (
              <a key={k} href="#" className="mb-1.5 block hover:text-haldi">
                {t(k)}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="mx-auto mt-10 flex max-w-6xl flex-col gap-2 border-t border-snow/10 pt-4 text-xs md:flex-row md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} Paintoor</span>
        <span>{t("foot.made")}</span>
      </div>
    </footer>
  );
}