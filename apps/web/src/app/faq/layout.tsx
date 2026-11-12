/* The FAQ page itself is a client component, and metadata cannot be exported
   from a "use client" file — so its title and description live here. The
   layout renders children untouched: no extra DOM, no styling change. */
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "FAQ",
  description:
    "Straight answers on pricing, partner verification, escrow and timelines — in English, Hindi and Gujarati.",
  alternates: { canonical: "/faq" },
};

export default function FaqLayout({ children }: { children: React.ReactNode }) {
  return children;
}