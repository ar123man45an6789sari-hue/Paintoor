/* RequestsList v3 — two honest groups: Open (still waiting for a worker) and
   Matched (a worker accepted the lead — S10 closes the A→B→C loop here).
   Cancel flow, locale dates and photo chips stay as built in S9. */
"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { cancelRequest, getRequests, onRequestsChange } from "@/lib/requests";
import type { ServiceRequest } from "@/lib/requests";

const cap = (s: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1) : s);

function RequestCard({ r, confirmId, setConfirmId }: {
  r: ServiceRequest;
  confirmId: string | null;
  setConfirmId: (id: string | null) => void;
}) {
  const { lang, t } = useI18n();
  const locale = lang === "hi" ? "hi-IN" : lang === "gu" ? "gu-IN" : "en-IN";
  const matched = r.status === "interested" || r.status === "accepted";

  return (
    <article className="rounded-card border border-line bg-white p-5 shadow-card">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <h3 className="font-extrabold text-navy">
          {t(`sk.${r.category}`)}
          {matched && r.acceptedName ? ` · ${t("req.with", { name: r.acceptedName })}` : ""}
        </h3>
        <span
          className={`rounded-pill px-3 py-1 text-[11px] font-black ${
            matched ? "bg-saffron/15 text-saffron" : "bg-neem/15 text-neem"
          }`}
        >
          {matched ? t("req.group.matched") : t("req.open")}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted">
        {r.city} · {cap(r.zone)} ·{" "}
        {r.date
          ? new Date(`${r.date}T00:00:00`).toLocaleDateString(locale, { day: "numeric", month: "short", year: "numeric" })
          : "—"}{" "}
        · {t(`slot.${r.slot}`)} · {t(`bud.${r.budget}`)}
        {r.material ? ` · ${t("wiz.mat")}` : ""}
      </p>
      {r.description && <p className="mt-2 text-sm text-ink">{r.description}</p>}
      {r.photos.length > 0 && (
        <p className="mt-2">
          <span className="rounded-pill border border-line bg-chuna px-3 py-1 text-xs font-bold text-navy">
            📷 {r.photos.length} {t("req.photos")}
          </span>
        </p>
      )}
      {matched && r.acceptedName && (
        <p className="mt-3 rounded-control bg-haldi/15 px-3 py-2 text-xs font-semibold text-ink">
          🔔 {t("req.talkNext", { name: r.acceptedName })}
        </p>
      )}
      <div className="mt-4">
        {confirmId === r.id ? (
          <div className="flex flex-wrap items-center gap-2 rounded-control bg-danger/10 px-3 py-2">
            <span className="text-sm font-extrabold text-danger">{t("req.confirmQ")}</span>
            <button
              type="button"
              onClick={() => {
                cancelRequest(r.id);
                setConfirmId(null);
              }}
              className="rounded-control bg-danger px-3 py-1.5 text-xs font-extrabold text-white"
            >
              {t("req.yes")}
            </button>
            <button
              type="button"
              onClick={() => setConfirmId(null)}
              className="rounded-control border border-line px-3 py-1.5 text-xs font-extrabold text-muted hover:text-navy"
            >
              {t("req.no")}
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setConfirmId(r.id)}
            className="rounded-control border-2 border-line px-3 py-1.5 text-xs font-extrabold text-muted hover:border-danger hover:text-danger"
          >
            {t("req.cancel")}
          </button>
        )}
      </div>
    </article>
  );
}

export function RequestsList() {
  const { t } = useI18n();
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  useEffect(() => {
    setItems(getRequests());
    return onRequestsChange(() => setItems(getRequests()));
  }, []);

  const newestFirst = items.slice().reverse();
  const open = newestFirst.filter((r) => r.status === "open");
  const matched = newestFirst.filter((r) => r.status === "interested" || r.status === "accepted");

  if (open.length === 0 && matched.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line bg-white p-10 text-center text-muted">
        {t("req.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <p className="rounded-control border border-line bg-white px-4 py-2.5 text-xs font-semibold text-muted">
        💡 {t("req.next")}
      </p>

      {open.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.14em] text-muted">
            {t("req.group.open")} ({open.length})
          </h3>
          {open.map((r) => (
            <RequestCard key={r.id} r={r} confirmId={confirmId} setConfirmId={setConfirmId} />
          ))}
        </section>
      )}

      {matched.length > 0 && (
        <section className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-[0.14em] text-saffron">
            {t("req.group.matched")} ({matched.length})
          </h3>
          {matched.map((r) => (
            <RequestCard key={r.id} r={r} confirmId={confirmId} setConfirmId={setConfirmId} />
          ))}
        </section>
      )}
    </div>
  );
}