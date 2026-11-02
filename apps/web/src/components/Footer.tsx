/* Footer v5 — official company identity: legal name, registered address,
   tap-to-call helpline and role-based email contacts (client-provided). */
"use client";

import Link from "next/link";
import { useI18n } from "@/i18n";
import { company, helpCentre, poweredBy, socials } from "@paintoor/brand";
import { Logo } from "./Logo";
import { Wordmark } from "./Wordmark";

/* Minimal stroke glyphs for the official handles — no emoji, no icon font. */
function SocialGlyph({ id }: { id: string }) {
  const common = {
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className: "h-[18px] w-[18px]",
    "aria-hidden": true as const,
  };
  switch (id) {
    case "instagram":
      return (
        <svg {...common}>
          <rect x="3" y="3" width="18" height="18" rx="5" />
          <circle cx="12" cy="12" r="4" />
          <circle cx="17.3" cy="6.7" r="0.7" fill="currentColor" stroke="none" />
        </svg>
      );
    case "facebook":
      return (
        <svg {...common}>
          <path d="M15.5 4h-2a4 4 0 0 0-4 4v3H7v4h2.5v6h4v-6h2.5l.5-4h-3V8a1 1 0 0 1 1-1h1.5z" />
        </svg>
      );
    case "x":
      return (
        <svg {...common}>
          <path d="M5 4l14 16M19 4L5 20" />
        </svg>
      );
    case "telegram":
      return (
        <svg {...common}>
          <path d="M21 3L10 14M21 3l-7 18-4-7-7-4z" />
        </svg>
      );
    default:
      return (
        <svg {...common}>
          <rect x="2.5" y="6" width="19" height="12" rx="3.5" />
          <path d="M10.5 9.5v5l4.5-2.5z" fill="currentColor" stroke="none" />
        </svg>
      );
  }
}

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
        { key: "fl.refund", href: "/refund" },
        { key: "fl.terms", href: "/terms" },
        { key: "fl.privacy", href: "/privacy" },
        { key: "fl.safety", href: "/faq" },
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
    <footer className="relative overflow-hidden border-t border-line bg-raatri px-4 py-10 text-sm text-muted md:px-6">
      {/* Diagonal brand watermark: sits under every piece of real content at
          7% so the footer text stays fully readable. Purely decorative. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 flex select-none items-center justify-center">
        {/* Mobile: logo on top, name below (space is tight). Laptop: side by
            side and much bigger. 7% keeps every real line of text readable. */}
        <div className="flex -rotate-12 flex-col items-center gap-3 opacity-[0.07] md:flex-row md:gap-10">
          <Logo className="h-28 w-28 md:h-56 md:w-56" />
          <Wordmark className="text-[17vw] font-black leading-none tracking-tight text-snow md:text-[11vw]" />
        </div>
      </div>
      <div className="relative mx-auto grid max-w-6xl gap-8 md:grid-cols-[1.3fr_1fr_1fr_1fr]">
        <div>
          <h2 className="mb-2">
            <Wordmark className="text-2xl font-black text-snow" />
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

      <div className="relative mx-auto mt-8 max-w-6xl rounded-card border border-snow/10 bg-snow/5 p-4">
        <p className="text-xs font-extrabold text-snow">{company.legalName}</p>
        <p className="mt-2 text-xs font-extrabold text-haldi">*{helpCentre.label}*</p>
        <p className="mt-1 text-xs">{helpCentre.address}</p>
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

      <div className="relative mx-auto mt-6 flex max-w-6xl flex-col gap-3 border-t border-snow/10 pt-4 text-xs md:flex-row md:items-center md:justify-between">
        <span>© {new Date().getFullYear()} {company.legalName}</span>
        <div className="flex items-center gap-2">
          {socials.map((s) =>
            s.url ? (
              <a
                key={s.id}
                href={s.url}
                target="_blank"
                rel="noreferrer"
                aria-label={s.label}
                className="flex h-9 w-9 items-center justify-center rounded-pill border border-snow/15 bg-snow/5 text-snow/80 transition-colors hover:border-saffron hover:text-snow"
              >
                <SocialGlyph id={s.id} />
              </a>
            ) : (
              <span
                key={s.id}
                title={`${s.label} — coming soon`}
                aria-label={`${s.label} (coming soon)`}
                className="flex h-9 w-9 cursor-default items-center justify-center rounded-pill border border-snow/15 bg-snow/5 text-snow/50"
              >
                <SocialGlyph id={s.id} />
              </span>
            ),
          )}
        </div>
        <span className="font-extrabold text-snow">Powered by {poweredBy}</span>
      </div>
    </footer>
  );
}