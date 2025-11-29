import Link from "next/link";

export default function LoginPage() {
  return (
    <div className="mx-auto max-w-xl space-y-8 rounded-2xl bg-white p-8 shadow-sm shadow-navy/5">
      <div className="space-y-2 text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-navy/60">Welcome back</p>
        <h1 className="text-3xl font-bold text-navy">Sign in to your account</h1>
        <p className="text-sm text-navy/60">
          Use your MilesMapped credentials to access your dashboard and concierge tools.
        </p>
      </div>

      <form action="/api/auth/login" method="POST" className="space-y-4">
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
            placeholder="Your secure password"
          />
        </div>

        <button type="submit" className="btn-primary w-full justify-center">
          Sign In
        </button>
      </form>

      <p className="text-center text-sm text-navy/60">
        New to MilesMapped?{" "}
        <Link href="/auth/register" className="font-semibold text-sky hover:underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
