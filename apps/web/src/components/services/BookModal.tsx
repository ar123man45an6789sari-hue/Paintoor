/* BookModal — slot confirmation: summary of the built job, name + phone,
   WhatsApp opt-in; mints a local SV-… booking id and stores it in
   localStorage pt_bookings (frontend-only, no backend yet). */
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { STORES, brandOf } from "@/lib/marketplace";
import { readBookings, saveBookings, serviceOf, type DayPart } from "@/lib/services";
import { Icon } from "@/components/Icons";
import { useI18n } from "@/i18n";

const field =
  "mt-1.5 min-h-11 w-full rounded-control border border-line bg-white px-3 py-2 text-sm font-bold text-ink focus:border-saffron focus:outline-none dark:bg-raatri dark:text-snow";

export type JobCfg = {
  svcId: string; area: number; coats: number; crew: number;
  storeId: string; brand: string; total: number; days: number;
  slotKey: string; slotLabel: string; part: DayPart;
};

export function BookModal({ cfg, onClose }: { cfg: JobCfg; onClose: () => void }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [wa, setWa] = useState(true);
  const [err, setErr] = useState("");
  const [done, setDone] = useState<string | null>(null);

  const sv = serviceOf(cfg.svcId);
  const store = STORES.find((s) => s.id === cfg.storeId) ?? STORES[0];

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) { setErr(t("enq.err")); return; }
    const id = `SV-${Date.now().toString(36).slice(-5).toUpperCase()}${Math.floor(Math.random() * 90 + 10)}`;
    saveBookings([
      { id, svc: cfg.svcId, area: cfg.area, crew: cfg.crew, store: cfg.storeId, total: cfg.total, slot: cfg.slotLabel, part: cfg.part, wa, at: Date.now() },
      ...readBookings(),
    ].slice(0, 8));
    window.dispatchEvent(new CustomEvent("pt:booked"));
    setDone(id);
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy/60 p-4" role="dialog" aria-modal="true" aria-label={t("svc.bk.title")} onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-sheet border border-line bg-white p-6 shadow-lift dark:bg-raatri" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">{t("svc.bk.title")}</span>
          <button type="button" onClick={onClose} aria-label={t("mk.close")} className="flex h-9 w-9 items-center justify-center rounded-pill border border-line text-muted transition-colors hover:border-saffron hover:text-saffron">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>

        {done ? (
          <div className="flex flex-col items-center py-4 text-center">
            <span className="flex h-20 w-20 items-center justify-center rounded-full bg-[#0e9f8a]/10">
              <Icon name="checkCircle" className="h-9 w-9 text-[#0e9f8a]" />
            </span>
            <h3 className="mt-4 text-lg font-black text-navy dark:text-snow">{t("svc.bk.done")}</h3>
            <p className="mt-1 text-sm text-muted">
              {t("svc.bk.id")} <b className="font-black text-ink dark:text-snow">{done}</b>
            </p>
            <ul className="mt-4 w-full space-y-2 rounded-card border border-line bg-chuna p-3 text-left text-sm dark:bg-[#0B0E11]">
              <li className="flex justify-between gap-3"><span className="font-extrabold text-ink dark:text-snow">{t(`svc.${cfg.svcId}.name`)}</span><span className="font-black text-saffron">₹{cfg.total.toLocaleString("en-IN")}</span></li>
              <li className="flex justify-between gap-3"><span className="font-extrabold text-ink dark:text-snow">{t("svc.bk.when")}</span><span className="font-black text-saffron">{cfg.slotLabel} · {t(`svc.${cfg.part}`)}</span></li>
              <li className="flex justify-between gap-3"><span className="font-extrabold text-ink dark:text-snow">{t("svc.crew")}</span><span className="font-black text-saffron">{cfg.crew} · {t("svc.days", { d: String(cfg.days) })}</span></li>
            </ul>
            {wa && <p className="mt-3 text-xs font-bold text-muted">{t("enq.waNote")}</p>}
            <button type="button" onClick={onClose} className="mt-5 min-h-11 rounded-pill bg-saffron px-6 py-2.5 text-sm font-extrabold text-snow hover:bg-[#a80036]">
              {t("mk.close")}
            </button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-4">
            <ul className="space-y-1.5 rounded-card border border-line bg-chuna p-3 text-sm dark:bg-[#0B0E11]">
              <li className="flex justify-between gap-3"><span className="font-extrabold text-ink dark:text-snow">{t(`svc.${cfg.svcId}.name`)}</span><span className="text-xs font-bold text-muted">{cfg.area} sq ft · {cfg.coats} coat(s)</span></li>
              <li className="flex justify-between gap-3"><span className="font-extrabold text-ink dark:text-snow">{t("svc.bk.when")}</span><span className="text-xs font-bold text-muted">{cfg.slotLabel} · {t(`svc.${cfg.part}`)}</span></li>
              <li className="flex justify-between gap-3"><span className="font-extrabold text-ink dark:text-snow">{t("svc.store")}</span><span className="text-xs font-bold text-muted">{store.n} · {brandOf(cfg.brand).name}</span></li>
              <li className="flex justify-between gap-3 border-t border-line pt-1.5"><span className="font-black text-ink dark:text-snow">{t("svc.boq.total")}</span><span className="font-black text-saffron">₹{cfg.total.toLocaleString("en-IN")}</span></li>
            </ul>
            <label className="block">
              <span className="text-sm font-bold text-ink dark:text-snow">{t("enq.name")}</span>
              <input required value={name} onChange={(e) => setName(e.target.value)} className={field} />
            </label>
            <label className="block">
              <span className="text-sm font-bold text-ink dark:text-snow">{t("enq.phone")}</span>
              <span className="mt-1.5 flex items-stretch gap-2">
                <span className="flex min-h-11 items-center rounded-control border border-line bg-chuna px-3 text-sm font-extrabold text-muted dark:bg-raatri">+91</span>
                <input
                  required inputMode="numeric" value={phone}
                  onChange={(e) => { setPhone(e.target.value.replace(/\D/g, "").slice(0, 10)); setErr(""); }}
                  className={field}
                />
              </span>
              {err && <span className="mt-1 block text-xs font-bold text-saffron">{err}</span>}
            </label>
            <label className="flex items-center gap-2 text-sm font-bold text-muted">
              <input type="checkbox" checked={wa} onChange={(e) => setWa(e.target.checked)} className="accent-saffron" />
              {t("enq.wa")}
            </label>
            <p className="flex items-start gap-1.5 text-xs text-muted">
              <Icon name="lock" className="mt-0.5 h-3.5 w-3.5 text-saffron" />{t("svc.boq.advance")}
            </p>
            <button type="submit" className="min-h-12 w-full rounded-control bg-saffron px-6 py-3 text-sm font-extrabold text-snow transition-colors hover:bg-[#a80036]">
              {t("svc.book")}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}