import { Suspense } from "react";
import { ProvidersBrowser } from "@/components/providers/ProvidersBrowser";

/** Thin server shell; Suspense chahiye kyunki browser useSearchParams padhta hai. */
export default function ProvidersPage() {
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