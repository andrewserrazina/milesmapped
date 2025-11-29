import Link from "next/link";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getApiBaseUrl } from "../../lib/auth";

function getFirstName(profile?: DashboardUser | null) {
  const fullName = profile?.full_name ?? profile?.name ?? "";
  if (fullName.trim()) {
    return fullName.trim().split(/\s+/)[0];
  }

  return profile?.email ?? "there";
}

function formatDate(dateString?: string) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function calculatePointsTotal(balances: LoyaltyBalance[]) {
  return balances.reduce((total, balance) => {
    const points =
      typeof balance.points === "number"
        ? balance.points
        : typeof balance.points_balance === "number"
          ? balance.points_balance
          : 0;
    return total + points;
  }, 0);
}

async function fetchWithAuth<T>(path: string): Promise<T> {
  const token = cookies().get("access_token")?.value;

  if (!token) {
    redirect("/auth/login");
  }

  const response = await fetch(`${getApiBaseUrl()}${path}`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`
    },
    cache: "no-store"
  });

  if (response.status === 401) {
    redirect("/auth/login");
  }

  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}`);
  }

  return response.json() as Promise<T>;
}

export type DashboardUser = {
  id: number | string;
  email: string;
  full_name?: string;
  name?: string;
  created_at?: string;
  updated_at?: string;
  last_login_at?: string;
};

export type LoyaltyBalance = {
  id?: number | string;
  loyalty_program_id?: number | string;
  program_name?: string;
  points?: number;
  points_balance?: number;
  last_updated?: string;
};

export type ConciergeRequest = {
  id: number | string;
  origin?: string;
  destination?: string;
  status?: string;
  created_at?: string;
  updated_at?: string;
  summary?: string;
};

