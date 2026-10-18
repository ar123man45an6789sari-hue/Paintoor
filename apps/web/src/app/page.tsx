import { CinematicHero, PulseBand } from "@/components/home/HeroMotion";
import { LandingSections } from "@/components/home/LandingSections";

/**
 * Marketing landing. Hero and pulse stay server-friendly; all scroll-driven
 * sections live in LandingSections (client) so SEO text still prerenders.
 */
export default function HomePage() {
  return (
    <>
      <CinematicHero />
      <PulseBand />
      <LandingSections />
    </>
  );
}