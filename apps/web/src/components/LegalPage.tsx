/* Shared shell for the small legal pages (terms / privacy / refund).
   Each page keeps its own three-language copy next to itself. */
"use client";

import { useI18n } from "@/i18n";
import type { Lang } from "@/i18n";

export type LegalCopy = {
  title: string;
  updated: string;
  sections: { h: string; p: string }[];
};

export function LegalPage({ copy }: { copy: Record<Lang, LegalCopy> }) {
  const { lang } = useI18n();
  const c = copy[lang];
  return (
    <main className="bg-chuna px-5 py-16">
      <div className="mx-auto max-w-3xl">
        <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">Paintoor</span>
        <h1 className="mt-2 text-3xl font-black text-navy md:text-4xl">{c.title}</h1>
        <p className="mt-2 text-xs font-semibold text-muted">{c.updated}</p>
        <div className="mt-8 space-y-6 rounded-sheet border border-line bg-white p-6 shadow-card md:p-8">
          {c.sections.map((s) => (
            <section key={s.h}>
              <h2 className="text-sm font-extrabold text-navy">{s.h}</h2>
              <p className="mt-1 text-sm leading-relaxed text-ink">{s.p}</p>
            </section>
          ))}
        </div>
        <p className="mt-6 text-xs text-muted">
          Paintoor™ India (OPC) Pvt. Ltd. · Shop No-07, Krishna Gokul Garden CHS Ltd, Thakur Complex, Kandivali East, Mumbai - 400101
        </p>
      </div>
    </main>
  );
}