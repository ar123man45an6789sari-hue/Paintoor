/* LeadsDeck v1 — the provider's lead queue. Accept closes the A→B→C loop:
   the request leaves the customer's open list and the customer is notified. */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { acceptLead, addRequest, declineLead, getRequests, onRequestsChange } from "@/lib/requests";
import type { ServiceRequest } from "@/lib/requests";
import { pushNotification } from "@/lib/notifications";
import { distanceKm, getProviderProfile, openLeadsFor } from "@/lib/providers";
import type { ProviderProfile } from "@/lib/providers";
import { addDemoRequest, getProviderState, onProviderStateChange, recordDecline, toggleOnline } from "@/lib/providerstate";
import { LeadCard } from "./LeadCard";

const REASONS = [
  { id: "busy", key: "pd.reasonBusy" },
  { id: "far", key: "pd.reasonFar" },
  { id: "small", key: "pd.reasonSmall" },
  { id: "skill", key: "pd.reasonSkill" },
];

/** How many cards sit in the visible stack. */
const STACK = 3;

export function LeadsDeck({ profile }: { profile: ProviderProfile }) {
  const { t } = useI18n();
  const [items, setItems] = useState<ServiceRequest[]>([]);
  const [online, setOnline] = useState(true);
  const [declineFor, setDeclineFor] = useState<ServiceRequest | null>(null);
  const [reason, setReason] = useState("busy");
  const [toast, setToast] = useState<string | null>(null);
  const [dragEnabled, setDragEnabled] = useState(true);

  const reload = useCallback(() => {
    setItems(getRequests());
    setOnline(getProviderState().online);
  }, []);

  useEffect(() => {
    reload();
    const offRequests = onRequestsChange(reload);
    const offState = onProviderStateChange(reload);
    return () => {
      offRequests();
      offState();
    };
  }, [reload]);

  /* Decorative motion (drag) is off for users who asked for less motion. */
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const apply = () => setDragEnabled(!mq.matches);
    apply();
    mq.addEventListener("change", apply);
    return () => mq.removeEventListener("change", apply);
  }, []);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  const leads = useMemo(() => {
    if (!online) return [];
    const now = Date.now();
    return openLeadsFor(profile, items).filter((r) => !r.windowEndsAt || r.windowEndsAt > now);
  }, [items, online, profile]);

  const visible = leads.slice(0, STACK);
  const pending = visible.filter((r) => r.status === "open");

  function accept(request: ServiceRequest) {
    const updated = acceptLead(request.id, profile.id, profile.name);
    if (updated) {
      pushNotification({
        kind: "lead_accepted",
        audience: "customer",
        titleKey: "notif.leadAccepted.title",
        bodyKey: "notif.leadAccepted.body",
        params: { name: profile.name, category: t(`sk.${updated.category}`) },
        requestId: updated.id,
      });
    }
    setToast(t("pd.accepted"));
  }

  function decline(request: ServiceRequest, declineReason: string) {
    declineLead(request.id, profile.id, declineReason);
    recordDecline(declineReason);
    setDeclineFor(null);
    setToast(t("pd.declined"));
  }

  function loadDemo() {
    addRequest(addDemoRequest(profile));
    setToast(t("pd.demoAdded"));
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-navy">{t("pd.leadsH")}</h2>
          <p className="mt-1 text-sm text-muted">{t("pd.leadsSub", { mins: 30 })}</p>
        </div>
        <span className="rounded-pill bg-saffron/15 px-3 py-1.5 text-xs font-black text-saffron">
          {t("pd.leadCount", { count: pending.length })}
        </span>
      </div>

      {!online && (
        <div className="rounded-card border-2 border-dashed border-line bg-white p-6 text-center">
          <p className="text-3xl">🌙</p>
          <p className="mt-2 font-extrabold text-navy">{t("pd.emptyOffline")}</p>
          <button
            type="button"
            onClick={() => setOnline(toggleOnline())}
            className="mt-4 min-h-12 rounded-control bg-neem px-5 py-3 text-sm font-extrabold text-snow hover:shadow-lift"
          >
            ● {t("pd.goOnline")}
          </button>
        </div>
      )}

      {online && visible.length === 0 && (
        <div className="rounded-card border-2 border-dashed border-line bg-white p-8 text-center">
          <p className="text-3xl">🧰</p>
          <p className="mt-2 font-extrabold text-navy">{t("pd.emptyLeads")}</p>
          <button
            type="button"
            onClick={loadDemo}
            className="mt-4 min-h-12 rounded-control border-2 border-saffron px-5 py-3 text-sm font-extrabold text-saffron hover:bg-saffron hover:text-snow"
          >
            ✨ {t("pd.loadDemo")}
          </button>
        </div>
      )}

      {online && visible.length > 0 && (
        <div className="space-y-3">
          {visible.map((r, i) => (
            <LeadCard
              key={r.id}
              request={r}
              depth={i}
              km={distanceKm(profile.zone, r.zone)}
              minsLeft={r.windowEndsAt ? Math.ceil((r.windowEndsAt - Date.now()) / 60000) : null}
              dragEnabled={dragEnabled}
              onAccept={() => accept(r)}
              onDecline={() => setDeclineFor(r)}
            />
          ))}
        </div>
      )}

      {/* Decline reason sheet — the reason feeds future matching (Ch. 11.3). */}
      {declineFor && (
        <div className="fixed inset-0 z-modal flex items-end justify-center bg-raatri/50 p-4 sm:items-center">
          <div className="w-full max-w-md rounded-sheet border border-line bg-white p-6 shadow-lift">
            <h3 className="text-lg font-extrabold text-navy">{t("pd.declineQ")}</h3>
            <p className="mt-1 text-xs text-muted">{t("pd.declineNote")}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {REASONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => setReason(r.id)}
                  className={`min-h-12 rounded-pill border-2 px-4 py-2 text-sm font-extrabold transition-colors ${
                    reason === r.id ? "border-saffron bg-saffron text-snow" : "border-line text-muted hover:border-saffron hover:text-saffron"
                  }`}
                >
                  {t(r.key)}
                </button>
              ))}
            </div>
            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={() => decline(declineFor, reason)}
                className="min-h-12 flex-1 rounded-control bg-danger px-4 py-3 text-sm font-extrabold text-snow"
              >
                {t("pd.declineGo")}
              </button>
              <button
                type="button"
                onClick={() => setDeclineFor(null)}
                className="min-h-12 rounded-control border-2 border-line px-4 py-3 text-sm font-extrabold text-muted hover:border-navy hover:text-navy"
              >
                {t("pd.declineKeep")}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className="fixed bottom-6 left-1/2 z-toast w-[min(92vw,420px)] -translate-x-1/2 rounded-control bg-navy px-4 py-3 text-center text-sm font-bold text-snow shadow-lift">
          {toast}
        </div>
      )}
    </section>
  );
}