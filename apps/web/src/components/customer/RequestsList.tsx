/* RequestsList v1 — live list from the demo request store. */
"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { getRequests, onRequestsChange } from "@/lib/requests";
import type { ServiceRequest } from "@/lib/requests";

export function RequestsList() {
  const { t } = useI18n();
  const [items, setItems] = useState<ServiceRequest[]>([]);

  useEffect(() => {
    setItems(getRequests());
    return onRequestsChange(() => setItems(getRequests()));
  }, []);

  if (items.length === 0) {
    return (
      <div className="rounded-card border border-dashed border-line bg-white p-10 text-center text-muted">
        {t("req.empty")}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {items
        .slice()
        .reverse()
        .map((r) => (
          <article key={r.id} className="rounded-card border border-line bg-white p-5 shadow-card">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h3 className="font-extrabold text-navy">{t(`sk.${r.category}`)}</h3>
              <span className="rounded-pill bg-neem/15 px-3 py-1 text-[11px] font-black text-neem">{t("req.open")}</span>
            </div>
            <p className="mt-1 text-xs text-muted">
              {r.city} · {r.zone} · {r.date || "—"} · {t(`slot.${r.slot}`)} · {t(`bud.${r.budget}`)} {r.material ? `· ${t("wiz.mat")}` : ""}
            </p>
            {r.description && <p className="mt-2 text-sm text-ink">{r.description}</p>}
            {r.photos.length > 0 && <p className="mt-2 text-xs text-muted">📷 {r.photos.join(", ")}</p>}
          </article>
        ))}
    </div>
  );
}