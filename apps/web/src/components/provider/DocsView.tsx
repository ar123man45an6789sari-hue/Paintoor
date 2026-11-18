/* DocsView — per-job paperwork: the work agreement, tax invoice and, once a
   job completes, the payout record and handover certificate. Seals reflect
   real state (agreed / verified / pending); downloads are honest demos
   until the signed-PDF vault ships with the backend. */
"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon, type IconName } from "@/components/Icons";
import { getRequests, onRequestsChange } from "@/lib/requests";
import type { ServiceRequest } from "@/lib/requests";
import type { ProviderProfile } from "@/lib/providers";

type Seal = "agreed" | "verified" | "pending";
type DocRow = { icon: IconName; type: string; code: string; desc: string; seal: Seal };

function shortCode(id: string): string {
  return id.replace("req_", "").slice(0, 4).toUpperCase();
}

function docsFor(r: ServiceRequest): DocRow[] {
  const code = shortCode(r.id);
  const done = r.status === "completed";
  const rows: DocRow[] = [
    { icon: "sign", type: "pw.docs.ag", code: `AG-${code}`, desc: "pw.docs.agD", seal: "agreed" },
    { icon: "receipt", type: "pw.docs.inv", code: `INV-${code}`, desc: "pw.docs.invD", seal: done ? "verified" : "pending" },
  ];
  if (done) {
    rows.push({ icon: "wallet", type: "pw.docs.pay", code: `PAY-${code}`, desc: "pw.docs.payD", seal: "verified" });
    rows.push({ icon: "fileCheck", type: "pw.docs.wc", code: `WC-${code}`, desc: "pw.docs.wcD", seal: "verified" });
  }
  return rows;
}

const SEAL_STYLE: Record<Seal, string> = {
  agreed: "bg-ink/10 text-ink",
  verified: "bg-[rgba(14,159,110,0.12)] text-[#0E9F6E]",
  pending: "bg-[rgba(199,119,0,0.12)] text-[#C77700]",
};

export function DocsView({ profile, onToast }: { profile: ProviderProfile; onToast: (msg: string) => void }) {
  const { t } = useI18n();
  const [jobs, setJobs] = useState<ServiceRequest[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  useEffect(() => {
    const reload = () => {
      const mine = getRequests().filter(
        (r) => r.acceptedBy === profile.id && (r.status === "accepted" || r.status === "completed"),
      );
      setJobs(mine);
      setOpen((cur) => cur ?? mine[0]?.id ?? null);
    };
    reload();
    return onRequestsChange(reload);
  }, [profile.id]);

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("pw.docs.eyebrow")}</p>
      <h2 className="mt-1 text-2xl font-black tracking-[-0.02em] text-navy">{t("pw.docs.h")}</h2>
      <p className="mt-1 text-sm font-bold text-muted">{t("pw.docs.sub")}</p>

      {jobs.length === 0 ? (
        <div className="mt-4 rounded-card border-2 border-dashed border-line bg-white p-6 text-center">
          <Icon name="doc" className="mx-auto h-8 w-8 text-saffron" />
          <p className="mt-2 font-extrabold text-navy">{t("pw.docs.empty")}</p>
        </div>
      ) : (
        <div className="mt-4 space-y-3">
          {jobs.map((r) => {
            const docs = docsFor(r);
            const isOpen = open === r.id;
            return (
              <section key={r.id} className="overflow-hidden rounded-card border border-line bg-white shadow-card">
                <button
                  type="button"
                  onClick={() => setOpen(isOpen ? null : r.id)}
                  aria-expanded={isOpen}
                  className="flex w-full items-center gap-3 p-4 text-left md:p-5"
                >
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-saffron/10 text-saffron">
                    <Icon name="briefcase" className="h-5 w-5" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <b className="block truncate text-sm font-extrabold text-navy">
                      {t(`sk.${r.category}`)} · {r.customer}
                    </b>
                    <span className="block text-xs font-semibold text-muted">{t("pw.docs.files", { n: docs.length })}</span>
                  </span>
                  <Icon name="chevDown" className={`h-4 w-4 shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`} />
                </button>
                {isOpen && (
                  <ul className="divide-y divide-line border-t border-line">
                    {docs.map((d) => (
                      <li key={d.code} className="flex flex-wrap items-center gap-3 px-4 py-3 md:px-5">
                        <Icon name={d.icon} className="h-5 w-5 shrink-0 text-muted" />
                        <span className="min-w-0 flex-1">
                          <b className="block text-sm font-extrabold text-navy">
                            {t(d.type)} <span className="font-bold text-muted">· {d.code}</span>
                          </b>
                          <span className="block text-xs font-semibold text-muted">{t(d.desc)}</span>
                        </span>
                        <span className={`rounded-pill px-2.5 py-0.5 text-[11px] font-black ${SEAL_STYLE[d.seal]}`}>
                          {d.seal === "agreed" ? t("pw.docs.agreed") : d.seal === "verified" ? t("pw.docs.verified") : t("pw.docs.pending")}
                        </span>
                        <button
                          type="button"
                          onClick={() => onToast(t("pw.docs.demo"))}
                          className="min-h-10 rounded-control border-2 border-line px-3 py-2 text-xs font-extrabold text-navy hover:border-saffron hover:text-saffron"
                        >
                          <Icon name="download" className="mr-1 inline h-3.5 w-3.5" />
                          {t("pw.docs.dl")}
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            );
          })}
        </div>
      )}
    </div>
  );
}