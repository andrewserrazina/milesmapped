"use client";

export default function GlobalError({ reset }: { reset: () => void }) {
  return (
    <div className="section-card space-y-4 text-center" role="alert">
      <p className="text-xs uppercase tracking-[0.2em] text-sky">Something went wrong</p>
      <h1 className="text-3xl font-bold text-navy">We hit a snag</h1>
      <p className="text-navy/70">
        An unexpected error occurred while loading this page. Please try again or return to the home page.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={reset}
          className="rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white shadow-md shadow-navy/20 transition hover:-translate-y-0.5 hover:bg-navy/90"
        >
          Try again
        </button>
        <a
          href="/"
          className="rounded-full border border-navy/10 px-5 py-2 text-sm font-semibold text-navy shadow-sm shadow-navy/10 transition hover:-translate-y-0.5 hover:bg-mist"
        >
          Back to home
        </a>
      </div>
    </div>
  );
}
