/* ServiceBuilder — the signature piece: pick a service, area, crew, store,
   brand and slot, and watch a live bill of quantities price itself.
   Material lines re-price per store with the same formula the marketplace
   uses (priceAt), labour is rate × area, and the job either drops into the
   global cart as one escrow-backed bill or gets booked into a slot. */
"use client";

import { useEffect, useState } from "react";
import { BRANDS, STORES, brandOf, buildKit, packLabel } from "@/lib/marketplace";
import { DAYPARTS, SERVICES, crewDays, nextSlots, serviceOf, type DayPart } from "@/lib/services";
import { addLine, requestCartOpen } from "@/lib/cartStore";
import { Icon } from "@/components/Icons";
import { useI18n } from "@/i18n";
import { BookModal } from "./BookModal";

const ROOMS = [
  { key: "1bhk", label: "1 BHK", area: 120 },
  { key: "2bhk", label: "2 BHK", area: 320 },
  { key: "3bhk", label: "3 BHK", area: 520 },
];

const seg = (on: boolean) =>
  `min-h-10 flex-1 rounded-control px-3 text-sm font-extrabold transition-colors ${
    on ? "bg-saffron text-snow" : "border border-line bg-white text-ink hover:border-saffron hover:text-saffron dark:bg-raatri dark:text-snow"
  }`;

const field =
  "mt-1.5 min-h-11 w-full rounded-control border border-line bg-white px-3 py-2 text-sm font-bold text-ink focus:border-saffron focus:outline-none dark:bg-raatri dark:text-snow";

