/* Dashboard — role-branded shells. The customer workspace (sidebar +
   panels) lives in components/customer/CustomerWorkspace and grows one
   panel per delivered step; provider and shopkeeper keep their existing
   shells untouched. Logout lives in the site header. */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, onSessionChange } from "@/lib/session";
import type { Session } from "@/lib/session";
import { CustomerWorkspace } from "@/components/customer/CustomerWorkspace";
import { ProviderShell } from "@/components/provider/ProviderShell";
import { ShopShell } from "@/components/shopkeeper/ShopShell";

export default function DashboardPage() {
  const router = useRouter();
  const [session, setSession] = useState<Session | null>(null);

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

  if (session.role === "customer") return <CustomerWorkspace session={session} />;

  return (
    <div className="px-4 py-14 md:px-6">
      <div className="mx-auto max-w-6xl space-y-6">
        {session.role === "provider" ? (
          <ProviderShell name={session.name} signup={session.data} />
        ) : session.role === "shopkeeper" ? (
          <ShopShell name={session.name} signup={session.data} />
        ) : null}
      </div>
    </div>
  );
}