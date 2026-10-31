/* Footer v5 — official company identity: legal name, registered address,
   tap-to-call helpline and role-based email contacts (client-provided). */
"use client";

import Link from "next/link";
import { useI18n } from "@/i18n";
import { company } from "@paintoor/brand";

export function Footer() {
  const { t } = useI18n();
  const cols: { head: string; links: { key: string; href: string }[] }[] = [
    {
      head: t("foot.h1"),
      links: [
        { key: "fl.studio", href: "/studio" },
        { key: "fl.about", href: "/about" },
        { key: "fl.careers", href: `mailto:${company.emails.career}` },
        { key: "fl.blog", href: "/blog" },
        { key: "fl.press", href: `mailto:${company.emails.info}` },
      ],
    },
    {
      head: t("foot.h2"),
      links: [
        { key: "fl.refund", href: "#" },
        { key: "fl.terms", href: "#" },
        { key: "fl.privacy", href: "#" },
        { key: "fl.safety", href: `mailto:${company.emails.support}` },
      ],
    },
    {
      head: t("foot.h3"),
      links: [
        { key: "fl.partner", href: `mailto:${company.emails.partner}` },
        { key: "fl.store", href: `mailto:${company.emails.partner}` },
        { key: "fl.rwa", href: `mailto:${company.emails.info}` },
      ],
    },
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
          <p className="mt-3 text-sm">
            <a href={`tel:${company.phoneTel}`} className="hover:text-haldi">
              📞 {t("foot.helpline")}
            </a>
          </p>
          <p className="mt-1 text-sm">
            <a href={`mailto:${company.emails.support}`} className="hover:text-haldi">
              ✉️ {company.emails.support}
            </a>
          </p>
        </div>
        {cols.map((col) => (
          <div key={col.head}>
            <h2 className="mb-2 text-snow">{col.head}</h2>
            {col.links.map((l) =>
              l.href.startsWith("/") ? (
                <Link key={l.key} href={l.href} className="mb-1.5 block hover:text-haldi">
                  {t(l.key)}
                </Link>
              ) : (
                <a key={l.key} href={l.href} className="mb-1.5 block hover:text-haldi">
                  {t(l.key)}
                </a>
              ),
            )}
          </div>
        ))}
      </div>

      <div className="mx-auto mt-8 max-w-6xl rounded-card border border-snow/10 bg-snow/5 p-4">
        <p className="text-xs font-extrabold text-snow">{company.legalName}</p>
        <p className="mt-1 text-xs">{t("foot.regd")}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {Object.entries(company.emails).map(([role, mail]) => (
            <a
              key={role}
              href={`mailto:${mail}`}
              className="rounded-pill border border-snow/20 px-2.5 py-1 text-xs font-bold text-muted hover:border-haldi hover:text-haldi"
            >
              {mail}
            </a>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-6 flex max-w-6xl flex-col gap-2 border-t border-snow/10 pt-4 text-xs md:flex-row md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} {company.legalName}</span>
        <span>{t("foot.powered")}</span>
      </div>
    </footer>
  );
}