export default async function DashboardPage() {
  const [profileResult, balancesResult, requestsResult] = await Promise.allSettled([
    fetchWithAuth<DashboardUser>("/me"),
    fetchWithAuth<LoyaltyBalance[]>("/loyalty/balances"),
    fetchWithAuth<ConciergeRequest[]>("/concierge/requests?limit=3")
  ]);

  const profile = profileResult.status === "fulfilled" ? profileResult.value : null;
  const balances = balancesResult.status === "fulfilled" ? balancesResult.value : [];
  const requests = requestsResult.status === "fulfilled" ? requestsResult.value : [];

  const firstName = getFirstName(profile);
  const totalPoints = calculatePointsTotal(balances);
  const lastLoginDate = formatDate(
    profile?.last_login_at ?? profile?.updated_at ?? profile?.created_at
  );

  const hasError =
    profileResult.status === "rejected" ||
    balancesResult.status === "rejected" ||
    requestsResult.status === "rejected";

  return (
    <div className="grid gap-6 lg:grid-cols-[260px,1fr]">
      <aside className="rounded-2xl bg-white p-5 shadow-sm shadow-navy/10">
        <div className="space-y-4">
          <div>
            <p className="text-xs uppercase tracking-[0.25em] text-sky">Dashboard</p>
            <p className="text-lg font-semibold text-navy">Navigation</p>
          </div>
          <nav className="space-y-2 text-sm font-medium text-navy/80">
            {sidebarLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="block rounded-xl px-3 py-2 transition hover:bg-mist hover:text-navy"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      </aside>

      <section className="space-y-6">
        <header className="rounded-2xl bg-gradient-to-br from-navy to-sky px-6 py-5 text-white shadow-lg shadow-navy/20">
          <p className="text-sm uppercase tracking-[0.25em] text-white/70">Overview</p>
          <h1 className="text-3xl font-semibold">Welcome back, {firstName}!</h1>
          <p className="text-white/80">Here is your snapshot for the week.</p>
        </header>

        {hasError && (
          <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-900">
            <p className="font-semibold">We had trouble loading some dashboard data.</p>
            <p>Please refresh the page or try again later.</p>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SummaryCard
            title="Total loyalty points"
            value={new Intl.NumberFormat("en-US").format(totalPoints)}
            description="Combined across all programs"
          />
          <SummaryCard
            title="Concierge requests"
            value={requests.length.toString()}
            description="Latest submissions"
          />
          <SummaryCard
            title="Last login"
            value={lastLoginDate}
            description={profile?.email ?? ""}
          />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <section className="rounded-2xl bg-white p-5 shadow-sm shadow-navy/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-sky">Balances</p>
                <h2 className="text-lg font-semibold text-navy">Loyalty balances</h2>
              </div>
              <Link href="/loyalty" className="text-sm font-semibold text-sky hover:underline">
                Manage balances
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {balances.length === 0 && (
                <p className="rounded-xl bg-mist px-4 py-3 text-sm text-navy/70">
                  No balances found. Add your loyalty programs to see totals here.
                </p>
              )}

              {balances.map((balance) => (
                <div
                  key={balance.id ?? balance.loyalty_program_id ?? balance.program_name}
                  className="flex items-center justify-between rounded-xl border border-navy/5 bg-white px-4 py-3 shadow-sm shadow-navy/5"
                >
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-navy">
                      {balance.program_name ?? "Loyalty program"}
                    </p>
                    {balance.last_updated && (
                      <p className="text-xs text-navy/60">Updated {formatDate(balance.last_updated)}</p>
                    )}
                  </div>
                  <p className="text-xl font-semibold text-navy">
                    {new Intl.NumberFormat("en-US").format(
                      typeof balance.points === "number"
                        ? balance.points
                        : typeof balance.points_balance === "number"
                          ? balance.points_balance
                          : 0
                    )}
                  </p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl bg-white p-5 shadow-sm shadow-navy/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.2em] text-sky">Requests</p>
                <h2 className="text-lg font-semibold text-navy">Latest concierge requests</h2>
              </div>
              <Link href="/concierge" className="text-sm font-semibold text-sky hover:underline">
                New request
              </Link>
            </div>

            <div className="mt-4 space-y-3">
              {requests.length === 0 && (
                <p className="rounded-xl bg-mist px-4 py-3 text-sm text-navy/70">
                  You don&apos;t have any requests yet. Submit a new concierge request to get started.
                </p>
              )}

              {requests.map((request) => (
                <div
                  key={request.id}
                  className="space-y-2 rounded-xl border border-navy/5 bg-white px-4 py-3 shadow-sm shadow-navy/5"
                >
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <p className="text-sm font-semibold text-navy">
                        {request.destination ?? request.summary ?? "Trip request"}
                      </p>
                      {(request.origin || request.destination) && (
                        <p className="text-xs text-navy/60">
                          {request.origin ?? "TBD"} → {request.destination ?? "TBD"}
                        </p>
                      )}
                    </div>
                    {request.status && <StatusPill status={request.status} />}
                  </div>
                  <p className="text-xs text-navy/60">Submitted {formatDate(request.created_at)}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      </section>
    </div>
  );
}

const sidebarLinks = [
  { href: "/dashboard", label: "Overview" },
  { href: "/loyalty", label: "Loyalty Balances" },
  { href: "/concierge", label: "Concierge Requests" },
  { href: "/profile", label: "Profile" }
];

function SummaryCard({
  title,
  value,
  description
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm shadow-navy/5">
      <p className="text-xs uppercase tracking-[0.2em] text-sky">{title}</p>
      <p className="mt-2 text-3xl font-semibold text-navy">{value}</p>
      <p className="text-sm text-navy/60">{description}</p>
    </div>
  );
}

function StatusPill({ status }: { status: string }) {
  const normalized = status.toLowerCase();
  const variants: Record<string, string> = {
    pending: "bg-amber-100 text-amber-900",
    submitted: "bg-sky-100 text-sky-900",
    in_progress: "bg-blue-100 text-blue-900",
    completed: "bg-emerald-100 text-emerald-900",
    cancelled: "bg-red-100 text-red-900"
  };

  const style = variants[normalized] ?? "bg-mist text-navy";

  return (
    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${style}`}>
      {status}
    </span>
  );
}
