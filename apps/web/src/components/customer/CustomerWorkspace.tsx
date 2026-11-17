/* Customer workspace shell — sidebar navigation + view routing.

   The sidebar lists only the panels that exist so far and grows one item
   per delivered step (full 5-group / 10-item navigation lands with the
   settings step). On mobile the same items render as a horizontal chip
   scroller. The home view carries the hero (global cover, avatar with
   initials fallback, time-based greeting) and opens the profile drawer.
   Existing panels (post-job wizard, partner browser, requests) are reused
   untouched. */
"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon, type IconName } from "@/components/Icons";
import type { Session } from "@/lib/session";
import { SEED_JOB } from "@/lib/jobs";
import { initialsOf, useProfile } from "@/lib/profile";
import { PostBox } from "@/components/customer/PostBox";
import { FindPartnerGrid } from "@/components/customer/FindPartnerGrid";
import { EscrowPanel } from "@/components/customer/EscrowPanel";
import { PaintStore } from "@/components/customer/PaintStore";
import { DocumentsVault } from "@/components/customer/DocumentsVault";
import { JobHistory } from "@/components/customer/JobHistory";
import { CustomerSettings } from "@/components/customer/CustomerSettings";
import { ProfileDrawer } from "@/components/customer/ProfileDrawer";
import { MyJobsBoard } from "@/components/customer/MyJobsBoard";
import { ChatPanel } from "@/components/customer/ChatPanel";
import { takeCheckoutIntent } from "@/lib/session";

export type ViewId = "home" | "jobs" | "chat" | "post" | "find" | "escrow" | "store" | "docs" | "hist" | "settings";
const NAV: { id: ViewId; icon: IconName; label: string; group: string }[] = [
  { id: "home", icon: "home", label: "cd.nav.home", group: "cd.nav.main" },
  { id: "jobs", icon: "briefcase", label: "cd.nav.jobs", group: "cd.nav.main" },
{ id: "chat", icon: "chat", label: "cd.nav.chat", group: "cd.nav.main" },
  { id: "post", icon: "plus", label: "dash.tab.post", group: "cd.nav.hire" },
  { id: "find", icon: "search", label: "dash.tab.find", group: "cd.nav.hire" },
  { id: "escrow", icon: "wallet", label: "cd.nav.escrow", group: "cd.nav.money" },
  { id: "store", icon: "store", label: "cd.nav.store", group: "cd.nav.money" },
  { id: "docs", icon: "doc", label: "cd.nav.docs", group: "cd.nav.records" },
  { id: "hist", icon: "history", label: "cd.nav.hist", group: "cd.nav.records" },
  { id: "settings", icon: "gear", label: "cd.nav.settings", group: "cd.nav.account" },
];

const GRAD = "linear-gradient(135deg,#E00048,#A80036)";

/** Spec greeting windows: night / morning / afternoon / evening / night. */
function greetingKey(d: Date): string {
  const h = d.getHours();
  if (h < 5) return "cd.greet.night";
  if (h < 12) return "cd.greet.morning";
  if (h < 17) return "cd.greet.afternoon";
  if (h < 21) return "cd.greet.evening";
  return "cd.greet.night";
}

