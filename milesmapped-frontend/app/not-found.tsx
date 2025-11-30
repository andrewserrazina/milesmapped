export default function NotFound() {
  return (
    <div className="section-card space-y-4 text-center">
      <p className="text-xs uppercase tracking-[0.2em] text-sky">Page not found</p>
      <h1 className="text-3xl font-bold text-navy">We couldn&apos;t find that page</h1>
      <p className="text-navy/70">
        The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
      </p>
      <a
        href="/"
        className="inline-flex items-center justify-center rounded-full bg-navy px-5 py-2 text-sm font-semibold text-white shadow-md shadow-navy/20 transition hover:-translate-y-0.5 hover:bg-navy/90"
      >
        Back to home
      </a>
    </div>
  );
}
