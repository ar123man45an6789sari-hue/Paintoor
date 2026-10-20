/* PostJobWizard v1 — 4 steps, writes to the demo request store. */
"use client";

import { useState } from "react";
import { useI18n } from "@/i18n";
import { addRequest } from "@/lib/requests";
import { pushNotification } from "@/lib/notifications";
import { seed } from "@paintoor/mock-api";
import { getSession } from "@/lib/session";

const CITIES = ["Vadodara", "Ahmedabad", "Surat", "Indore", "Amritsar", "Chennai"];
const SLOTS = ["m", "a", "e", "f"];
const BUDGETS = ["e", "s", "p"];

export function PostJobWizard({ onDone }: { onDone: () => void }) {
  const { t } = useI18n();
  const [step, setStep] = useState(1);
  const [category, setCategory] = useState("painting");
  const [description, setDescription] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [city, setCity] = useState("Vadodara");
  const [zone, setZone] = useState("");
  const [landmark, setLandmark] = useState("");
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("f");
  const [budget, setBudget] = useState("s");
  const [material, setMaterial] = useState(true);

  const inputClass = "w-full rounded-control border border-line bg-white px-3 py-2.5 text-sm outline-none focus:border-saffron";
  const labelClass = "mb-1 block text-sm font-bold text-ink";

  function submit() {
    const session = getSession();
     const created = addRequest({
      customer: session?.name ?? "Guest",
      city,
      zone: zone || city,
      category,
      description,
      photos,
      budget,
      material,
      date,
      slot,
    });
        seed.providers
      .filter((p) => p.city === created.city && p.skills.includes(created.category))
      .forEach((p) => {
        pushNotification({
          kind: "new_lead",
          audience: "provider",
          providerId: p.id,
          titleKey: "notif.newLead.title",
          bodyKey: "notif.newLead.body",
          params: { category: t(`sk.${created.category}`), zone: created.zone },
          requestId: created.id,
        });
      });
    onDone();
  }

  return (
    <div className="rounded-card border border-line bg-white p-6 shadow-card">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-extrabold text-navy">{t("wiz.title")}</h2>
        <span className="text-xs font-black text-saffron">{t("wiz.step")} {step}/4</span>
      </div>
      <div className="mb-5 h-1.5 overflow-hidden rounded-pill bg-chuna">
        <div className="h-full rounded-pill bg-saffron transition-all duration-500" style={{ width: `${step * 25}%` }} />
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <label className="block">
            <span className={labelClass}>{t("wiz.cat")}</span>
            <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputClass}>
              {["painting", "electrical", "plumbing", "carpentry", "cleaning"].map((s) => (
                <option key={s} value={s}>{t(`sk.${s}`)}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>{t("wiz.desc")}</span>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4} placeholder={t("wiz.descPh")} className={inputClass} />
          </label>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <label className="block">
            <span className={labelClass}>{t("wiz.photos")}</span>
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={(e) => setPhotos(Array.from(e.target.files ?? []).map((f) => f.name))}
              className="block w-full text-sm text-muted file:mr-3 file:rounded-control file:border-0 file:bg-saffron file:px-4 file:py-2 file:text-sm file:font-extrabold file:text-white"
            />
          </label>
          {photos.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {photos.map((p) => (
                <span key={p} className="rounded-pill border border-line bg-chuna px-3 py-1 text-xs font-bold text-navy">📷 {p}</span>
              ))}
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <label className="block">
            <span className={labelClass}>{t("wiz.city")}</span>
            <select value={city} onChange={(e) => setCity(e.target.value)} className={inputClass}>
              {CITIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </label>
          <label className="block">
            <span className={labelClass}>{t("wiz.area")}</span>
            <input value={zone} onChange={(e) => setZone(e.target.value)} placeholder={t("wiz.areaPh")} className={inputClass} />
          </label>
          <label className="block">
            <span className={labelClass}>{t("wiz.land")}</span>
            <input value={landmark} onChange={(e) => setLandmark(e.target.value)} className={inputClass} />
          </label>
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className={labelClass}>{t("wiz.date")}</span>
              <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputClass} />
            </label>
            <label className="block">
              <span className={labelClass}>{t("wiz.slot")}</span>
              <select value={slot} onChange={(e) => setSlot(e.target.value)} className={inputClass}>
                {SLOTS.map((s) => (
                  <option key={s} value={s}>{t(`slot.${s}`)}</option>
                ))}
              </select>
            </label>
          </div>
          <label className="block">
            <span className={labelClass}>{t("wiz.budget")}</span>
            <select value={budget} onChange={(e) => setBudget(e.target.value)} className={inputClass}>
              {BUDGETS.map((b) => (
                <option key={b} value={b}>{t(`bud.${b}`)}</option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-sm text-muted">
            <input type="checkbox" checked={material} onChange={(e) => setMaterial(e.target.checked)} className="accent-saffron" />
            {t("wiz.mat")}
          </label>
        </div>
      )}

      <div className="mt-6 flex gap-3">
        {step > 1 && (
          <button type="button" onClick={() => setStep(step - 1)} className="rounded-control border-2 border-line px-4 py-2.5 text-sm font-extrabold text-muted hover:border-navy hover:text-navy">
            {t("wiz.back")}
          </button>
        )}
        {step < 4 ? (
          <button type="button" onClick={() => setStep(step + 1)} className="flex-1 rounded-control bg-saffron px-4 py-2.5 text-sm font-extrabold text-white hover:shadow-lift">
            {t("wiz.next")}
          </button>
        ) : (
          <button type="button" onClick={submit} className="flex-1 rounded-control bg-saffron px-4 py-2.5 text-sm font-extrabold text-white hover:shadow-lift">
            {t("wiz.submit")}
          </button>
        )}
      </div>
    </div>
  );
}