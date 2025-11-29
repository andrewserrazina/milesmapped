import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "../../lib/auth";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/auth/login");
  }

  return (
    <div className="space-y-6">
      <div className="rounded-2xl bg-navy px-6 py-5 text-white shadow-lg shadow-navy/20">
        <p className="text-sm uppercase tracking-[0.25em] text-white/70">Dashboard</p>
        <h1 className="text-3xl font-semibold">Welcome back, {user.name ?? user.email}!</h1>
        <p className="text-white/80">Here is your snapshot for the week.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm shadow-navy/5">
          <h2 className="text-lg font-semibold text-navy">Profile</h2>
          <dl className="mt-4 space-y-2 text-sm text-navy/80">
            <div className="flex items-center justify-between rounded-lg bg-mist/60 px-3 py-2">
              <dt className="font-medium">Name</dt>
              <dd>{user.name ?? "Not provided"}</dd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-mist/60 px-3 py-2">
              <dt className="font-medium">Email</dt>
              <dd>{user.email}</dd>
            </div>
            <div className="flex items-center justify-between rounded-lg bg-mist/60 px-3 py-2">
              <dt className="font-medium">User ID</dt>
              <dd className="font-mono text-xs text-navy/70">{user.id}</dd>
            </div>
          </dl>
        </div>

        <div className="rounded-2xl bg-white p-5 shadow-sm shadow-navy/5">
          <h2 className="text-lg font-semibold text-navy">Get started</h2>
          <ul className="mt-4 space-y-3 text-sm text-navy/80">
            <li className="flex items-center justify-between rounded-lg bg-mist/60 px-3 py-2">
              <span>Plan a new trip</span>
              <Link href="/concierge" className="text-sm font-semibold text-sky hover:underline">
                Concierge tools
              </Link>
            </li>
            <li className="flex items-center justify-between rounded-lg bg-mist/60 px-3 py-2">
              <span>Update your profile</span>
              <a href="/profile" className="text-sm font-semibold text-sky hover:underline">
                Edit profile
              </a>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
