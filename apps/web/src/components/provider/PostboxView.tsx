/* PostboxView — the lead queue, restyled to the partner design: search +
   distance filters, honest counters (partners interested, quotes sent),
   pass-on-lead and the itemized quote sheet (labour + material + days).
   Accepting flows through the existing requests store (A -> B -> C loop). */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { SitePhoto } from "@/components/customer/SitePhoto";
import { acceptLead, addRequest, declineLead, getRequests, interestedCount, onRequestsChange } from "@/lib/requests";
import type { ServiceRequest } from "@/lib/requests";
import { distanceKm, openLeadsFor } from "@/lib/providers";
import type { ProviderProfile } from "@/lib/providers";
import { addDemoRequest, recordDecline } from "@/lib/providerstate";
import { addQuote, onPartnerChange, quotesFor } from "@/lib/partner";
import { sendQuote } from "@/lib/chats";
import { pushNotification } from "@/lib/notifications";

function agoLabel(at: number, t: (k: string, p?: Record<string, string | number>) => string): string {
  const mins = Math.max(1, Math.round((Date.now() - at) / 60_000));
  if (mins < 60) return t("pw.pb.ago.m", { n: mins });
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return t("pw.pb.ago.h", { n: hrs });
  return t("pw.pb.ago.d", { n: Math.round(hrs / 24) });
}

/* ---------------- quote sheet ---------------- */

