/**
 * Day-1 application shell. The cinematic landing from prototype v0.2 is
 * ported into this route in a later lesson; today the shell proves that
 * tokens, fonts and the build pipeline all work end to end.
 */
export default function HomePage() {
  return (
    <>
      <section className="bg-navy px-5 py-24 text-white">
        <div className="mx-auto max-w-6xl">
          <span className="rounded-pill border border-white/25 bg-white/10 px-3 py-1.5 text-xs font-bold text-blue-100">
            🇮 Now live in Vadodara · 240+ verified workers
          </span>
          <h1 className="mt-6 max-w-3xl text-4xl font-black leading-tight md:text-6xl">
            Every home job, <span className="text-haldi">done with trust.</span>
          </h1>
          <p className="mt-5 max-w-xl text-lg text-blue-100">
            Verified painters, electricians and plumbers from your neighbourhood —
            compare itemized quotes, keep your money safe, approve the work.
          </p>
          <a
            href="#get-started"
            className="mt-8 inline-block rounded-control bg-saffron px-6 py-3.5 font-extrabold text-white transition-transform hover:-translate-y-0.5 hover:shadow-lift"
          >
            Post a job
          </a>
        </div>
      </section>

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