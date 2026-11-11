/* Paintoor Services — silent/premium editorial page: full-bleed hero,
   hairline service index (each row links to its own explanation page),
   quote band, method, materials spread, then the live BOQ builder + slot
   booking. Imagery lives in /public/services. */
import { ServicesPage } from "@/components/services/ServicesPage";

export const metadata = { title: "Services — Paintoor", description: "Six painting services, one itemised bill. Live per-store material pricing, crew and day estimates, slot booking and ₹0 advance escrow in Vadodara." };

export default function ServicesRoute() {
  return <ServicesPage />;
}