export function ServiceBuilder({ svcId, onSvc }: { svcId: string; onSvc: (id: string) => void }) {
  const { t } = useI18n();
  const sv = serviceOf(svcId);
  const slots = nextSlots(7);
  const [room, setRoom] = useState("2bhk");
  const [area, setArea] = useState(320);
  const [coats, setCoats] = useState(sv.coats);
  const [crew, setCrew] = useState(3);
  const [storeId, setStoreId] = useState("sharma");
  const [brand, setBrand] = useState(BRANDS[0].slug);
  const [slotKey, setSlotKey] = useState(slots[0].key);
  const [part, setPart] = useState<DayPart>("am");
  const [booking, setBooking] = useState(false);

  useEffect(() => { setCoats(serviceOf(svcId).coats); }, [svcId]);

  const kit = buildKit(area, coats, sv.surface, brand);
  const store = STORES.find((s) => s.id === storeId) ?? STORES[0];
  /* same per-store formula as marketplace priceAt() */
  const at = (v: number) => Math.round((v * store.f) / 100) * 10;
  const labour = sv.rate * area;
  const days = crewDays(sv, area, crew);
  const slot = slots.find((s) => s.key === slotKey) ?? slots[0];

  const matLines = (kit.wood
    ? [{ label: t("mk.calc.enamel"), meta: packLabel(kit.topPacks), base: kit.topPrice }]
    : [
        { label: t("mk.calc.putty"), meta: `${kit.puttyKg} kg`, base: kit.puttyPrice },
        { label: t("mk.calc.primer"), meta: packLabel(kit.primerPacks), base: kit.primerPrice },
        { label: t("mk.calc.top"), meta: packLabel(kit.topPacks), base: kit.topPrice },
      ]
  ).filter((l) => l.base > 0);
  const matTotal = matLines.reduce((a, l) => a + at(l.base), 0);
  const tools = at(kit.tools);
  const total = matTotal + labour + tools;

  function addJob() {
    matLines.forEach((l, i) =>
      addLine({ key: `svjm-${sv.id}-${i}@${store.id}`, title: l.label, meta: `${l.meta} · ${store.n}`, price: at(l.base), storeId: store.id, qty: 1 }),
    );
    addLine({
      key: `svjl@${sv.id}`, title: t(`svc.${sv.id}.name`),
      meta: `${area} sq ft · ${t("svc.crewOf")} ${crew} · ${t("svc.days", { d: String(days) })}`,
      price: labour, storeId: "svc", qty: 1,
    });
    requestCartOpen();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_380px]">
      <div className="min-w-0 space-y-4 rounded-card border border-line bg-white p-5 dark:bg-raatri">
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("svc.cards")}</span>
          <select value={svcId} onChange={(e) => onSvc(e.target.value)} className={field}>
            {SERVICES.map((s) => <option key={s.id} value={s.id}>{t(`svc.${s.id}.name`)} — ₹{s.rate}/sq ft</option>)}
          </select>
        </label>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.calc.room")}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {ROOMS.map((r) => (
              <button key={r.key} type="button" className={seg(room === r.key)} onClick={() => { setRoom(r.key); setArea(r.area); }}>{r.label}</button>
            ))}
            <button key="custom" type="button" className={seg(room === "custom")} onClick={() => setRoom("custom")}>Custom</button>
          </div>
        </div>
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("svc.area")}</span>
          <input
            type="number" min={20} max={20000} value={area}
            onChange={(e) => { setRoom("custom"); setArea(Math.max(20, Number(e.target.value) || 0)); }}
            className={field}
          />
        </label>
        {!sv.surface.startsWith("wood") && (
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.calc.coats")}</p>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3].map((c) => (
                <button key={c} type="button" className={seg(coats === c)} onClick={() => setCoats(c)}>{c} coat{c > 1 ? "s" : ""}</button>
              ))}
            </div>
          </div>
        )}
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("svc.crew")}</p>
          <div className="mt-2 flex gap-2">
            {[2, 3, 4].map((c) => (
              <button key={c} type="button" className={seg(crew === c)} onClick={() => setCrew(c)}>
                <Icon name="users" className="mr-1 inline h-3.5 w-3.5" />{c}
              </button>
            ))}
          </div>
          <p className="mt-2 flex items-center gap-1.5 text-xs font-bold text-saffron">
            <Icon name="clock" className="h-3.5 w-3.5" />{t("svc.days", { d: String(days) })}
          </p>
        </div>
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("svc.slot")}</p>
          <div className="mk-rail mt-2">
            {slots.map((s) => (
              <button
                key={s.key} type="button" onClick={() => setSlotKey(s.key)} aria-pressed={slotKey === s.key}
                className={`flex-none rounded-control border px-3 py-2 text-xs font-extrabold transition-colors ${
                  slotKey === s.key ? "border-saffron bg-saffron text-snow" : "border-line bg-white text-ink hover:border-saffron hover:text-saffron dark:bg-raatri dark:text-snow"
                }`}
              >
                {s.label}
              </button>
            ))}
          </div>
          <div className="mt-2 flex gap-2">
            {DAYPARTS.map((p) => (
              <button key={p} type="button" className={seg(part === p)} onClick={() => setPart(p)}>{t(`svc.${p}`)}</button>
            ))}
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("svc.store")}</span>
            <select value={storeId} onChange={(e) => setStoreId(e.target.value)} className={field}>
              {STORES.map((s) => <option key={s.id} value={s.id}>{s.n} · {s.km} km</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.calc.brand")}</span>
            <select value={brand} onChange={(e) => setBrand(e.target.value)} className={field}>
              {BRANDS.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
            </select>
          </label>
        </div>
      </div>

      <div className="flex min-w-0 flex-col rounded-card border border-line bg-white p-5 dark:bg-raatri">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-saffron">{t("svc.boq")}</p>
        <p className="mt-1 text-xs text-muted">{store.n} · {brandOf(brand).name}</p>
        <ul className="mt-3 divide-y divide-dashed divide-line text-sm">
          {matLines.map((l) => (
            <li key={l.label} className="flex items-baseline justify-between gap-3 py-2">
              <span className="min-w-0 break-words font-extrabold text-ink dark:text-snow">{l.label}<span className="ml-2 text-xs font-semibold text-muted">{l.meta}</span></span>
              <span className="whitespace-nowrap font-black text-ink dark:text-snow">₹{at(l.base).toLocaleString("en-IN")}</span>
            </li>
          ))}
          <li className="flex items-baseline justify-between gap-3 py-2">
            <span className="min-w-0 break-words font-extrabold text-ink dark:text-snow">{t("svc.boq.lab", { r: String(sv.rate) })}<span className="ml-2 text-xs font-semibold text-muted">{area} sq ft</span></span>
            <span className="whitespace-nowrap font-black text-ink dark:text-snow">₹{labour.toLocaleString("en-IN")}</span>
          </li>
          <li className="flex items-baseline justify-between gap-3 py-2">
            <span className="min-w-0 break-words font-extrabold text-ink dark:text-snow">{t("svc.boq.tools")}</span>
            <span className="whitespace-nowrap font-black text-ink dark:text-snow">₹{tools.toLocaleString("en-IN")}</span>
          </li>
        </ul>
        <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3">
          <span className="text-sm font-black text-ink dark:text-snow">{t("svc.boq.total")}</span>
           <span className="whitespace-nowrap text-[26px] font-black leading-none text-saffron">₹{total.toLocaleString("en-IN")}</span>
        </div>
        <p className="mt-2 flex items-start gap-1.5 text-xs font-bold text-[#0e9f8a]">
          <Icon name="lock" className="mt-0.5 h-3.5 w-3.5" />{t("svc.boq.advance")}
        </p>
        <button type="button" onClick={addJob} className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-control bg-saffron px-5 py-2.5 text-sm font-extrabold text-snow transition-colors hover:bg-[#a80036]">
          <Icon name="cart" className="h-4 w-4" /> {t("svc.add")}
        </button>
        <button
          type="button"
          onClick={() => setBooking(true)}
          className="mt-2 flex min-h-11 items-center justify-center gap-2 rounded-control border-2 border-saffron px-5 py-2.5 text-sm font-extrabold text-saffron transition-colors hover:bg-saffron hover:text-snow"
        >
          <Icon name="calendar" className="h-4 w-4" /> {t("svc.book")} — {slot.label} · {t(`svc.${part}`)}
        </button>
      </div>

      {booking && (
        <BookModal
          cfg={{ svcId, area, coats, crew, storeId, brand, total, days, slotKey: slot.key, slotLabel: slot.label, part }}
          onClose={() => setBooking(false)}
        />
      )}
    </div>
  );
}