/* Dashboard router-shell v1 — session se role padhta hai aur usi rang ka
   branded shell dikhata hai. Full workspaces: S9 (customer), S10 (provider), S11 (shop). */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useI18n } from "@/i18n";
import { clearSession, getSession } from "@/lib/session";
import type { Session } from "@/lib/session";

const ROLE_STYLE: Record<Session["role"], { grad: string; titleKey: string; emoji: string }> = {
  customer: { grad: "linear-gradient(150deg,#1D6FB8,#123A6B)", titleKey: "dash.c", emoji: "🏠" },
  provider: { grad: "linear-gradient(150deg,#F2762E,#C25A18)", titleKey: "dash.p", emoji: "🔧" },
  shopkeeper: { grad: "linear-gradient(150deg,#0E9F8A,#075E51)", titleKey: "dash.s", emoji: "🏪" },
};

export default function DashboardPage() {
  const { t } = useI18n();
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    const current = getSession();
    if (!current) {
      router.replace("/");
      return;
    }
    setSession(current);
  }, [router]);

  if (!session) return null;
  const style = ROLE_STYLE[session.role];

  return (
    <div className="px-5 py-14">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="rounded-sheet p-8 text-white shadow-card" style={{ background: style.grad }}>
          <div className="text-4xl">{style.emoji}</div>
          <h1 className="mt-3 text-3xl font-black">{t(style.titleKey)}</h1>
          <p className="mt-1 text-white/85">
            {t("dash.hi")}, <b>{session.name || "—"}</b> · {session.mode === "signup" ? t("tab.signup") : t("tab.login")} ✓
          </p>
        </div>

        <div className="rounded-card border border-line bg-white p-6 shadow-card">
          <h2 className="font-extrabold text-navy">{t("st.form")}…</h2>
          <p className="mt-2 text-sm text-muted">{t("dash.next")}</p>
          <button
            type="button"
            onClick={() => {
              clearSession();
              router.replace("/");
            }}
            className="mt-4 rounded-control border-2 border-line px-4 py-2 text-sm font-extrabold text-muted hover:border-danger hover:text-danger"
          >
            {t("dash.logout")}
          </button>
        </div>
      </div>
    </div>
  );
}