import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="space-y-10">
      <section className="section-card grid grid-cols-1 items-center gap-10 lg:grid-cols-2">
        <div className="space-y-6">
          <span className="inline-flex items-center rounded-full bg-mist px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-sky">Travel smarter with miles</span>
          <h1 className="text-4xl font-bold leading-tight text-navy sm:text-5xl">
            Book flights and hotels with points and miles
          </h1>
          <p className="text-lg text-navy/70">
            Unlock curated award travel options, guided concierge support, and real-time tools that translate your rewards into unforgettable journeys.
          </p>
          <div className="flex flex-wrap items-center gap-4">
            <Link href="/dashboard" className="btn-primary">
              Get Started
            </Link>
            <span className="text-sm text-navy/60">
              No credit card required. Explore in minutes.
            </span>
          </div>
        </div>
        <div className="relative">
          <div className="section-card relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-sky/10 via-accent/10 to-navy/5" />
            <div className="relative space-y-4">
              <div className="flex items-center justify-between rounded-2xl bg-navy px-4 py-3 text-white shadow-lg shadow-navy/30">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-white/70">Journey snapshot</p>
                  <p className="text-lg font-semibold">JFK → CDG + 3 nights</p>
                </div>
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-semibold">65k miles</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm text-navy/80">
                <div className="rounded-2xl bg-white/90 p-4 shadow-sm shadow-navy/5">
                  <p className="text-xs uppercase tracking-[0.15em] text-navy/50">Airline</p>
                  <p className="text-base font-semibold text-navy">Sky Atlantic</p>
                  <p className="text-xs text-navy/60">Saver fare • lie-flat</p>
                </div>
                <div className="rounded-2xl bg-white/90 p-4 shadow-sm shadow-navy/5">
                  <p className="text-xs uppercase tracking-[0.15em] text-navy/50">Hotel</p>
                  <p className="text-base font-semibold text-navy">Le Meridien Etoile</p>
                  <p className="text-xs text-navy/60">48k points • breakfast</p>
                </div>
                <div className="rounded-2xl bg-white/90 p-4 shadow-sm shadow-navy/5">
                  <p className="text-xs uppercase tracking-[0.15em] text-navy/50">Concierge</p>
                  <p className="text-base font-semibold text-navy">Award hold & alerts</p>
                </div>
                <div className="rounded-2xl bg-white/90 p-4 shadow-sm shadow-navy/5">
                  <p className="text-xs uppercase tracking-[0.15em] text-navy/50">Value</p>
                  <p className="text-base font-semibold text-navy">3.2¢ per point</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
