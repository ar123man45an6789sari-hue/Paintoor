import { CinematicHero, PulseBand } from "@/components/home/HeroMotion";
import { LandingSections } from "@/components/home/LandingSections";
import { SessionGate } from "@/components/home/SessionGate";

/** City landing: the same marketing page with the visitor's city in the URL,
    e.g. paintoor.com/vadodara or paintoor.com/london. The slug is adopted by
    NavSearch on mount and kept in sync with the detected or picked place. */
export default function CityPage() {
  return (
    <>
      <SessionGate />
      <CinematicHero />
      <PulseBand />
      <LandingSections />
    </>
  );
}
