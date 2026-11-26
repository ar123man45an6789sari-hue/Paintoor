/* Live partner marketplace — open requests in the partner's own city,
   read through RLS and answered through DEFINER functions (Module 2.5). */
"use client";

import { useCallback, useEffect, useState } from "react";

type OpenRequest = {
  id: string;
  city: string;
  zone: string;
  category: string;
  description: string;
  budgetPaise: number;
  materialNeeded: boolean;
  preferredDate: string | null;
  status: string;
  createdAt: string;
  customerName: string;
  leads: { partnerId: string; status: string }[];
};

const inr = (paise: number) => `₹${(paise / 100).toLocaleString("en-IN")}`;

export function LivePartnerMarket() {
  const [myId, setMyId] = useState("");
  const [items, setItems] = useState<OpenRequest[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(() => {
    fetch("/api/partner/requests")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setItems(j && j.ok ? (j.requests as OpenRequest[]) : []))
      .catch(() => setItems([]));
  }, []);

  useEffect(() => {
    fetch("/api/me")
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => setMyId(j?.id ?? ""));
  }, []);
  useEffect(load, [load]);

  async function act(id: string, kind: "interest" | "decline") {
    setBusy(id + kind);
    try {
      const reason = kind === "decline" ? (window.prompt("Reason for declining (optional):") ?? "") : null;
      await fetch(`/api/partner/requests/${id}/${kind}`, {
        method: "POST",
        headers: reason !== null ? { "Content-Type": "application/json" } : undefined,
        body: reason !== null ? JSON.stringify({ reason }) : undefined,
      });
    } finally {
      setBusy(null);
      load();
    }
  }

  return (
    <div className="space-y-4 p-4 lg:p-6">
      <header>
        <h2 className="text-lg font-extrabold text-navy dark:text-snow">Open requests near you</h2>
        <p className="text-xs font-semibold text-muted">Live from the database — only your city, only open work.</p>
      </header>
      {items === null && <p className="text-sm font-bold text-muted">Loading…</p>}
      {items !== null && items.length === 0 && (
        <div className="rounded-card border border-line bg-white p-8 text-center shadow-card dark:bg-navy">
          <p className="text-sm font-extrabold text-navy dark:text-snow">No open requests right now</p>
          <p className="mt-1 text-xs font-semibold text-muted">New requests in your city will appear here instantly.</p>
        </div>
      )}
      {items?.map((r) => {
        const mine = r.leads.find((l) => l.partnerId === myId);
        return (
          <article key={r.id} className="rounded-card border border-line bg-white p-5 shadow-card dark:bg-navy">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="text-sm font-extrabold text-navy dark:text-snow">
                {r.category} · {r.zone}, {r.city}
              </h3>
              <span className="text-xs font-extrabold tabular-nums text-saffron">{inr(r.budgetPaise)}</span>
            </div>
            <p className="mt-1 text-xs font-semibold text-muted">
              {r.customerName} · {r.status}
              {r.preferredDate ? ` · start ${new Date(r.preferredDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}` : ""}
              {r.materialNeeded ? " · materials needed" : ""}
            </p>
            {r.description && <p className="mt-2 text-sm text-ink dark:text-snow">{r.description}</p>}
            <div className="mt-4 flex flex-wrap gap-2">
              {mine ? (
                <span className="rounded-pill border border-line bg-chuna px-3 py-1.5 text-xs font-extrabold text-muted">
                  You responded: {mine.status}
                </span>
              ) : (
                <>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void act(r.id, "interest")}
                    className="rounded-control bg-saffron px-4 py-1.5 text-xs font-extrabold text-snow hover:shadow-lift disabled:opacity-50"
                  >
                    I am interested
                  </button>
                  <button
                    type="button"
                    disabled={busy !== null}
                    onClick={() => void act(r.id, "decline")}
                    className="rounded-control border-2 border-line px-4 py-1.5 text-xs font-extrabold text-muted hover:border-danger hover:text-danger disabled:opacity-50"
                  >
                    Decline
                  </button>
                </>
              )}
            </div>
          </article>
        );
      })}
    </div>
  );
}