function QuoteSheet({ lead, profile, onClose, onSent }: { lead: ServiceRequest; profile: ProviderProfile; onClose: () => void; onSent: () => void }) {
  const { t } = useI18n();
  const [labour, setLabour] = useState(9400);
  const [material, setMaterial] = useState(lead.material ? 5200 : 0);
  const [days, setDays] = useState(5);
  const [note, setNote] = useState("");
  const [err, setErr] = useState(false);
  const total = labour + material;

  function send() {
    if (labour < 1 || days < 1) {
      setErr(true);
      return;
    }
    acceptLead(lead.id, profile.id, profile.name);
    addQuote({ requestId: lead.id, labour, material, days, note: note.trim() });
    sendQuote(lead.id, { labour, material, note: note.trim(), total });
    pushNotification({
      kind: "system",
      audience: "customer",
      titleKey: "pw.notif.quote.title",
      bodyKey: "pw.notif.quote.body",
      params: { name: profile.name, total: total.toLocaleString("en-IN"), category: t(`sk.${lead.category}`) },
      requestId: lead.id,
    });
    onSent();
  }

  const field = "mt-1.5 w-full rounded-control border-2 border-line bg-white px-3 py-2.5 text-sm font-bold text-navy outline-none focus:border-saffron";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-raatri/70 p-0 sm:items-center sm:p-4" role="dialog" aria-modal="true" aria-label={t("pw.q.h")} onClick={onClose}>
      <div className="max-h-[92svh] w-full max-w-md overflow-y-auto rounded-t-sheet border border-line bg-white p-6 shadow-lift sm:rounded-sheet" onClick={(e) => e.stopPropagation()}>
        <h3 className="text-lg font-black text-navy">{t("pw.q.h")}</h3>
        <p className="mt-0.5 text-xs font-bold text-muted">
          {t(`sk.${lead.category}`)} · {lead.customer} · {lead.zone}
        </p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wider text-muted">{t("pw.q.labour")}</span>
            <input type="number" min={0} value={labour} onChange={(e) => { setLabour(Number(e.target.value)); setErr(false); }} className={field} aria-label={t("pw.q.labour")} />
          </label>
          <label className="block">
            <span className="text-xs font-extrabold uppercase tracking-wider text-muted">{t("pw.q.material")}</span>
            <input type="number" min={0} value={material} onChange={(e) => { setMaterial(Number(e.target.value)); setErr(false); }} className={field} aria-label={t("pw.q.material")} />
          </label>
        </div>
        <label className="mt-3 block">
          <span className="text-xs font-extrabold uppercase tracking-wider text-muted">{t("pw.q.days")}</span>
          <input type="number" min={1} value={days} onChange={(e) => { setDays(Number(e.target.value)); setErr(false); }} className={field} aria-label={t("pw.q.days")} />
        </label>
        <label className="mt-3 block">
          <span className="text-xs font-extrabold uppercase tracking-wider text-muted">{t("pw.q.note")}</span>
          <textarea rows={2} value={note} onChange={(e) => setNote(e.target.value)} placeholder={t("pw.q.notePh")} className={field} aria-label={t("pw.q.note")} />
        </label>
        {err && <p className="mt-2 text-xs font-extrabold text-danger">{t("pw.q.err")}</p>}
        <div className="mt-4 flex items-center justify-between rounded-control bg-chuna px-4 py-3">
          <span className="text-xs font-black uppercase tracking-wider text-muted">{t("pw.q.total")}</span>
          <b className="text-xl font-black tabular-nums text-navy">₹{total.toLocaleString("en-IN")}</b>
        </div>
        <div className="mt-4 flex gap-2">
          <button type="button" onClick={send} className="min-h-12 flex-1 rounded-control bg-saffron px-4 py-3 text-sm font-extrabold text-snow hover:shadow-lift">
            <Icon name="send" className="mr-1.5 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("pw.q.send")}
          </button>
          <button type="button" onClick={onClose} className="min-h-12 rounded-control border-2 border-line px-4 py-3 text-sm font-extrabold text-muted hover:text-navy">
            {t("pw.q.cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ---------------- the view ---------------- */

export function PostboxView({ profile, onMessage, onToast }: { profile: ProviderProfile; onMessage: (requestId: string) => void; onToast: (msg: string) => void }) {
  const { t } = useI18n();
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [q, setQ] = useState("");
  const [dist, setDist] = useState(0);
  const [quoteFor, setQuoteFor] = useState<ServiceRequest | null>(null);
  const [, setTick] = useState(0);

  const reload = useCallback(() => {
    setItems(openLeadsFor(profile, getRequests()));
  }, [profile]);

  useEffect(() => {
    reload();
    const offReq = onRequestsChange(reload);
    const offPartner = onPartnerChange(reload);
    return () => { offReq(); offPartner(); };
  }, [reload]);

  /* Re-run every 30s so the response-window countdown stays live. */
  useEffect(() => {
    const id = window.setInterval(() => setTick((v) => v + 1), 30_000);
    return () => window.clearInterval(id);
  }, []);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return items
      .filter((r) => dist === 0 || distanceKm(profile.zone, r.zone) <= dist)
      .filter((r) => !needle || `${r.customer} ${r.zone} ${r.description}`.toLowerCase().includes(needle))
      .sort((a, b) => b.at - a.at);
  }, [items, q, dist, profile.zone]);

  function pass(r: ServiceRequest) {
    declineLead(r.id, profile.id, "busy");
    recordDecline("busy");
    onToast(t("pd.declined"));
  }

  function minsLeft(r: ServiceRequest): number {
    if (!r.windowEndsAt) return 0;
    return Math.max(0, Math.round((r.windowEndsAt - Date.now()) / 60_000));
  }

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("pw.pb.eyebrow")}</p>
      <h2 className="mt-1 text-2xl font-black tracking-[-0.02em] text-navy">{t("pw.pb.h")}</h2>
      <p className="mt-1 text-sm font-bold text-muted">{t("pw.pb.sub")}</p>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <label className="flex min-h-11 flex-1 items-center gap-2 rounded-control border-2 border-line bg-white px-3 focus-within:border-saffron">
          <Icon name="search" className="h-4 w-4 text-muted" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder={t("pw.pb.search")}
            aria-label={t("pw.pb.search")}
            className="w-full bg-transparent py-2 text-sm font-bold text-navy outline-none"
          />
        </label>
        <select
          value={dist}
          onChange={(e) => setDist(Number(e.target.value))}
          aria-label={t("pw.pb.dist")}
          className="min-h-11 rounded-control border-2 border-line bg-white px-3 py-2 text-xs font-extrabold text-navy outline-none focus:border-saffron"
        >
          <option value={0}>{t("pw.pb.distAny")}</option>
          <option value={5}>{t("pw.pb.distN", { n: 5 })}</option>
          <option value={10}>{t("pw.pb.distN", { n: 10 })}</option>
        </select>
        <span className="rounded-pill bg-chuna px-3 py-1.5 text-xs font-extrabold text-muted">
          <Icon name="mapPin" className="mr-1 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("pw.pb.radius", { zone: profile.zone })}
        </span>
        <button
          type="button"
          onClick={() => { addRequest(addDemoRequest(profile)); onToast(t("pd.demoAdded")); }}
          className="min-h-11 rounded-control border-2 border-dashed border-line px-3 py-2 text-xs font-extrabold text-muted hover:border-saffron hover:text-saffron"
        >
          <Icon name="plus" className="mr-1 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("pd.loadDemo")}
        </button>
      </div>

      <div className="mt-4 grid gap-4">
        {filtered.length === 0 && (
          <div className="rounded-card border-2 border-dashed border-line bg-white p-6 text-center">
            <Icon name="toolbox" className="mx-auto h-8 w-8 text-saffron" />
            <p className="mt-2 font-extrabold text-navy">{t("pd.emptyLeads")}</p>
          </div>
        )}
        {filtered.map((r) => {
          const km = distanceKm(profile.zone, r.zone);
          const quotes = quotesFor(r.id).length;
          const left = minsLeft(r);
          return (
            <article key={r.id} className="rounded-card border border-line bg-white p-5 shadow-card">
              <div className="flex flex-wrap items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-pill bg-chuna text-xs font-black text-navy">
                  {r.customer.split(" ").map((x) => x[0]).slice(0, 2).join("").toUpperCase()}
                </span>
                <div className="min-w-0 flex-1">
                  <b className="text-sm font-extrabold text-navy">{r.customer}</b>
                  <p className="text-xs font-semibold text-muted">
                    <Icon name="mapPin" className="mr-1 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />
                    {r.zone} · {t("pd.distance", { km })}
                  </p>
                </div>
                <div className="text-right text-[11px] font-bold text-muted">
                  {agoLabel(r.at, t)}
                  {left > 0 && (
                    <span className="mt-1 block rounded-pill bg-saffron/15 px-2.5 py-0.5 font-black text-saffron">
                      {t("pd.timer", { mins: left })}
                    </span>
                  )}
                </div>
              </div>

              <h3 className="mt-3 font-extrabold text-navy">{t(`sk.${r.category}`)}</h3>
              <p className="mt-1 text-sm font-semibold text-ink">{r.description}</p>

              {r.photos.length > 0 && (
                <div className="mt-3 flex gap-2 overflow-x-auto pb-1">
                  {r.photos.slice(0, 4).map((src, i) => (
                    <SitePhoto key={`${r.id}-p${i}`} src={src} alt={t("pd.photosN", { count: r.photos.length })} className="h-16 w-24 shrink-0 rounded-control border border-line object-cover" />
                  ))}
                </div>
              )}

              <div className="mt-3 flex flex-wrap gap-1.5">
                <span className="rounded-pill bg-saffron/15 px-3 py-1 text-xs font-black text-saffron">
                  {t("pd.budgetHint")} · {t(`bud.${r.budget}`)}
                </span>
                <span className="rounded-pill bg-chuna px-3 py-1 text-xs font-extrabold text-muted">
                  {r.material ? t("pd.materialInc") : t("pd.customerMat")}
                </span>
                <span className="rounded-pill bg-chuna px-3 py-1 text-xs font-extrabold text-muted">
                  <Icon name="calendar" className="mr-1 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />
                  {r.date ? t("pd.slotOn", { date: r.date }) : t("pd.anyDate")} · {t(`slot.${r.slot}`)}
                </span>
                <span className="rounded-pill bg-chuna px-3 py-1 text-xs font-extrabold text-muted">
                  <Icon name="users" className="mr-1 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />
                  {t("pw.pb.interested", { n: interestedCount(r) })}
                </span>
                {quotes > 0 && (
                  <span className="rounded-pill bg-ink/10 px-3 py-1 text-xs font-extrabold text-ink">
                    <Icon name="receipt" className="mr-1 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />
                    {t("pw.pb.yourQuotes", { n: quotes })}
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <button type="button" onClick={() => onMessage(r.id)} className="min-h-11 rounded-control border-2 border-line px-3 py-2.5 text-xs font-extrabold text-navy hover:border-saffron hover:text-saffron">
                  <Icon name="chat" className="mr-1.5 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("pw.pb.ask")}
                </button>
                <button type="button" onClick={() => setQuoteFor(r)} className="min-h-11 rounded-control bg-saffron px-3 py-2.5 text-xs font-extrabold text-snow hover:shadow-lift">
                  <Icon name="receipt" className="mr-1.5 inline h-[1.05em] w-[1.05em] align-[-0.18em]" />{t("pw.pb.quote")}
                </button>
                <button type="button" onClick={() => pass(r)} className="min-h-11 rounded-control border-2 border-line px-3 py-2.5 text-xs font-extrabold text-muted hover:border-danger hover:text-danger">
                  {t("pw.pb.pass")}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {quoteFor && (
        <QuoteSheet
          lead={quoteFor}
          profile={profile}
          onClose={() => setQuoteFor(null)}
          onSent={() => { setQuoteFor(null); onToast(t("pw.q.sent")); }}
        />
      )}
    </div>
  );
}