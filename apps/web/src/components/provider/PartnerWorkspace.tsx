/* PartnerWorkspace — the worker's premium shell: grouped sidebar on desktop,
   scrollable bottom nav on mobile, a Level card and one router for every
   view. Replaces ProviderShell; earnings and profile reuse their existing
   tabs until the design pass reaches them. */
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon, type IconName } from "@/components/Icons";
import { getProviderProfile, isLeadMatch, levelKeyFor } from "@/lib/providers";
import type { ProviderProfile } from "@/lib/providers";
import { getRequests, onRequestsChange } from "@/lib/requests";
import { PartnerDash } from "./PartnerDash";
import { JobsView } from "./JobsView";
import { PostboxView } from "./PostboxView";
import { QuotesView } from "./QuotesView";
import { ChatHub } from "./ChatHub";
import { PartnerStore } from "./PartnerStore";
import { EarningsTab } from "./EarningsTab";
import { ProfileTab } from "./ProfileTab";

type View = "dash" | "jobs" | "postbox" | "quotes" | "chat" | "earn" | "store" | "profile";

const NAV: { group: string; items: { id: View; icon: IconName; label: string }[] }[] = [
  { group: "pw.nav.main", items: [
    { id: "dash", icon: "home", label: "pw.v.dash" },
    { id: "jobs", icon: "briefcase", label: "pw.v.jobs" },
    { id: "chat", icon: "chat", label: "pw.v.chat" },
  ] },
  { group: "pw.nav.work", items: [
    { id: "postbox", icon: "box", label: "pw.v.postbox" },
    { id: "quotes", icon: "receipt", label: "pw.v.quotes" },
  ] },
  { group: "pw.nav.money", items: [
    { id: "earn", icon: "wallet", label: "pw.v.earn" },
    { id: "store", icon: "store", label: "pw.v.store" },
  ] },
  { group: "pw.nav.account", items: [
    { id: "profile", icon: "user", label: "pw.v.profile" },
  ] },
];

/* Mobile keeps the hottest views one tap away; the rest live behind the
   dashboard's own links (same destinations, fewer thumb targets). */
const MOBILE: { id: View; icon: IconName; label: string }[] = [
  { id: "dash", icon: "home", label: "pw.m.dash" },
  { id: "jobs", icon: "briefcase", label: "pw.m.jobs" },
  { id: "postbox", icon: "box", label: "pw.m.postbox" },
  { id: "chat", icon: "chat", label: "pw.m.chat" },
  { id: "earn", icon: "wallet", label: "pw.m.earn" },
  { id: "store", icon: "store", label: "pw.m.store" },
  { id: "profile", icon: "user", label: "pw.m.profile" },
];

/** Skill-Passport ladder — same thresholds as levelKeyFor. */
const LADDER = [
  { min: 0, next: 50, key: "lv.verified" },
  { min: 50, next: 150, key: "lv.pro" },
  { min: 150, next: 300, key: "lv.expert" },
  { min: 300, next: 500, key: "lv.master" },
  { min: 500, next: 500, key: "" },
];

