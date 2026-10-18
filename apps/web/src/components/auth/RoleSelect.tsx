/* RoleSelect v2 — React 19 removed the global JSX namespace; icons typed as ReactNode. */
import type { ReactNode } from "react";
import type { Role } from "./types";

const OPTIONS: { role: Role; title: string; blurb: string; icon: ReactNode }[] = [
  {
    role: "customer",
    title: "I need work done",
    blurb: "Post a job, compare verified workers, pay safely.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5 10v10h14V10" />
      </svg>
    ),
  },
  {
    role: "provider",
    title: "I'm a skilled worker",
    blurb: "Daily leads, fair prices, on-time payouts.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
      </svg>
    ),
  },
  {
    role: "shopkeeper",
    title: "I run a store",
    blurb: "Sell paint, hardware & sanitary to jobs near you.",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-7 w-7">
        <path d="M3 9l1.5-5h15L21 9" />
        <path d="M4 9v11h16V9" />
        <path d="M9 20v-6h6v6" />
      </svg>
    ),
  },
];

export function RoleSelect({ onPick }: { onPick: (role: Role) => void }) {
  return (
    <div className="space-y-3">
      {OPTIONS.map((opt) => (
        <button
          key={opt.role}
          type="button"
          autoFocus={opt.role === "customer"}
          onClick={() => onPick(opt.role)}
          className="flex w-full items-center gap-4 rounded-card border border-line bg-white p-4 text-left transition-all hover:-translate-y-0.5 hover:border-saffron hover:shadow-card"
        >
          <span className="flex h-12 w-12 flex-none items-center justify-center rounded-control bg-navy text-haldi">
            {opt.icon}
          </span>
          <span>
            <span className="block font-extrabold text-navy">{opt.title}</span>
            <span className="block text-sm text-muted">{opt.blurb}</span>
          </span>
          <span className="ml-auto text-saffron" aria-hidden="true">→</span>
        </button>
      ))}
    </div>
  );
}