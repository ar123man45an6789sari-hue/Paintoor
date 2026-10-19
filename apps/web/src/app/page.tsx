import { CinematicHero, PulseBand } from "@/components/home/HeroMotion";
import { LandingSections } from "@/components/home/LandingSections";
import { SessionGate } from "@/components/home/SessionGate";

/**
 * Marketing landing. Hero and pulse stay server-friendly; all scroll-driven
 * sections live in LandingSections (client) so SEO text still prerenders.
 * Signed-in visitors are handed straight to their role dashboard.
 */
export default function HomePage() {
  return (
    <>
      <SessionGate />
      <CinematicHero />
      <PulseBand />
      <LandingSections />
    </>
  );
}