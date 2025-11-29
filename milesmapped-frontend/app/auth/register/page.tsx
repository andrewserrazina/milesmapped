import Link from "next/link";

export default function RegisterPage() {
  return (
    <div className="mx-auto max-w-xl space-y-8 rounded-2xl bg-white p-8 shadow-sm shadow-navy/5">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-navy/60">Join MilesMapped</p>
        <h1 className="text-3xl font-bold text-navy">Create your account</h1>
        <p className="text-sm text-navy/60">
          Register to unlock your personalized travel dashboard and concierge services.
        </p>
      </div>

      <form action="/api/auth/register" method="POST" className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-navy" htmlFor="name">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            className="w-full rounded-lg border border-mist bg-white px-3 py-2 text-sm text-navy shadow-inner shadow-navy/5 focus:border-sky focus:outline-none"
            placeholder="Alex Traveler"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-navy" htmlFor="email">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            className="w-full rounded-lg border border-mist bg-white px-3 py-2 text-sm text-navy shadow-inner shadow-navy/5 focus:border-sky focus:outline-none"
            placeholder="you@example.com"
          />
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-navy" htmlFor="password">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            className="w-full rounded-lg border border-mist bg-white px-3 py-2 text-sm text-navy shadow-inner shadow-navy/5 focus:border-sky focus:outline-none"
            placeholder="Create a secure password"
          />
        </div>

        <button type="submit" className="btn-primary w-full justify-center">
          Create Account
        </button>
      </form>

      <p className="text-center text-sm text-navy/60">
        Already have an account?{" "}
        <Link href="/auth/login" className="font-semibold text-sky hover:underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
