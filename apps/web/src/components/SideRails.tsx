/* SideRails — two edge tabs pinned mid-right on every page (idea borrowed
   from painting-service sites, restyled on-brand): "Enquire now" opens a
   call-back form (with plan timing + WhatsApp opt-in, the fields users
   expect from Asian Paints-style booking), "Painting cost" opens the kit
   estimator that feeds the global cart. */
"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { BRANDS, buildKit, packLabel } from "@/lib/marketplace";
import { addLine, requestCartOpen } from "@/lib/cartStore";
import { Icon } from "@/components/Icons";
import { useI18n } from "@/i18n";

const seg = (on: boolean) =>
  `min-h-10 flex-1 rounded-control px-3 text-sm font-extrabold transition-colors ${
    on ? "bg-saffron text-snow" : "border border-line bg-white text-ink hover:border-saffron hover:text-saffron dark:bg-raatri dark:text-snow"
  }`;

const field =
  "mt-1.5 min-h-11 w-full rounded-control border border-line bg-white px-3 py-2 text-sm font-bold text-ink focus:border-saffron focus:outline-none dark:bg-raatri dark:text-snow";

export function SideRails() {
  const { t } = useI18n();
  const [which, setWhich] = useState<"" | "enq" | "cost">("");
  return (
    <>
      <div className="fixed right-0 top-1/2 z-40 flex -translate-y-1/2 flex-col gap-2">
        <button
          type="button"
          onClick={() => setWhich("enq")}
          className="lens-pink rounded-l-card px-2.5 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-snow shadow-lift transition-transform hover:-translate-x-1 [writing-mode:vertical-rl] rotate-180"
        >
          {t("rail.enquire")}
        </button>
        <button
          type="button"
          onClick={() => setWhich("cost")}
          className="rounded-l-card border border-r-0 border-line bg-white px-2.5 py-5 text-[11px] font-black uppercase tracking-[0.2em] text-saffron shadow-lift transition-transform hover:-translate-x-1 [writing-mode:vertical-rl] rotate-180 dark:bg-raatri"
        >
          {t("rail.cost")}
        </button>
      </div>
      {which === "enq" && <EnquiryModal onClose={() => setWhich("")} />}
      {which === "cost" && <CostModal onClose={() => setWhich("")} />}
    </>
  );
}

function Shell({ label, onClose, children }: { label: string; onClose: () => void; children: React.ReactNode }) {
  const { t } = useI18n();
  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center bg-navy/60 p-4" role="dialog" aria-modal="true" aria-label={label} onClick={onClose}>
      <div className="max-h-[88vh] w-full max-w-md overflow-y-auto rounded-sheet border border-line bg-white p-6 shadow-lift md:max-w-lg dark:bg-raatri" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">{label}</span>
          <button type="button" onClick={onClose} aria-label={t("mk.close")} className="flex h-9 w-9 items-center justify-center rounded-pill border border-line text-muted transition-colors hover:border-saffron hover:text-saffron">
            <Icon name="close" className="h-4 w-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function EnquiryModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [need, setNeed] = useState("i");
  const [plan, setPlan] = useState("now");
  const [wa, setWa] = useState(true);
  const [sent, setSent] = useState(false);
  const [err, setErr] = useState("");

  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!/^\d{10}$/.test(phone)) { setErr(t("enq.err")); return; }
    setSent(true);
  }

  const planLabel = plan === "now" ? t("enq.plan.now") : plan === "month" ? t("enq.plan.month") : t("enq.plan.later");

  return (
    <Shell label={t("enq.title")} onClose={onClose}>
      {sent ? (
        <div className="flex flex-col items-center py-6 text-center">
          <span className="flex h-20 w-20 items-center justify-center rounded-full bg-saffron/10">
            <Icon name="checkCircle" className="h-9 w-9 text-saffron" />
          </span>
          <h3 className="mt-4 text-lg font-black text-navy dark:text-snow">{t("enq.done")}</h3>
          <p className="mt-1 max-w-[260px] text-sm text-muted">{t("enq.doneSub")}</p>
          <p className="mt-2 text-xs font-bold text-muted">
            {t("enq.plan")}: <span className="text-ink dark:text-snow">{planLabel}</span>
            {wa ? ` · ${t("enq.waNote")}` : ""}
          </p>
          <button type="button" onClick={onClose} className="mt-5 min-h-11 rounded-pill bg-saffron px-6 py-2.5 text-sm font-extrabold text-snow hover:bg-[#a80036]">
            {t("mk.close")}
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="space-y-4">
          <p className="text-sm text-muted">{t("enq.sub")}</p>
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
          <label className="block">
            <span className="text-sm font-bold text-ink dark:text-snow">{t("enq.city")}</span>
            <input required value={city} onChange={(e) => setCity(e.target.value)} className={field} />
          </label>
          <label className="block">
            <span className="text-sm font-bold text-ink dark:text-snow">{t("enq.need")}</span>
            <select value={need} onChange={(e) => setNeed(e.target.value)} className={field}>
              <option value="i">{t("enq.need.i")}</option>
              <option value="e">{t("enq.need.e")}</option>
              <option value="w">{t("enq.need.w")}</option>
              <option value="f">{t("enq.need.f")}</option>
            </select>
          </label>
          <label className="block">
            <span className="text-sm font-bold text-ink dark:text-snow">{t("enq.plan")}</span>
            <select value={plan} onChange={(e) => setPlan(e.target.value)} className={field}>
              <option value="now">{t("enq.plan.now")}</option>
              <option value="month">{t("enq.plan.month")}</option>
              <option value="later">{t("enq.plan.later")}</option>
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm font-bold text-muted">
            <input type="checkbox" checked={wa} onChange={(e) => setWa(e.target.checked)} className="accent-saffron" />
            {t("enq.wa")}
          </label>
          <button type="submit" className="min-h-12 w-full rounded-control bg-saffron px-6 py-3 text-sm font-extrabold text-snow transition-colors hover:bg-[#a80036]">
            {t("enq.send")}
          </button>
        </form>
      )}
    </Shell>
  );
}

