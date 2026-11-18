/* Customer workspace shell — premium sidebar on desktop, bottom nav on
   mobile, one router for every panel. The home view (CustomerHome) is the
   rich front door; existing panels reuse their components untouched. */
"use client";

import { useEffect, useState } from "react";
import { useI18n } from "@/i18n";
import { Icon, type IconName } from "@/components/Icons";
import type { Session } from "@/lib/session";
import { takeCheckoutIntent } from "@/lib/session";
import { PostBox } from "./PostBox";
import { FindPartnerGrid } from "./FindPartnerGrid";
import { EscrowPanel } from "./EscrowPanel";
import { PaintStore } from "./PaintStore";
import { DocumentsVault } from "./DocumentsVault";
import { JobHistory } from "./JobHistory";
import { CustomerSettings } from "./CustomerSettings";
import { ProfileDrawer } from "./ProfileDrawer";
import { MyJobsBoard } from "./MyJobsBoard";
import { ChatPanel } from "./ChatPanel";
import { CustomerHome } from "./CustomerHome";

export type ViewId = "home" | "jobs" | "chat" | "post" | "find" | "escrow" | "store" | "docs" | "hist" | "settings";

const NAV: { group: string; items: { id: ViewId | "profile"; icon: IconName; label: string }[] }[] = [
  { group: "cd.nav.main", items: [
    { id: "home", icon: "home", label: "cd.nav.home" },
    { id: "jobs", icon: "briefcase", label: "cd.nav.jobs" },
    { id: "chat", icon: "chat", label: "cd.nav.chat" },
  ] },
  { group: "cd.nav.hire", items: [
    { id: "post", icon: "plus", label: "dash.tab.post" },
    { id: "find", icon: "search", label: "dash.tab.find" },
  ] },
  { group: "cd.nav.money", items: [
    { id: "escrow", icon: "wallet", label: "cd.nav.escrow" },
    { id: "store", icon: "store", label: "cd.nav.store" },
  ] },
  { group: "cd.nav.records", items: [
    { id: "docs", icon: "doc", label: "cd.nav.docs" },
    { id: "hist", icon: "history", label: "cd.nav.hist" },
  ] },
  { group: "cd.nav.account", items: [
    { id: "settings", icon: "gear", label: "cd.nav.settings" },
    { id: "profile", icon: "user", label: "cd.drawer.title" },
  ] },
];

/* Mobile keeps the hottest panels one tap away; documents, history and the
   profile drawer stay reachable from the home view and the account group. */
const MOBILE: { id: ViewId; icon: IconName; label: string }[] = [
  { id: "home", icon: "home", label: "cd.m.home" },
  { id: "jobs", icon: "briefcase", label: "cd.m.jobs" },
  { id: "chat", icon: "chat", label: "cd.m.chat" },
  { id: "post", icon: "plus", label: "cd.m.post" },
  { id: "escrow", icon: "wallet", label: "cd.m.escrow" },
  { id: "store", icon: "store", label: "cd.m.store" },
  { id: "settings", icon: "gear", label: "cd.m.settings" },
];

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
     into the post-job wizard; a guest checkout from the marketplace lands
     on the Paint Store; arriving also re-arms the marketing gates. */
  useEffect(() => {
    if (window.sessionStorage.getItem("pt_post_provider")) setView("post");
    else if (takeCheckoutIntent()) setView("store");
    window.sessionStorage.removeItem("pt_browse");
  }, []);

  return (
    <div className="mx-auto w-full max-w-7xl px-3 pb-28 pt-5 md:px-6 lg:pb-8">
      <div className="grid items-start gap-6 lg:grid-cols-[240px_1fr]">
        {/* Sidebar — desktop only */}
        <aside className="sticky top-20 hidden lg:block" aria-label={t("dash.c")}>
          <nav className="rounded-card border border-line bg-white p-3 shadow-card">
            {NAV.map((g) => (
              <div key={g.group}>
                <p className="mt-3 px-3 pb-1 text-[10px] font-black uppercase tracking-[0.16em] text-muted first:mt-0">{t(g.group)}</p>
                {g.items.map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => (item.id === "profile" ? setDrawerOpen(true) : setView(item.id))}
                    aria-current={view === item.id ? "page" : undefined}
                    className={`flex min-h-11 w-full items-center gap-2.5 rounded-control px-3 py-2.5 text-sm font-extrabold transition-colors ${
                      view === item.id ? "bg-saffron text-snow" : "text-muted hover:bg-chuna hover:text-navy"
                    }`}
                  >
                    <Icon name={item.icon} className="h-[18px] w-[18px] shrink-0" />
                    <span className="flex-1 text-left">{t(item.label)}</span>
                  </button>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* Views */}
        <main className="min-w-0">
          {view === "home" && <CustomerHome session={session} go={setView} onProfile={() => setDrawerOpen(true)} />}
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

      {/* Bottom nav — mobile / tablet */}
      <nav
        aria-label={t("dash.c")}
        className="fixed inset-x-0 bottom-0 z-40 flex gap-1 overflow-x-auto border-t border-line bg-white px-2 py-1.5 lg:hidden"
      >
        {MOBILE.map((item) => (
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
          </button>
        ))}
      </nav>

      {drawerOpen && <ProfileDrawer onClose={() => setDrawerOpen(false)} />}
    </div>
  );
}