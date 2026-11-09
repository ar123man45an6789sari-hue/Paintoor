/* Paintoor Marketplace — digital paint shop: search, filter, compare store
   prices, size a room's kit and add everything to one escrow-backed cart.
   Showcase-only: all data lives in @/lib/marketplace. */
import { Suspense } from "react";
import { MarketplaceBrowser } from "@/components/marketplace/MarketplaceBrowser";

export const metadata = { title: "Marketplace — Paintoor", description: "Buy paint & supplies from verified neighbourhood stores. Compare prices, check stock near you and pay only after delivery." };

export default function MarketplacePage() {
  return (
    <Suspense fallback={null}>
      <MarketplaceBrowser />
    </Suspense>
  );
}