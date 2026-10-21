/* RoleSelect v4 — simple, warm, tag chips: Customer / Partner / Shop owner.
   Koi confusion nahi: har card pe saaf likha hai "main kaun hoon". */
import type { ReactNode } from "react";
import type { Role } from "./types";
import { useI18n } from "@/i18n";

export function RoleSelect({ onPick }: { onPick: (role: Role) => void }) {
  const { t } = useI18n();

  const OPTIONS: { role: Role; title: string; blurb: string; tag: string; icon: ReactNode }[] = [
    {
      role: "customer",
      title: t("role.c.t"),
      blurb: t("role.c.b"),
      tag: t("role.c.tag"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
          <path d="M3 10.5 12 3l9 7.5" />
          <path d="M5 10v10h14V10" />
        </svg>
      ),
    },
    {
      role: "provider",
      title: t("role.p.t"),
      blurb: t("role.p.b"),
      tag: t("role.p.tag"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      ),
    },
    {
      role: "shopkeeper",
      title: t("role.s.t"),
      blurb: t("role.s.b"),
      tag: t("role.s.tag"),
      icon: (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
          <path d="M3 9l1.5-5h15L21 9" />
          <path d="M4 9v11h16V9" />
          <path d="M9 20v-6h6v6" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      {OPTIONS.map((opt) => (
        <button
          key={opt.role}
          type="button"
          autoFocus={opt.role === "customer"}
          onClick={() => onPick(opt.role)}
          className="flex w-full items-start gap-4 rounded-card border border-line bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-saffron hover:shadow-card"
        >
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-control bg-navy text-haldi">
            {opt.icon}
          </span>
          <span className="min-w-0 flex-1">
            <span className="flex flex-wrap items-center gap-2">
              <span className="block font-extrabold text-navy">{opt.title}</span>
              <span className="rounded-pill bg-saffron/15 px-2.5 py-0.5 text-xs font-black text-saffron">{opt.tag}</span>
            </span>
            <span className="mt-0.5 block text-sm text-muted">{opt.blurb}</span>
          </span>
          <span className="ml-auto text-saffron" aria-hidden="true">→</span>
        </button>
      ))}
    </div>
  );
}