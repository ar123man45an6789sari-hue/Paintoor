"use client";

/* Branded 404: logo lockup, one honest line, the India-wide promise, and two
   ways forward. Reached both by garbage slugs and by cities outside India —
   /[city] calls notFound() for anything that is not a real Indian city. */
import Link from "next/link";
import { Logo } from "@/components/Logo";
import { Wordmark } from "@/components/Wordmark";
import { useI18n } from "@/i18n";

export default function NotFound() {
  const { t } = useI18n();
  return (
    <main className="flex min-h-[70vh] flex-col items-center justify-center gap-5 px-4 py-16 text-center">
      <div className="flex items-center gap-3">
        <Logo className="h-12 w-12" />
        <Wordmark className="text-3xl font-black tracking-tight text-navy" />
      </div>
      <p className="text-6xl font-black tabular-nums text-saffron">404</p>
      <p className="max-w-md text-sm font-semibold text-muted">{t("nf.p")}</p>
      <p className="max-w-md text-sm font-extrabold text-navy">{t("nf.soon")}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-control bg-saffron px-6 py-3 text-sm font-extrabold text-snow transition-transform hover:-translate-y-0.5 hover:shadow-lift"
        >
          {t("nf.home")}
        </Link>
        <Link
          href="/providers"
          className="rounded-control border-2 border-line px-6 py-3 text-sm font-extrabold text-navy transition-colors hover:border-saffron hover:text-saffron"
        >
          {t("nf.cities")}
        </Link>
      </div>
    </main>
  );
}