const ROOMS = [
  { key: "1bhk", label: "1 BHK", area: 120 },
  { key: "2bhk", label: "2 BHK", area: 320 },
  { key: "3bhk", label: "3 BHK", area: 520 },
];

function CostModal({ onClose }: { onClose: () => void }) {
  const { t } = useI18n();
  const [room, setRoom] = useState("2bhk");
  const [area, setArea] = useState(320);
  const [surface, setSurface] = useState("interior");
  const [coats, setCoats] = useState(2);
  const [brand, setBrand] = useState(BRANDS[0].slug);
  const kit = buildKit(area, coats, surface, brand);
  const bName = BRANDS.find((b) => b.slug === brand)?.name ?? brand;

  const rows: { label: string; meta: string; price: number }[] = [];
  if (!kit.wood) {
    rows.push({ label: t("mk.calc.putty"), meta: `${kit.puttyKg} kg`, price: kit.puttyPrice });
    rows.push({ label: t("mk.calc.primer"), meta: packLabel(kit.primerPacks), price: kit.primerPrice });
  }
  rows.push({ label: kit.wood ? t("mk.calc.enamel") : t("mk.calc.top"), meta: packLabel(kit.topPacks), price: kit.topPrice });
  rows.push({ label: t("mk.calc.tools"), meta: kit.wood ? "sandpaper + brush" : "roller + brush", price: kit.tools });

  function addKit() {
    if (!kit.wood) {
      if (kit.puttyPrice > 0) addLine({ key: `kit-putty@${brand}`, title: t("mk.calc.putty"), meta: `${kit.puttyKg} kg · ${bName}`, price: kit.puttyPrice, storeId: "kit", qty: 1 });
      if (kit.primerPrice > 0) addLine({ key: `kit-primer@${brand}`, title: t("mk.calc.primer"), meta: `${packLabel(kit.primerPacks)} · ${bName}`, price: kit.primerPrice, storeId: "kit", qty: 1 });
    }
    addLine({ key: `kit-top@${brand}`, title: kit.wood ? t("mk.calc.enamel") : t("mk.calc.top"), meta: `${packLabel(kit.topPacks)} · ${bName}`, price: kit.topPrice, storeId: "kit", qty: 1 });
    addLine({ key: `kit-tools@${brand}`, title: t("mk.calc.tools"), meta: `${area} sq ft · ${coats} coat(s)`, price: kit.tools, storeId: "kit", qty: 1 });
    onClose();
    requestCartOpen();
  }

  return (
    <Shell label={t("rail.cost")} onClose={onClose}>
      <h3 className="text-xl font-black text-navy dark:text-snow">{t("cost.title")}</h3>
      <p className="mt-1 text-sm text-muted">{t("cost.sub")}</p>
      <div className="mt-5 grid gap-6 md:grid-cols-2">
        <div className="space-y-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.calc.room")}</p>
            <div className="mt-2 flex gap-2">
              {ROOMS.map((r) => (
                <button key={r.key} type="button" className={seg(room === r.key)} onClick={() => { setRoom(r.key); setArea(r.area); }}>{r.label}</button>
              ))}
              <button key="custom" type="button" className={seg(room === "custom")} onClick={() => setRoom("custom")}>Custom</button>
            </div>
          </div>
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.calc.area")}</span>
            <input
              type="number" min={20} max={20000} value={area}
              onChange={(e) => { setRoom("custom"); setArea(Math.max(20, Number(e.target.value) || 0)); }}
              className={field}
            />
          </label>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.calc.surface")}</p>
            <div className="mt-2 flex gap-2">
              {[["interior", t("mk.calc.interior")], ["exterior", t("mk.calc.exterior")], ["wood", t("mk.calc.wood")]].map(([k, label]) => (
                <button key={k} type="button" className={seg(surface === k)} onClick={() => setSurface(k)}>{label}</button>
              ))}
            </div>
          </div>
          {!kit.wood && (
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.calc.coats")}</p>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3].map((c) => (
                  <button key={c} type="button" className={seg(coats === c)} onClick={() => setCoats(c)}>{c} coat{c > 1 ? "s" : ""}</button>
                ))}
              </div>
            </div>
          )}
          <label className="block">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.calc.brand")}</span>
            <select value={brand} onChange={(e) => setBrand(e.target.value)} className={field}>
              {BRANDS.map((b) => <option key={b.slug} value={b.slug}>{b.name}</option>)}
            </select>
          </label>
        </div>
        <div className="flex flex-col rounded-card border border-line bg-chuna p-4 dark:bg-[#0B0E11]">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-muted">{t("mk.calc.work")}</p>
          <ul className="mt-2 space-y-1 text-xs text-muted">
            {!kit.wood && (
              <>
                <li>Putty @ 12 sq ft/kg → <b className="text-ink dark:text-snow">{kit.puttyKg} kg</b></li>
                <li>Primer @ 130 sq ft/L → <b className="text-ink dark:text-snow">{kit.primerL} L</b> ({packLabel(kit.primerPacks)})</li>
              </>
            )}
            <li>{kit.wood ? "Enamel" : "Topcoat"} @ {kit.wood ? 110 : 150} sq ft/L × {coats} → <b className="text-ink dark:text-snow">{kit.topL} L</b> ({packLabel(kit.topPacks)})</li>
          </ul>
          <ul className="mt-3 divide-y divide-dashed divide-line">
            {rows.map((r) => (
              <li key={r.label} className="flex items-baseline justify-between gap-3 py-2">
                <span className="text-sm font-extrabold text-ink dark:text-snow">{r.label}<span className="ml-2 text-xs font-semibold text-muted">{r.meta}</span></span>
                <span className="text-sm font-black text-ink dark:text-snow">₹{r.price.toLocaleString("en-IN")}</span>
              </li>
            ))}
          </ul>
          <div className="mt-2 flex items-baseline justify-between border-t border-line pt-3">
            <span className="text-sm font-black text-ink dark:text-snow">{t("mk.calc.total")}</span>
            <span className="text-[26px] font-black leading-none text-saffron">₹{kit.total.toLocaleString("en-IN")}</span>
          </div>
          <button type="button" onClick={addKit} className="mt-4 flex min-h-11 items-center justify-center gap-2 rounded-control bg-saffron px-5 py-2.5 text-sm font-extrabold text-snow transition-colors hover:bg-[#a80036]">
            <Icon name="cart" className="h-4 w-4" /> {t("mk.calc.add")}
          </button>
        </div>
      </div>
    </Shell>
  );
}