/* Dashboard v4 — role-branded shells. Customer keeps the welcome banner (it is
   the page H1); provider and shopkeeper shells carry their own headers, so the
   generic banner is gone (single H1, less dead space). Logout lives in header. */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n";
import { getSession, onSessionChange } from "@/lib/session";
import type { Session } from "@/lib/session";
import { ProvidersBrowser } from "@/components/providers/ProvidersBrowser";
import { PostJobWizard } from "@/components/customer/PostJobWizard";
import { RequestsList } from "@/components/customer/RequestsList";
import { ProviderShell } from "@/components/provider/ProviderShell";
import { ShopShell } from "@/components/shopkeeper/ShopShell";

const ROLE_STYLE: Record<Session["role"], { grad: string; titleKey: string; emoji: string }> = {
  customer: { grad: "linear-gradient(150deg,#1D6FB8,#123A6B)", titleKey: "dash.c", emoji: "🏠" },
  provider: { grad: "linear-gradient(150deg,#F2762E,#C25A18)", titleKey: "dash.p", emoji: "🔧" },
  shopkeeper: { grad: "linear-gradient(150deg,#0E9F8A,#075E51)", titleKey: "dash.s", emoji: "🏪" },
};

type Tab = "over" | "find" | "post" | "req";

export default function DashboardPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);
  const [tab, setTab] = useState<Tab>("over");

  useEffect(() => {
    const current = getSession();
    if (!current) {
      router.replace("/");
      return;
    }
    setSession(current);
    return onSessionChange(() => {
      if (!getSession()) router.replace("/");
    });
  }, [router]);

  if (!session) return null;
  const style = ROLE_STYLE[session.role];

  const tabs: { id: Tab; key: string }[] = [
    { id: "over", key: "dash.tab.over" },
    { id: "find", key: "dash.tab.find" },
    { id: "post", key: "dash.tab.post" },
    { id: "req", key: "dash.tab.req" },
  ];

  return (
    <div className="px-4 py-14 md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {session.role === "customer" && (
          <div className="rounded-sheet p-8 text-white shadow-card" style={{ background: style.grad }}>
            <div className="text-4xl">{style.emoji}</div>
            <h1 className="mt-3 text-3xl font-black">{t(style.titleKey)}</h1>
            <p className="mt-1 text-white/85">
              {t("dash.hi")}, <b>{session.name || t("dash.friend")}</b>
            </p>
          </div>
        )}

        {session.role === "customer" ? (
          <>
            <div className="flex flex-wrap gap-2 rounded-control bg-chuna p-1">
              {tabs.map((x) => (
                <button
                  key={x.id}
                  type="button"
                  onClick={() => setTab(x.id)}
                  className={`flex-1 rounded-control border px-3 py-2 text-sm font-extrabold transition-colors ${
                    tab === x.id ? "border-navy bg-navy text-white" : "border-line bg-white text-muted hover:text-navy"
                  }`}
                >
                  {t(x.key)}
                </button>
              ))}
            </div>

            {tab === "over" && (
              <div className="grid gap-4 md:grid-cols-3">
                <button type="button" onClick={() => setTab("post")} className="rounded-card border border-line bg-white p-6 text-left shadow-card transition-all hover:-translate-y-1 hover:shadow-lift">
                  <div className="text-2xl">📝</div>
                  <h3 className="mt-2 font-extrabold text-navy">{t("dash.tab.post")}</h3>
                </button>
                <button type="button" onClick={() => setTab("find")} className="rounded-card border border-line bg-white p-6 text-left shadow-card transition-all hover:-translate-y-1 hover:shadow-lift">
                  <div className="text-2xl">🔍</div>
                  <h3 className="mt-2 font-extrabold text-navy">{t("dash.tab.find")}</h3>
                </button>
                <button type="button" onClick={() => setTab("req")} className="rounded-card border border-line bg-white p-6 text-left shadow-card transition-all hover:-translate-y-1 hover:shadow-lift">
                  <div className="text-2xl">📋</div>
                  <h3 className="mt-2 font-extrabold text-navy">{t("req.mine")}</h3>
                </button>
              </div>
            )}
            {tab === "find" && <ProvidersBrowser />}
            {tab === "post" && <PostJobWizard onDone={() => setTab("req")} />}
            {tab === "req" && <RequestsList onPost={() => setTab("post")} />}
          </>
        ) : session.role === "provider" ? (
          <ProviderShell name={session.name} />
        ) : session.role === "shopkeeper" ? (
          <ShopShell name={session.name} />
        ) : null}
      </div>
    </div>
  );
}