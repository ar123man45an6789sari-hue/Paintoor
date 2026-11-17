/* Customer workspace shell — box-grid navigation + view routing.

   The old sidebar and mobile chip scroller are gone. Home is the assembly
   point: the hero card on top, then every panel as a described box in a
   two-up grid (single column on mobile), each with a big icon, a one-line
   "when to open this" description and a forward arrow. Sub-views carry a
   back button in the corner; the header's "Customer - Dashboard" pill also
   returns here because it reloads the route. Existing panels are reused
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

/* The ten boxes: nine panels plus the profile drawer. Titles reuse the
   existing nav keys; descriptions live under cd.box.* so every language
   explains the panel the same way. */
const BOXES: { v: ViewId | "profile"; icon: IconName; label: string; desc: string }[] = [
  { v: "jobs", icon: "briefcase", label: "cd.nav.jobs", desc: "cd.box.jobs" },
  { v: "chat", icon: "chat", label: "cd.nav.chat", desc: "cd.box.chat" },
  { v: "post", icon: "plus", label: "dash.tab.post", desc: "cd.box.post" },
  { v: "find", icon: "search", label: "dash.tab.find", desc: "cd.box.find" },
  { v: "escrow", icon: "wallet", label: "cd.nav.escrow", desc: "cd.box.escrow" },
  { v: "store", icon: "store", label: "cd.nav.store", desc: "cd.box.store" },
  { v: "docs", icon: "doc", label: "cd.nav.docs", desc: "cd.box.docs" },
  { v: "hist", icon: "history", label: "cd.nav.hist", desc: "cd.box.hist" },
  { v: "settings", icon: "gear", label: "cd.nav.settings", desc: "cd.box.settings" },
  { v: "profile", icon: "user", label: "cd.drawer.title", desc: "cd.box.profile" },
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

      {/* The assembly: every panel as a described box, two per row on
          laptops, one per row on phones. */}
      <div className="grid gap-4 sm:grid-cols-2">
        {BOXES.map((b) => (
          <button
            key={b.v}
            type="button"
            onClick={() => (b.v === "profile" ? onProfile() : go(b.v))}
            className="group flex items-start gap-4 rounded-card border border-line bg-white p-5 text-left shadow-card transition-all hover:-translate-y-0.5 hover:shadow-lift"
          >
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-control bg-saffron/10">
              <Icon name={b.icon} className="h-7 w-7 text-saffron" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="truncate text-base font-black text-navy">{t(b.label)}</span>
                <Icon
                  name="arrowRight"
                  className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-0.5 group-hover:text-saffron"
                />
              </span>
              <span className="mt-1 block text-xs font-bold leading-relaxed text-muted">{t(b.desc)}</span>
            </span>
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
     into the post-job wizard; a guest checkout from the marketplace lands
     on the Paint Store; arriving also re-arms the marketing gates. */
  useEffect(() => {
    if (window.sessionStorage.getItem("pt_post_provider")) setView("post");
    else if (takeCheckoutIntent()) setView("store");
    window.sessionStorage.removeItem("pt_browse");
  }, []);

  return (
    <div className="px-4 py-10 md:px-6">
      <div className="mx-auto max-w-6xl">
        <main className="min-w-0">
          {view !== "home" && (
            <button
              type="button"
              onClick={() => setView("home")}
              className="mb-4 flex items-center gap-1.5 rounded-control border border-line bg-white px-3 py-1.5 text-xs font-extrabold text-navy transition-colors hover:border-saffron hover:text-saffron"
            >
              <Icon name="arrowLeft" className="h-3.5 w-3.5" />
              {t("cd.back")}
            </button>
          )}

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