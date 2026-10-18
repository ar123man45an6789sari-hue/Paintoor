import { CinematicHero, PulseBand } from "@/components/home/HeroMotion";

/**
 * Marketing shell. The cinematic hero and pulse band live in HeroMotion
 * (client component) so this page stays a server component for SEO.
 */
export default function HomePage() {
  return (
    <>
      <CinematicHero />
      <PulseBand />

      <section id="get-started" className="px-5 py-20">
        <div className="mx-auto grid max-w-6xl gap-5 md:grid-cols-3">
          <div className="rounded-card border border-line bg-white p-6 shadow-card">
            <h2 className="text-lg font-extrabold text-navy">🏠 I need work done</h2>
            <p className="mt-2 text-sm text-muted">
              Verified workers, comparison, safe pay, warranty. Simple enough for anyone.
            </p>
          </div>
          <div className="rounded-card border border-line bg-white p-6 shadow-card">
            <h2 className="text-lg font-extrabold text-navy">🔧 I do the work</h2>
            <p className="mt-2 text-sm text-muted">
              Daily leads, fair prices, on-time payouts, and your own Skill Passport.
            </p>
          </div>
          <div className="rounded-card border border-line bg-white p-6 shadow-card">
            <h2 className="text-lg font-extrabold text-navy">🏪 I run a store</h2>
            <p className="mt-2 text-sm text-muted">
              Paint, hardware, sanitary — your catalog online, orders at the counter.
            </p>
          </div>
        </div>
      </section>
    </>
  );
}