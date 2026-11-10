/* Paintoor Services — verified painting crews with a live, transparent bill:
   labour rates + store-priced materials in one escrow-backed cart. */
import { Suspense } from "react";
import { ServiceBrowser } from "@/components/services/ServiceBrowser";

export const metadata = { title: "Services — Paintoor", description: "Book verified painting crews in Vadodara. See the full bill first: live store prices for materials, per-sq-ft labour rates and ₹0 advance." };

export default function ServicesPage() {
  return (
    <Suspense fallback={null}>
      <ServiceBrowser />
    </Suspense>
  );
}