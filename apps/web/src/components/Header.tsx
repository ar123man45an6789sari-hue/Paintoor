"use client";

import { useState } from "react";
import Link from "next/link";
import { Logo } from "./Logo";
import { AuthModal } from "./auth/AuthModal";

const NAV = [
  { href: "/providers", label: "Find workers" },
  { href: "#services", label: "Services" },
  { href: "#rate-radar", label: "Rate Radar" },
];

/** Single entry point: the modal itself offers Log in / Create account (owner spec). */
export function Header() {
  const [authOpen, setAuthOpen] = useState(false);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line/60 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
          <Link href="/" className="flex items-center gap-2.5 text-navy">
            <Logo className="h-8 w-8" />
            <span className="text-xl font-black tracking-tight">
              Ghar<span className="text-saffron">Sahayak</span>
            </span>
          </Link>

          <nav className="ml-auto hidden items-center gap-6 md:flex" aria-label="Primary">
             {NAV.map((item) =>
            item.href.startsWith("/") ? (
              <Link key={item.href} href={item.href} className="text-sm font-semibold text-muted transition-colors hover:text-navy">
                {item.label}
              </Link>
            ) : (
              <a key={item.href} href={item.href} className="text-sm font-semibold text-muted transition-colors hover:text-navy">
                {item.label}
              </a>
            ),
          )}
          </nav>

          <span className="ml-auto rounded-pill border border-line bg-chuna px-3 py-1.5 text-xs font-bold text-navy md:ml-4">
            📍 Vadodara
          </span>
          <button
            type="button"
            onClick={() => setAuthOpen(true)}
            className="rounded-control bg-saffron px-4 py-2 text-sm font-extrabold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lift"
          >
            Sign in / Sign up
          </button>
        </div>
      </header>

      <AuthModal open={authOpen} initialMode="signup" onClose={() => setAuthOpen(false)} />
    </>
  );
}