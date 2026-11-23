/* CommandView — the platform at a glance: live counts pulled from the demo
   stores (partners, shops, requests, incidents, escrow), a health row and
   the admin's own audit diary. Numbers are honest reads of what exists in
   this browser's demo data — nothing is invented. */
"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon, type IconName } from "@/components/Icons";
import { liveProviders, liveShops } from "@paintoor/mock-api";
import { PRODUCTS } from "@/lib/marketplace";
import { getRequests, onRequestsChange } from "@/lib/requests";
import { SEED_ESCROW, heldOf } from "@/lib/escrow";
import { getAdmin, onAdminChange } from "@/lib/adminState";
import type { AdminView } from "./adminNav";

const GRAD = "linear-gradient(135deg,#E00048,#A80036)";

function Stat({ icon, value, label, tone }: { icon: IconName; value: string; label: string; tone?: "alert" }) {
  return (
    <article className="rounded-card border border-line bg-white p-4 shadow-card">
      <span className={`flex h-9 w-9 items-center justify-center rounded-control ${tone === "alert" ? "bg-saffron text-snow" : "bg-saffron/10 text-saffron"}`}>
        <Icon name={icon} className="h-[18px] w-[18px]" />
      </span>
      <p className="mt-2.5 text-2xl font-black tabular-nums text-navy">{value}</p>
      <p className="text-xs font-bold text-muted">{label}</p>
    </article>
  );
}

export function CommandView({ go }: { go: (v: AdminView) => void }) {
  const { t } = useI18n();
  const [openReqs, setOpenReqs] = useState(0);
  const [totalReqs, setTotalReqs] = useState(0);
  const [incidents, setIncidents] = useState(0);
  const [blocked, setBlocked] = useState(0);
  const [holds, setHolds] = useState(0);
  const [log, setLog] = useState<{ at: number; text: string }[]>([]);

  const reload = useCallback(() => {
    const reqs = getRequests();
    setOpenReqs(reqs.filter((r) => r.status === "open").length);
    setTotalReqs(reqs.length);
    const a = getAdmin();
    setIncidents(a.incidents.filter((i) => i.status === "open").length);
    setBlocked(Object.keys(a.blocked).length);
    setHolds(Object.values(a.holds).filter(Boolean).length);
    setLog(a.log);
  }, []);

  useEffect(() => {
    reload();
    const offA = onAdminChange(reload);
    const offR = onRequestsChange(reload);
    return () => { offA(); offR(); };
  }, [reload]);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <section className="rounded-sheet shadow-card" style={{ background: GRAD }}>
        <div className="flex flex-wrap items-center gap-4 p-6 text-snow md:p-7">
          <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-pill border-4 border-snow/60 bg-snow/15">
            <Icon name="shieldCheck" className="h-6 w-6" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-snow/75">{t("ad.cmd.eye")}</p>
            <h1 className="mt-0.5 text-2xl font-black tracking-[-0.02em] md:text-3xl">{t("ad.cmd.h")}</h1>
            <p className="mt-1 text-xs font-bold text-snow/80">{t("ad.cmd.sub")}</p>
          </div>
          <span className="rounded-pill bg-snow/15 px-3 py-1.5 text-[11px] font-black">
            <Icon name="info" className="mr-1 inline h-3.5 w-3.5 align-[-0.15em]" />
            {t("ad.card.demo")}
          </span>
        </div>
      </section>

      {/* Platform stats */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <Stat icon="users" value={String(liveProviders.length)} label={t("ad.cmd.partners")} />
        <Stat icon="store" value={String(liveShops.length)} label={t("ad.cmd.shops")} />
        <Stat icon="briefcase" value={`${openReqs}/${totalReqs}`} label={t("ad.cmd.requests")} />
        <Stat icon="box" value={String(PRODUCTS.length)} label={t("ad.cmd.products")} />
        <Stat icon="alert" value={String(incidents)} label={t("ad.cmd.incidents")} tone={incidents > 0 ? "alert" : undefined} />
        <Stat icon="lock" value={String(blocked)} label={t("ad.cmd.blocked")} />
        <Stat icon="wallet" value={`₹${heldOf(SEED_ESCROW).toLocaleString("en-IN")}`} label={t("ad.cmd.escrow")} />
        <Stat icon="pause" value={String(holds)} label={t("ad.cmd.holds")} />
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-2">
        {/* Health + quick tiles */}
        <section className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("ad.cmd.healthEye")}</p>
          <h2 className="mt-0.5 text-xl font-black text-navy">{t("ad.cmd.healthH")}</h2>
          <ul className="mt-4 space-y-2">
            {[
              { icon: "checkCircle" as IconName, text: t("ad.cmd.h1"), ok: true },
              { icon: "checkCircle" as IconName, text: t("ad.cmd.h2"), ok: true },
              { icon: incidents > 0 ? ("alert" as IconName) : ("checkCircle" as IconName), text: t("ad.cmd.h3", { n: incidents }), ok: incidents === 0 },
              { icon: "info" as IconName, text: t("ad.cmd.h4"), ok: true },
            ].map((h, i) => (
              <li key={i} className="flex items-center gap-2.5 rounded-control bg-chuna px-3 py-2.5 text-xs font-bold text-navy">
                <Icon name={h.icon} className={`h-4 w-4 shrink-0 ${h.ok ? "text-[#0E9F6E]" : "text-saffron"}`} />
                {h.text}
              </li>
            ))}
          </ul>
          {/* Mobile-only shortcuts for the views the bottom nav omits */}
          <div className="mt-4 grid grid-cols-2 gap-2 lg:hidden">
            {([
              { id: "content", icon: "palette", label: "ad.v.content" },
              { id: "settings", icon: "gear", label: "ad.v.settings" },
            ] as { id: AdminView; icon: IconName; label: string }[]).map((x) => (
              <button
                key={x.id}
                type="button"
                onClick={() => go(x.id)}
                className="flex min-h-14 flex-col items-center justify-center gap-1 rounded-control border border-line bg-white text-[10px] font-extrabold text-muted shadow-card transition-colors hover:text-saffron"
              >
                <Icon name={x.icon} className="h-5 w-5" />
                {t(x.label)}
              </button>
            ))}
          </div>
        </section>

        {/* Audit diary */}
        <section className="rounded-card border border-line bg-white p-5 shadow-card">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-saffron">{t("ad.cmd.logEye")}</p>
          <h2 className="mt-0.5 text-xl font-black text-navy">{t("ad.cmd.logH")}</h2>
          {log.length === 0 ? (
            <p className="mt-4 rounded-control bg-chuna p-4 text-center text-xs font-bold text-muted">{t("ad.cmd.logEmpty")}</p>
          ) : (
            <ol className="mt-4 max-h-[320px] space-y-2 overflow-y-auto">
              {log.map((l, i) => (
                <li key={i} className="flex items-start gap-2.5 text-xs font-bold text-navy">
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-pill bg-saffron/10 text-saffron">
                    <Icon name="history" className="h-3 w-3" />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block leading-snug">{l.text}</span>
                    <span className="block text-[10px] font-extrabold text-muted">
                      {new Date(l.at).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </span>
                  </span>
                </li>
              ))}
            </ol>
          )}
        </section>
      </div>
    </div>
  );
}