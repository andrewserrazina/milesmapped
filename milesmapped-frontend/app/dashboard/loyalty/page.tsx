import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LoyaltyBalancesTable } from "../../../components/LoyaltyBalancesTable";
import { getApiBaseUrl } from "../../../lib/auth";

type LoyaltyProgram = {
  id: number;
  name: string;
  type: string;
  alliance?: string | null;
  notes?: string | null;
};

type LoyaltyBalance = {
  id?: number;
  user_id?: number;
  loyalty_program_id: number;
  points_balance: number;
  program_name?: string;
  last_updated?: string;
};

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

export default async function LoyaltyDashboardPage() {
  let programs: LoyaltyProgram[] = [];
  let balances: LoyaltyBalance[] = [];
  let error: string | null = null;

  try {
    [programs, balances] = await Promise.all([
      fetchWithAuth<LoyaltyProgram[]>("/loyalty/programs"),
      fetchWithAuth<LoyaltyBalance[]>("/loyalty/balances")
    ]);
  } catch (err) {
    error = "Unable to load loyalty programs right now.";
  }

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-gradient-to-br from-navy to-sky px-6 py-5 text-white shadow-lg shadow-navy/20">
        <p className="text-sm uppercase tracking-[0.25em] text-white/70">Loyalty</p>
        <h1 className="text-3xl font-semibold">Manage your balances</h1>
        <p className="text-white/80">View all supported programs and keep your points up to date.</p>
      </header>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-900">
          {error}
        </div>
      ) : (
        <LoyaltyBalancesTable programs={programs} balances={balances} />
      )}
    </div>
  );
}
