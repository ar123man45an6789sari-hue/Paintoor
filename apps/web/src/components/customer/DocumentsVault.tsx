/* Documents vault — job-wise folders of agreements, invoices and
   warranties.

   A warranty only ever appears inside its own job folder (terrace
   waterproofing -> 7 yr WRN-2290-KP4R, exterior texture -> 3 yr
   WRN-2104-MZ8T). The live job folder also lists the site photos pulled
   from the crews' day logs. Downloads are honest demos: documents save a
   plain-text receipt, photos save the real image file. */
"use client";

import { useEffect, useRef, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon, type IconName } from "@/components/Icons";
import { VAULT_SEED, type VaultDoc, type VaultFolder } from "@/lib/docs";
import { SEED_JOB } from "@/lib/jobs";
import { SitePhoto } from "@/components/customer/SitePhoto";

const KIND_ICON: Record<VaultDoc["kind"], IconName> = {
  agreement: "fileCheck",
  invoice: "receipt",
  warranty: "award",
};

/** Plain-text stand-in receipt for a signed PDF (demo phase). */
function receiptText(folder: VaultFolder, doc: VaultDoc, kindLabel: string): string {
  return [
    "PAINTOOR — DOCUMENT RECEIPT (DEMO)",
    "",
    `Document: ${doc.id} (${kindLabel})`,
    `Job: ${folder.jobId} — ${folder.title} (${folder.when})`,
    doc.years ? `Warranty validity: ${doc.years} years` : "",
    `Downloaded: ${new Date().toLocaleString("en-IN")}`,
    "",
    "This demo receipt stands in for the signed PDF in the production vault.",
  ]
    .filter(Boolean)
    .join("\n");
}

export function DocumentsVault() {
  const { t } = useI18n();
  /* The live job starts open; finished folders stay collapsed. */
  const [openIds, setOpenIds] = useState<string[]>([VAULT_SEED[0].jobId]);
  const [downloaded, setDownloaded] = useState<string | null>(null);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  /* Site photos of the live job, deduped across all crews' day logs. */
  const photos = Array.from(new Set(SEED_JOB.crews.flatMap((c) => c.days.flatMap((d) => d.shots))));

  const toggle = (jobId: string) =>
    setOpenIds((o) => (o.includes(jobId) ? o.filter((x) => x !== jobId) : [...o, jobId]));

  function download(folder: VaultFolder, doc: VaultDoc) {
    const blob = new Blob([receiptText(folder, doc, t(`cd.doc.${doc.kind}`))], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.id}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setDownloaded(doc.id);
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setDownloaded(null), 2500);
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("cd.nav.docs")}</h1>
        <p className="mt-1 text-sm font-bold text-muted">{t("cd.doc.sub")}</p>
      </div>

      {VAULT_SEED.map((f) => {
        const isOpen = openIds.includes(f.jobId);
        return (
          <section key={f.jobId} className="rounded-card border border-line bg-white shadow-card">
            {/* Folder header */}
            <button
              type="button"
              onClick={() => toggle(f.jobId)}
              aria-expanded={isOpen}
              className="flex w-full items-center gap-3 p-4 text-left"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-control bg-saffron/10 text-saffron">
                <Icon name="briefcase" className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-extrabold text-navy">
                  {f.jobId} · {f.title}
                </span>
                <span className="block text-xs font-bold text-muted">
                  {f.when} · {f.docs.length} {t("cd.doc.filesg")}
                </span>
              </span>
              <span
                className={`shrink-0 rounded-pill px-2.5 py-0.5 text-[10px] font-extrabold ${
                  f.state === "live" ? "bg-saffron/10 text-saffron" : "bg-ink/15 text-ink"
                }`}
              >
                {f.state === "live" ? t("cd.doc.live") : t("cd.doc.done")}
              </span>
              <Icon
                name="chevDown"
                className={`h-4 w-4 shrink-0 text-muted transition-transform ${isOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isOpen && (
              <div className="border-t border-line p-4 pt-1">
                {/* Documents */}
                <div className="space-y-2">
                  {f.docs.map((doc) => (
                    <div key={doc.id} className="flex flex-wrap items-center gap-3 rounded-control border border-line p-3">
                      <span
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-control ${
                          doc.kind === "warranty" ? "bg-ink/15 text-ink" : "bg-chuna text-navy"
                        }`}
                      >
                        <Icon name={KIND_ICON[doc.kind]} className="h-4 w-4" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-xs font-extrabold text-navy">
                          {t(`cd.doc.${doc.kind}`)} · {doc.id}
                        </span>
                        <span className="block truncate text-[11px] font-bold text-muted">{doc.meta}</span>
                      </span>
                      {doc.years && (
                        <span className="shrink-0 rounded-pill bg-ink/15 px-2.5 py-0.5 text-[10px] font-extrabold text-ink">
                          <Icon name="shieldCheck" className="mr-0.5 inline h-3 w-3 align-[-0.12em]" />
                          {t("cd.doc.valid", { n: doc.years })}
                        </span>
                      )}
                      <button
                        type="button"
                        onClick={() => download(f, doc)}
                        className="inline-flex shrink-0 items-center gap-1.5 rounded-control border border-line px-3 py-1.5 text-xs font-extrabold text-navy transition-colors hover:border-saffron hover:text-saffron"
                      >
                        <Icon name={downloaded === doc.id ? "check" : "download"} className="h-3.5 w-3.5" />
                        {downloaded === doc.id ? t("cd.doc.downloaded") : t("cd.doc.dl")}
                      </button>
                    </div>
                  ))}
                </div>

                {/* Site photos — live job only, pulled from the day logs */}
                {f.jobId === SEED_JOB.id && photos.length > 0 && (
                  <div className="mt-3">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-muted">{t("cd.doc.photos")}</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {photos.map((p) => (
                        <a
                          key={p}
                          href={p}
                          download
                          aria-label={`${t("cd.doc.dl")} — ${p}`}
                          className="group relative block h-16 w-20 overflow-hidden rounded-control border border-line"
                        >
                          <SitePhoto src={p} alt="" className="h-full w-full object-cover" />
                          <span className="absolute inset-0 hidden items-center justify-center bg-[#0B0E11]/50 text-snow group-hover:flex">
                            <Icon name="download" className="h-4 w-4" />
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <p className="mt-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-muted">{t("cd.doc.demo")}</p>
              </div>
            )}
          </section>
        );
      })}
    </div>
  );
}