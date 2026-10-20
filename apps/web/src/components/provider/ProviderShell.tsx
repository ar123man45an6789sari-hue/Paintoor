/* ProviderShell v1 — the worker's home: earnings always on top, one-handed
   tabs, online switch. Blueprint Ch. 11.1 + 23.2 (PROVIDER shell). */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { getProviderProfile, levelKeyFor } from "@/lib/providers";
import { getProviderState, onProviderStateChange, toggleOnline } from "@/lib/providerstate";
import { WorkTab } from "./WorkTab";
import { LeadsDeck } from "./LeadsDeck";
import { EarningsTab } from "./EarningsTab";
import { ProfileTab } from "./ProfileTab";

type Tab = "work" | "leads" | "earn" | "profile";

const TABS: { id: Tab; key: string; emoji: string }[] = [
  { id: "work", key: "pd.tab.work", emoji: "🏠" },
  { id: "leads", key: "pd.tab.leads", emoji: "🔔" },
  { id: "earn", key: "pd.tab.earn", emoji: "💰" },
  { id: "profile", key: "pd.tab.profile", emoji: "👤" },
];

export function ProviderShell({ name }: { name: string }) {
  const { t } = useI18n();
  const profile = useMemo(() => getProviderProfile(name), [name]);
  const [tab, setTab] = useState<Tab>("work");
  const [online, setOnline] = useState(true);
  const [today, setToday] = useState(0);
  const [week, setWeek] = useState(0);
  const [payout, setPayout] = useState(0);

  const reload = useCallback(() => {
    const s = getProviderState();
    setOnline(s.online);
    setToday(s.todayEarnings);
    setWeek(s.weekEarnings);
    setPayout(s.pendingPayout);
  }, []);

  useEffect(() => {
    reload();
    return onProviderStateChange(reload);
  }, [reload]);

  return (
    <div className="space-y-5">
      <div
        className="rounded-sheet p-6 text-snow shadow-card"
        style={{ background: "linear-gradient(150deg,#e00048,#a80036)" }}
      >
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="text-3xl">🔧</span>
            <div>
              <h1 className="text-2xl font-black">{profile.name}</h1>
              <p className="mt-0.5 text-xs font-semibold text-snow/85">
                {profile.zone}, {profile.city} · ⭐ {profile.rating} · {t("pd.level")}:{" "}
                {t(levelKeyFor(profile.jobsDone))}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => toggleOnline()}
            className={`min-h-12 rounded-pill px-5 py-2.5 text-sm font-extrabold transition-colors ${
              online ? "bg-white text-neem" : "bg-snow/20 text-snow hover:bg-snow/30"
            }`}
          >
            {online ? `● ${t("pd.online")}` : `○ ${t("pd.offline")}`}
          </button>
        </div>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-card bg-snow/15 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-snow/80">{t("pd.todayEarn")}</p>
            <p className="mt-1 text-3xl font-black tabular-nums">₹{today.toLocaleString("en-IN")}</p>
          </div>
          <div className="rounded-card bg-snow/15 p-4">
            <p className="text-xs font-bold uppercase tracking-wider text-snow/80">{t("pd.weekEarn")}</p>
            <p className="mt-1 text-3xl font-black tabular-nums">₹{week.toLocaleString("en-IN")}</p>
          </div>
        </div>
        <p className="mt-3 text-xs font-semibold text-snow/90">
          💰 {t("pd.payoutLine", { amount: payout.toLocaleString("en-IN"), when: t("pd.payoutWhen") })}
        </p>
      </div>

      <div className="flex flex-wrap gap-2 rounded-control bg-chuna p-1" role="tablist" aria-label={t("dash.p")}>
        {TABS.map((x) => (
          <button
            key={x.id}
            type="button"
            role="tab"
            aria-selected={tab === x.id}
            onClick={() => setTab(x.id)}
            className={`min-h-12 flex-1 rounded-control px-3 py-2 text-sm font-extrabold transition-colors ${
            tab === x.id ? "border-saffron bg-saffron text-snow" : "border-line bg-white text-muted hover:text-navy"
            }`}
          >
            <span aria-hidden="true">{x.emoji}</span> {t(x.key)}
          </button>
        ))}
      </div>

      {tab === "work" && <WorkTab profile={profile} />}
      {tab === "leads" && <LeadsDeck profile={profile} />}
      {tab === "earn" && <EarningsTab />}
      {tab === "profile" && <ProfileTab profile={profile} />}
    </div>
  );
}