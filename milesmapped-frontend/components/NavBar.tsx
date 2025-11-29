import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/concierge", label: "Guided Concierge" },
  { href: "/dashboard", label: "Dashboard" }
];

export function NavBar() {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/60 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-sky text-lg font-bold text-white shadow-md shadow-sky/40">
            <span>MM</span>
          </div>
          <span className="text-xl font-semibold text-navy">MilesMapped</span>
        </Link>
        <nav className="flex items-center gap-2 text-sm font-medium text-navy/80">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full px-4 py-2 transition hover:bg-mist hover:text-navy"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/dashboard"
            className="rounded-full bg-navy px-4 py-2 text-white shadow-md shadow-navy/20 transition hover:-translate-y-0.5 hover:bg-navy/90"
          >
            Sign In
          </Link>
        </nav>
      </div>
    </header>
  );
}