function HomeView({
  session,
  go,
  onProfile,
}: {
  session: Session;
  go: (v: ViewId) => void;
  onProfile: () => void;
}) {
  const { t } = useI18n();
  const [profile] = useProfile();
  /* Null until the client mounts so server and client first renders match;
     refreshed every minute afterwards. */
  const [now, setNow] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () => setNow(new Date());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  const first = (session.name || "").split(" ")[0] || t("dash.friend");
  const cards: { v: ViewId; icon: IconName; label: string }[] = [
    { v: "post", icon: "note", label: t("dash.tab.post") },
    { v: "find", icon: "search", label: t("dash.tab.find") },
    { v: "jobs", icon: "briefcase", label: t("cd.nav.jobs") },
  ];

  return (
    <div className="space-y-6">
      {/* Hero: global cover (set by Paintoor) + customer-controlled avatar */}
      <section className="relative overflow-hidden rounded-sheet border border-line shadow-card">
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(135deg, rgba(224,0,72,0.94), rgba(168,0,54,0.90)), url('/jobs/cover-default.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        />
        <div className="relative flex flex-wrap items-center gap-5 p-6 text-snow md:p-8">
          <button
            type="button"
            onClick={onProfile}
            aria-label={t("cd.drawer.open")}
            className="h-[92px] w-[92px] shrink-0 overflow-hidden rounded-pill border-4 border-snow/70 shadow-card transition-transform hover:scale-[1.03]"
            style={{ background: GRAD }}
          >
            {profile.photo ? (
              /* eslint-disable-next-line @next/next/no-img-element -- user upload, data URL */
              <img src={profile.photo} alt={profile.name} className="h-full w-full object-cover" />
            ) : (
              <span className="flex h-full w-full items-center justify-center text-3xl font-black text-snow">
                {initialsOf(profile.name)}
              </span>
            )}
          </button>
          <div className="min-w-0">
            <p className="text-sm font-bold text-snow/85">
              {now ? `${t(greetingKey(now))}, ${first}` : "\u00A0"}
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-[-0.02em] md:text-3xl">
              {t("cd.home.h1", { name: first, n: SEED_JOB.crews.length })}
            </h1>
          </div>
        </div>
        <span className="absolute bottom-2 right-3 text-[10px] font-extrabold uppercase tracking-[0.14em] text-snow/70">
          {t("cd.hero.cover")}
        </span>
      </section>

      <div className="grid gap-5 md:grid-cols-3">
        {cards.map((c) => (
          <button
            key={c.v}
            type="button"
            onClick={() => go(c.v)}
            className="rounded-card border border-line bg-white p-6 text-left shadow-card transition-all hover:-translate-y-1 hover:shadow-lift"
          >
            <Icon name={c.icon} className="h-6 w-6 text-saffron" />
            <span className="mt-2 block font-extrabold text-navy">{c.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

export function CustomerWorkspace({ session }: { session: Session }) {
  const { t } = useI18n();
  const [view, setView] = useState<ViewId>("home");
  /* Chat deep-link target set by the jobs board (message / call / video). */
  const [chatTarget, setChatTarget] = useState<{ crewId: string; mode: "chat" | "call" | "video" } | null>(null);
  const openChat = (crewId: string, mode: "chat" | "call" | "video") => {
    setChatTarget({ crewId, mode });
    setView("chat");
  };
  const [drawerOpen, setDrawerOpen] = useState(false);

  /* The partner shelf's "Hire" button drops a logged-in customer straight
     into the post-job wizard; arriving also re-arms the marketing gates. */
  useEffect(() => {
    if (window.sessionStorage.getItem("pt_post_provider")) setView("post");
    else if (takeCheckoutIntent()) setView("store");
    window.sessionStorage.removeItem("pt_browse");
  }, []);

  const groups = [...new Set(NAV.map((n) => n.group))];

  return (
    <div className="px-4 py-10 md:px-6">
      <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-[210px_minmax(0,1fr)]">
        <aside className="hidden md:block">
          <nav className="space-y-5" aria-label={t("dash.c")}>
            {groups.map((g) => (
              <div key={g}>
                <p className="px-3 text-[11px] font-extrabold uppercase tracking-[0.14em] text-saffron">{t(g)}</p>
                <div className="mt-1 space-y-1">
                  {NAV.filter((n) => n.group === g).map((n) => (
                    <button
                      key={n.id}
                      type="button"
                      onClick={() => setView(n.id)}
                      aria-current={view === n.id ? "page" : undefined}
                      className={`flex w-full items-center gap-2 rounded-control px-3 py-2 text-sm font-extrabold transition-colors ${
                        view === n.id ? "text-snow" : "text-muted hover:bg-chuna hover:text-navy"
                      }`}
                      style={view === n.id ? { background: GRAD } : undefined}
                    >
                      <Icon name={n.icon} className="h-4 w-4 shrink-0" />
                      <span className="truncate">{t(n.label)}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        <div className="flex gap-2 overflow-x-auto pb-1 md:hidden">
          {NAV.map((n) => (
            <button
              key={n.id}
              type="button"
              onClick={() => setView(n.id)}
              aria-current={view === n.id ? "page" : undefined}
              className={`shrink-0 rounded-control border px-3 py-1.5 text-xs font-extrabold transition-colors ${
                view === n.id ? "border-saffron bg-saffron text-snow" : "border-line bg-white text-muted"
              }`}
            >
              {t(n.label)}
            </button>
          ))}
        </div>

        <main className="min-w-0">
          {view === "home" && (
            <HomeView session={session} go={setView} onProfile={() => setDrawerOpen(true)} />
          )}

          {view === "jobs" && <MyJobsBoard onOpenChat={openChat} />}
          {view === "chat" && (
            <ChatPanel
              key={chatTarget ? `${chatTarget.crewId}:${chatTarget.mode}` : "list"}
              initialCrew={chatTarget?.crewId ?? null}
              callMode={chatTarget && chatTarget.mode !== "chat" ? chatTarget.mode : null}
            />
          )}
           {view === "post" && <PostBox />}
           {view === "find" && <FindPartnerGrid onHire={() => setView("post")} />}
            {view === "escrow" && <EscrowPanel />}
            {view === "store" && <PaintStore session={session} />}
            {view === "docs" && <DocumentsVault />}
            {view === "hist" && <JobHistory />}
          {view === "settings" && (
            <CustomerSettings onProfile={() => setDrawerOpen(true)} onEscrow={() => setView("escrow")} />
          )}

        </main>
      </div>

      {drawerOpen && <ProfileDrawer onClose={() => setDrawerOpen(false)} />}
    </div>
  );
}