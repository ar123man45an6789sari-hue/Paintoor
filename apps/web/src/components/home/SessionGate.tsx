/* SessionGate v1 — signed-in users land on their role dashboard, not on the
   marketing page. The landing still prerenders for SEO; the redirect happens
   immediately after mount, so logged-out visitors and crawlers see the story. */
"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSession } from "@/lib/session";

export function SessionGate() {
  const router = useRouter();

  useEffect(() => {
    if (getSession()) router.replace("/dashboard");
  }, [router]);

  return null;
}