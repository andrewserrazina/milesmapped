export default function DashboardLoading() {
  return (
    <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
      <aside className="rounded-2xl bg-white p-5 shadow-sm shadow-navy/10">
        <div className="space-y-3 animate-pulse">
          <div className="h-3 w-24 rounded-full bg-mist" />
          <div className="h-5 w-32 rounded-full bg-mist" />
          <div className="space-y-2 pt-2">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-9 rounded-xl bg-mist" />
            ))}
          </div>
        </div>
      </aside>

      <section className="space-y-6">
        <div className="h-32 rounded-2xl bg-gradient-to-br from-navy/40 to-sky/40" />
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="h-28 rounded-2xl bg-mist animate-pulse" />
          ))}
        </div>
        <div className="grid gap-6 xl:grid-cols-2">
          {[...Array(2)].map((_, index) => (
            <div key={index} className="h-64 rounded-2xl bg-mist animate-pulse" />
          ))}
        </div>
      </section>
    </div>
  );
}
