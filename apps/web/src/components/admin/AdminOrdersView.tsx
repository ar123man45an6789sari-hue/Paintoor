/* AdminOrdersView — the operations monitor: job requests from the customer
   side, the seeded booking, and this browser's shopkeeper orders, all in
   one read-only board with honest status chips. Admins watch here; the
   state machines themselves stay owned by their own stores. */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon } from "@/components/Icons";
import { getRequests, onRequestsChange } from "@/lib/requests";
import type { ServiceRequest } from "@/lib/requests";
import { SEED_JOB, inr } from "@/lib/jobs";
import { getShopState, onShopStateChange } from "@/lib/shopState";
import type { ShopOrder } from "@/lib/shopState";

const REQ_TONE: Record<string, string> = {
  open: "bg-saffron/15 text-saffron",
  interested: "bg-ink/10 text-ink",
  accepted: "bg-[rgba(14,159,110,0.12)] text-[#0E9F6E]",
  completed: "bg-[rgba(14,159,110,0.12)] text-[#0E9F6E]",
  cancelled: "bg-[rgba(199,0,60,0.12)] text-[#C7003C]",
};

const ORDER_TONE: Record<string, string> = {
  new: "bg-saffron/15 text-saffron",
  accepted: "bg-ink/10 text-ink",
  delivered: "bg-[rgba(14,159,110,0.12)] text-[#0E9F6E]",
};

function SectionHead({ icon, title, count }: { icon: "briefcase" | "calendar" | "cart"; title: string; count: number }) {
  return (
    <div className="mt-6 flex items-center gap-2 first:mt-0">
      <Icon name={icon} className="h-4 w-4 text-saffron" />
      <h3 className="text-sm font-black text-navy">{title}</h3>
      <span className="rounded-pill bg-chuna px-2 py-0.5 text-[10px] font-black text-muted">{count}</span>
    </div>
  );
}

export function AdminOrdersView() {
  const { t } = useI18n();
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [shopOrders, setShopOrders] = useState<ShopOrder[]>([]);

  const reload = useCallback(() => {
    setRequests(getRequests());
    setShopOrders(getShopState().orders);
  }, []);

  useEffect(() => {
    reload();
    const offR = onRequestsChange(reload);
    const offS = onShopStateChange(reload);
    return () => { offR(); offS(); };
  }, [reload]);

  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("ad.ord.eye")}</p>
      <div className="mt-1">
        <h2 className="text-2xl font-black tracking-[-0.02em] text-navy">{t("ad.ord.h")}</h2>
        <p className="mt-1 text-sm font-bold text-muted">{t("ad.ord.sub")}</p>
      </div>

      <SectionHead icon="briefcase" title={t("ad.ord.requests")} count={requests.length} />
      {requests.length === 0 ? (
        <p className="mt-2 rounded-card border-2 border-dashed border-line bg-white p-4 text-center text-xs font-extrabold text-muted">
          {t("ad.ord.noRequests")}
        </p>
      ) : (
        <div className="mt-2 space-y-2">
          {requests.map((r) => (
            <article key={r.id} className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-white p-3.5 shadow-card">
              <div className="min-w-0 flex-1 basis-[180px]">
                <h4 className="truncate text-sm font-extrabold text-navy">{r.customer} · {t(`sk.${r.category}`)}</h4>
                <p className="truncate text-xs font-semibold text-muted">
                  {r.zone}, {r.city} · {new Date(r.at).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                  {r.acceptedName ? ` · ${t("ad.ord.by", { name: r.acceptedName })}` : ""}
                </p>
              </div>
              <span className={`shrink-0 rounded-pill px-2.5 py-1 text-[10px] font-black ${REQ_TONE[r.status] ?? "bg-chuna text-muted"}`}>
                {t(`ad.ord.st.${r.status}`)}
              </span>
            </article>
          ))}
        </div>
      )}

      <SectionHead icon="calendar" title={t("ad.ord.bookings")} count={1} />
      <article className="mt-2 flex flex-wrap items-center gap-3 rounded-card border border-line bg-white p-3.5 shadow-card">
        <div className="min-w-0 flex-1 basis-[180px]">
          <h4 className="truncate text-sm font-extrabold text-navy">{SEED_JOB.id} · {SEED_JOB.title}</h4>
          <p className="truncate text-xs font-semibold text-muted">
            {SEED_JOB.addressLabel}, {SEED_JOB.city} · {inr(SEED_JOB.total)} · {t("ad.ord.progress", { day: SEED_JOB.day, days: SEED_JOB.totalDays, pct: SEED_JOB.pct })}
          </p>
        </div>
        <span className="shrink-0 rounded-pill bg-ink/10 px-2.5 py-1 text-[10px] font-black text-ink">{t("ad.ord.inProgress")}</span>
      </article>

      <SectionHead icon="cart" title={t("ad.ord.shopOrders")} count={shopOrders.length} />
      {shopOrders.length === 0 ? (
        <p className="mt-2 rounded-card border-2 border-dashed border-line bg-white p-4 text-center text-xs font-extrabold text-muted">
          {t("ad.ord.noShopOrders")}
        </p>
      ) : (
        <div className="mt-2 space-y-2">
          {shopOrders.map((o) => (
            <article key={o.id} className="flex flex-wrap items-center gap-3 rounded-card border border-line bg-white p-3.5 shadow-card">
              <div className="min-w-0 flex-1 basis-[180px]">
                <h4 className="truncate text-sm font-extrabold text-navy">{o.providerName} · {o.jobRef}</h4>
                <p className="truncate text-xs font-semibold text-muted">
                  {o.zone} · {o.items.reduce((a, x) => a + x.qty, 0)} {t("ad.ord.units")} · ₹{o.total.toLocaleString("en-IN")}
                </p>
              </div>
              <span className={`shrink-0 rounded-pill px-2.5 py-1 text-[10px] font-black ${ORDER_TONE[o.status] ?? "bg-chuna text-muted"}`}>
                {t(`sw.st.${o.status}`)}
              </span>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}