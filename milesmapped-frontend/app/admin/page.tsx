"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { AdminSearchRequest } from "../../lib/types/admin";

const statusLabels: Record<string, string> = {
  new: "New",
  in_progress: "In progress",
  completed: "Completed",
  closed: "Closed"
};

function formatDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function AdminRequestsTable({ requests }: { requests: AdminSearchRequest[] }) {
  const router = useRouter();

  const handleRowClick = (id: number) => {
    router.push(`/admin/requests/${id}`);
  };

  return (
    <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm shadow-navy/5">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-navy/10 text-left text-sm">
          <thead className="bg-mist">
            <tr className="text-xs font-semibold uppercase tracking-[0.15em] text-navy/70">
              <th className="px-4 py-3">ID</th>
              <th className="px-4 py-3">User email</th>
              <th className="px-4 py-3">Origin</th>
              <th className="px-4 py-3">Destination</th>
              <th className="px-4 py-3">Departure date</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Created at</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-navy/10">
            {requests.map((request) => {
              const userEmail = request.user_email ?? request.user?.email ?? "—";
              return (
                <tr
                  key={request.id}
                  className="cursor-pointer transition hover:bg-sky/5"
                  onClick={() => handleRowClick(request.id)}
                >
                  <td className="px-4 py-3 font-semibold text-navy">#{request.id}</td>
                  <td className="px-4 py-3 text-navy/80">{userEmail}</td>
                  <td className="px-4 py-3 text-navy/80">{request.origin}</td>
                  <td className="px-4 py-3 text-navy/80">{request.destination}</td>
                  <td className="px-4 py-3 text-navy/80">{request.departure_date}</td>
                  <td className="px-4 py-3 font-semibold uppercase text-sky">
                    {statusLabels[request.status] ?? request.status}
                  </td>
                  <td className="px-4 py-3 text-navy/70">{formatDate(request.created_at)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default function AdminDashboardPage() {
  const [requests, setRequests] = useState<AdminSearchRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const totalRequests = useMemo(() => requests.length, [requests]);

  useEffect(() => {
    const fetchRequests = async () => {
      try {
        const response = await fetch("/api/admin/search-requests", { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.detail ?? "Unable to load requests.");
        }

        setRequests(data as AdminSearchRequest[]);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load requests.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequests();
  }, []);

  return (
    <div className="space-y-6">
      <header className="flex items-start justify-between rounded-2xl bg-gradient-to-br from-navy to-sky px-6 py-5 text-white shadow-lg shadow-navy/20">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">Admin</p>
          <h1 className="text-3xl font-semibold">Concierge search requests</h1>
          <p className="text-white/80">Manage concierge submissions from members.</p>
        </div>
        <div className="rounded-xl bg-white/10 px-4 py-2 text-right text-sm font-semibold">
          <p className="text-white/70">Total requests</p>
          <p className="text-lg text-white">{isLoading ? "…" : totalRequests}</p>
        </div>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-900">
          <p className="font-semibold">{error}</p>
          <p>Please ensure you are signed in as an admin.</p>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy/70 shadow-sm shadow-navy/5">
          Loading search requests…
        </div>
      ) : requests.length === 0 ? (
        <div className="space-y-4 rounded-2xl border border-navy/10 bg-white p-6 text-sm text-navy/80 shadow-sm shadow-navy/5">
          <p className="font-semibold text-navy">No concierge requests yet.</p>
          <p>When members submit concierge searches, they will appear here for review.</p>
          <Link className="text-sm font-semibold text-sky hover:underline" href="/dashboard">
            Go to member dashboard
          </Link>
        </div>
      ) : (
        <AdminRequestsTable requests={requests} />
      )}
    </div>
  );
}