export function PartnerWorkspace({ name, signup }: { name: string; signup?: Record<string, string> }) {
  const { t } = useI18n();
  const profile = useMemo(() => getProviderProfile(name, signup), [name, signup]);
  const [view, setView] = useState<View>("dash");
  const [chatId, setChatId] = useState<string | null>(null);
  const [leadCount, setLeadCount] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const reload = useCallback(() => {
    setLeadCount(getRequests().filter((r) => r.status === "open" && isLeadMatch(profile, r)).length);
  }, [profile]);

  useEffect(() => {
    reload();
    return onRequestsChange(reload);
  }, [reload]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), 2600);
    return () => window.clearTimeout(id);
  }, [toast]);

  const onMessage = useCallback((requestId: string) => {
    setChatId(requestId);
    setView("chat");
  }, []);

  const rung = LADDER.find((l) => profile.jobsDone >= l.min && profile.jobsDone < l.next) ?? LADDER[LADDER.length - 1];
  const ladderPct = rung.key ? Math.min(100, Math.round((profile.jobsDone / rung.next) * 100)) : 100;

  const badgeFor = (id: View): number =>
    id === "postbox" ? leadCount : 0;

  return (
    <div className="mx-auto w-full max-w-7xl px-3 pb-28 pt-5 md:px-6 lg:pb-8">
      <div className="grid items-start gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar — desktop only */}
        <aside className="sticky top-20 hidden lg:block" aria-label={t("dash.p")}>
          <nav className="rounded-card border border-line bg-white p-3 shadow-card">
            {NAV.map((g) => (
              <div key={g.group}>
                <p className="mt-3 px-3 pb-1 text-[10px] font-black uppercase tracking-[0.16em] text-muted first:mt-0">{t(g.group)}</p>
                {g.items.map((item) => {
                  const badge = badgeFor(item.id);
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setView(item.id)}
                      aria-current={view === item.id ? "page" : undefined}
                      className={`flex min-h-11 w-full items-center gap-2.5 rounded-control px-3 py-2.5 text-sm font-extrabold transition-colors ${
                        view === item.id ? "bg-saffron text-snow" : "text-muted hover:bg-chuna hover:text-navy"
                      }`}
                    >
                      <Icon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                      <span className="flex-1 text-left">{t(item.label)}</span>
                      {badge > 0 && (
                        <span className={`rounded-pill px-2 py-0.5 text-[10px] font-black ${view === item.id ? "bg-snow/25 text-snow" : "bg-saffron/15 text-saffron"}`}>{badge}</span>
                      )}
                    </button>
                  );
                })}
              </div>
            ))}
          </nav>

          <div className="mt-4 rounded-card border border-line bg-white p-4 shadow-card">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-muted">{t("pw.level.h")}</p>
            <p className="mt-1 text-xl font-black text-navy">{t(levelKeyFor(profile.jobsDone))}</p>
            <p className="text-xs font-bold text-muted">{t("pw.level.stats", { jobs: profile.jobsDone, rating: profile.rating })}</p>
            <div className="mt-2 h-2 overflow-hidden rounded-pill bg-chuna">
              <div className="h-full rounded-pill bg-saffron transition-all duration-500" style={{ width: `${ladderPct}%` }} />
            </div>
            <p className="mt-2 text-[11px] font-extrabold text-saffron">
              {rung.key ? t("pw.level.next", { n: rung.next - profile.jobsDone, level: t(rung.key) }) : t("pw.level.done")}
            </p>
          </div>
        </aside>

        {/* Views */}
        <main className="min-w-0">
          {view === "dash" && <PartnerDash profile={profile} onGo={setView} onMessage={onMessage} onToast={setToast} />}
          {view === "jobs" && <JobsView profile={profile} onMessage={onMessage} onToast={setToast} />}
          {view === "postbox" && <PostboxView profile={profile} onMessage={onMessage} onToast={setToast} />}
          {view === "quotes" && <QuotesView profile={profile} onOpenJobs={() => setView("jobs")} />}
          {view === "chat" && <ChatHub profile={profile} initialId={chatId} />}
          {view === "earn" && <EarningsTab />}
          {view === "store" && <PartnerStore profile={profile} />}
          {view === "profile" && <ProfileTab profile={profile} />}
        </main>
      </div>

      {/* Bottom nav — mobile / tablet */}
      <nav
        aria-label={t("dash.p")}
        className="fixed inset-x-0 bottom-0 z-40 flex gap-1 overflow-x-auto border-t border-line bg-white px-2 py-1.5 lg:hidden"
      >
        {MOBILE.map((item) => {
          const badge = badgeFor(item.id);
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => setView(item.id)}
              aria-current={view === item.id ? "page" : undefined}
              className={`relative flex min-h-14 min-w-[64px] flex-1 flex-col items-center justify-center gap-0.5 rounded-control px-2 py-1 text-[10px] font-extrabold transition-colors ${
                view === item.id ? "bg-saffron/10 text-saffron" : "text-muted"
              }`}
            >
              <Icon name={item.icon} className="h-5 w-5" />
              {t(item.label)}
              {badge > 0 && <span className="absolute right-2 top-1.5 rounded-pill bg-saffron px-1.5 text-[9px] font-black text-snow">{badge}</span>}
            </button>
          );
        })}
      </nav>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-toast w-[min(92vw,420px)] -translate-x-1/2 rounded-control bg-navy px-4 py-3 text-center text-sm font-bold text-snow shadow-lift lg:bottom-6">
          {toast}
        </div>
      )}
    </div>
  );
}