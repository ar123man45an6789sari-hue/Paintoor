/* SessionGate — signed-in users land on their role dashboard, not on the
   marketing page. The landing still prerenders for SEO; the redirect happens
   immediately after mount, so logged-out visitors and crawlers see the story. */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/session";

export function SessionGate() {
  const router = useRouter();

  useEffect(() => {
        /* "View website" on the dashboard sets pt_browse so a signed-in visitor
       can read the marketing pages without logging out. */
    if (getSession() && !window.sessionStorage.getItem("pt_browse")) router.replace("/dashboard");
  }, [router]);

  return null;
}