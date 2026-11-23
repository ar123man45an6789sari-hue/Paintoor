/* SiteChrome — the marketing frame (header + footer). The admin control
   room at /admin is a standalone surface: it owns the whole browser frame,
   so the site header (with its city pill and nav links) and the footer
   never render there. Everything else keeps the usual frame. */
"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { Header } from "./Header";
import { Footer } from "./Footer";

export function SiteChrome({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  if (pathname === "/admin") return <main>{children}</main>;
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}