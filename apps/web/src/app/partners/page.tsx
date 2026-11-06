import type { Metadata } from "next";
import { Suspense } from "react";
import { ProvidersBrowser } from "@/components/providers/ProvidersBrowser";

export const metadata: Metadata = {
  title: "Partner Bazaar — hire verified painters",
  description:
    "Browse KYC-verified painters and home-service partners across India. Filter by city, area and skill, compare honest rates and shortlist your favourites.",
  alternates: { canonical: "/partners" },
};

/** Thin server shell; Suspense is required because this page reads useSearchParams. */
export default function PartnersPage() {
  return (
    <div className="px-4 py-14 md:px-6">
      <div className="mx-auto max-w-6xl">
        <Suspense fallback={null}>
          <ProvidersBrowser />
        </Suspense>
      </div>
    </div>
  );
}