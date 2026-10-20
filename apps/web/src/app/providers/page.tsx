import { ProvidersBrowser } from "@/components/providers/ProvidersBrowser";

/** Thin server shell; all visible copy lives in the client component so it
 *  follows the selected language (single-language mandate). */
export default function ProvidersPage() {
  return (
      <div className="px-4 py-14 md:px-6">
      <div className="mx-auto max-w-6xl">
        <ProvidersBrowser />
      </div>
    </div>
  );
}