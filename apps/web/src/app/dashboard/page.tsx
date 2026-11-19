/* Dashboard — role-branded shells. The customer workspace (sidebar +
   panels) lives in components/customer/CustomerWorkspace and grows one
   panel per delivered step; the partner workspace (sidebar + views) lives
   in components/provider/PartnerWorkspace; the shopkeeper workspace (store
   sidebar + views) lives in components/shopkeeper/ShopWorkspace. Logout
   lives in the site header. */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getSession, onSessionChange } from "@/lib/session";
import type { Session } from "@/lib/session";
import { CustomerWorkspace } from "@/components/customer/CustomerWorkspace";
import { PartnerWorkspace } from "@/components/provider/PartnerWorkspace";
import { ShopWorkspace } from "@/components/shopkeeper/ShopWorkspace";

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

  /* The partner workspace brings its own shell, sidebar and bottom nav, so it
     renders edge-to-edge like the customer workspace. */
  if (session.role === "provider") return <PartnerWorkspace name={session.name} signup={session.data} />;

  /* The shopkeeper workspace also brings its own shell, sidebar and bottom
     nav, so it renders edge-to-edge like the other two. */
  if (session.role === "shopkeeper") return <ShopWorkspace name={session.name} signup={session.data} />;

  return null;
}