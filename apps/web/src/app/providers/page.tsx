import type { Metadata } from "next";
import { ProvidersBrowser } from "@/components/providers/ProvidersBrowser";

export const metadata: Metadata = {
  title: "Find verified workers · GharSahayak",
};

export default function ProvidersPage() {
  return (
    <div className="px-5 py-14">
      <div className="mx-auto max-w-6xl">
        <span className="text-xs font-extrabold uppercase tracking-[0.18em] text-saffron">Marketplace</span>
        <h1 className="mt-2 text-4xl font-black text-navy">Find verified workers near you</h1>
        <p className="mt-3 max-w-2xl text-muted">
          Pick a location to see who is available there — or keep “All locations” to see
          everyone on the platform. Ratings, rates and badges come from verified jobs only.
        </p>
        <div className="mt-8">
          <ProvidersBrowser />
        </div>
      </div>
    </div>
  );
}