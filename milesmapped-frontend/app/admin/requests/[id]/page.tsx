"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import type { AdminSearchRequest, SearchStatus } from "../../../../lib/types/admin";

const statusOptions: { value: SearchStatus; label: string }[] = [
  { value: "new", label: "New" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "closed", label: "Closed" }
];

function formatDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function DetailRow({ label, value }: { label: string; value?: string | number | null }) {
  return (
    <div className="flex flex-col gap-1 rounded-xl bg-mist px-4 py-3 text-sm text-navy/80 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs font-semibold uppercase tracking-[0.15em] text-navy/70">{label}</span>
      <span className="font-semibold text-navy">{value ?? "—"}</span>
    </div>
  );
}

function ItineraryList({ options }: { options?: AdminSearchRequest["itinerary_options"] }) {
  if (!options || options.length === 0) {
    return (
      <p className="rounded-xl bg-white px-4 py-3 text-sm text-navy/70 shadow-sm shadow-navy/5">
        No itinerary options have been added yet.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {options.map((option) => (
        <div
          key={option.id}
          className="space-y-2 rounded-xl border border-navy/10 bg-white p-4 text-sm text-navy/80 shadow-sm shadow-navy/5"
        >
          <div className="flex items-center justify-between">
            <p className="text-base font-semibold text-navy">{option.carrier}</p>
            <span className="rounded-full bg-sky/10 px-3 py-1 text-xs font-semibold uppercase text-sky">{option.source}</span>
          </div>
          <p className="text-navy/70">Flights: {option.flight_numbers}</p>
          <p className="text-navy/70">Cabin: {option.cabin ?? "—"}</p>
          <p className="text-navy/70">
            Departure: {formatDateTime(option.departure_time)} → Arrival: {formatDateTime(option.arrival_time)}
          </p>
          <p className="text-navy/70">Points price: {option.points_price ?? "—"}</p>
          <p className="text-navy/70">Cash price: {option.cash_price ?? "—"}</p>
          {option.booking_instructions && <p className="text-navy/70">Notes: {option.booking_instructions}</p>}
        </div>
      ))}
    </div>
  );
}

export default function AdminRequestDetailPage() {
  const params = useParams<{ id: string }>();
  const requestId = params?.id;
  const [request, setRequest] = useState<AdminSearchRequest | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [status, setStatus] = useState<SearchStatus>("new");
  const [adminNotes, setAdminNotes] = useState<string>("");
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const passengerLabel = useMemo(() => {
    const count = request?.passengers ?? 0;
    return count === 1 ? "1 passenger" : `${count} passengers`;
  }, [request?.passengers]);

  useEffect(() => {
    const fetchRequest = async () => {
      if (!requestId) return;
      try {
        const response = await fetch(`/api/admin/search-requests/${requestId}`, { cache: "no-store" });
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data?.detail ?? "Unable to load request");
        }

        setRequest(data as AdminSearchRequest);
        setStatus((data as AdminSearchRequest).status);
        setAdminNotes((data as AdminSearchRequest).admin_notes ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load request.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRequest();
  }, [requestId]);

  const handleUpdate = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(`/api/admin/search-requests/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          status,
          admin_notes: adminNotes.trim() || null
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data?.detail ?? "Unable to update request.");
      }

      setRequest(data as AdminSearchRequest);
      setSuccessMessage("Request updated successfully.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update request.");
    }
  };

  const userEmail = request?.user_email ?? request?.user?.email ?? "—";

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-gradient-to-br from-navy to-sky px-6 py-5 text-white shadow-lg shadow-navy/20">
        <div className="space-y-1">
          <p className="text-xs uppercase tracking-[0.3em] text-white/70">Admin</p>
          <h1 className="text-3xl font-semibold">Request #{requestId}</h1>
          <p className="text-white/80">Review details and update status.</p>
        </div>
        <Link href="/admin" className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-navy shadow-sm shadow-navy/10">
          Back to admin
        </Link>
      </header>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-900">
          <p className="font-semibold">{error}</p>
          <p>Please ensure you are signed in as an admin.</p>
        </div>
      )}

      {isLoading ? (
        <div className="rounded-2xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy/70 shadow-sm shadow-navy/5">
          Loading request details…
        </div>
      ) : request ? (
        <div className="space-y-6">
          <section className="space-y-3 rounded-2xl border border-navy/10 bg-white p-5 shadow-sm shadow-navy/5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-navy">{request.origin} → {request.destination}</p>
                <p className="text-sm text-navy/70">Departing {request.departure_date}</p>
              </div>
              <span className="rounded-full bg-sky/10 px-3 py-1 text-xs font-semibold uppercase text-sky">{request.status}</span>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <DetailRow label="User email" value={userEmail} />
              <DetailRow label="Passengers" value={passengerLabel} />
              <DetailRow label="Cabin" value={request.cabin ?? "—"} />
              <DetailRow label="Submitted" value={formatDateTime(request.created_at)} />
              <DetailRow label="Updated" value={formatDateTime(request.updated_at)} />
              <DetailRow label="Return date" value={request.return_date ?? "—"} />
            </div>

            {request.notes && (
              <div className="rounded-xl bg-mist px-4 py-3 text-sm text-navy/80">
                <p className="text-xs font-semibold uppercase tracking-[0.15em] text-navy/70">Traveler notes</p>
                <p className="mt-1 whitespace-pre-line text-navy">{request.notes}</p>
              </div>
            )}
          </section>

          <section className="space-y-4 rounded-2xl border border-navy/10 bg-white p-5 shadow-sm shadow-navy/5">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-navy">Admin controls</p>
              <p className="text-sm text-navy/70">Update status or leave internal notes.</p>
            </div>

            {successMessage && (
              <div className="rounded-xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-sm text-emerald-900">
                {successMessage}
              </div>
            )}

            <form className="space-y-4" onSubmit={handleUpdate}>
              <label className="block space-y-2 text-sm font-semibold text-navy">
                <span>Status</span>
                <select
                  className="w-full rounded-xl border border-navy/10 bg-white px-3 py-2 text-sm text-navy shadow-sm shadow-navy/5 focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/20"
                  value={status}
                  onChange={(event) => setStatus(event.target.value as SearchStatus)}
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="block space-y-2 text-sm font-semibold text-navy">
                <span>Admin notes</span>
                <textarea
                  className="w-full rounded-xl border border-navy/10 bg-white px-3 py-2 text-sm text-navy shadow-sm shadow-navy/5 focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/20"
                  rows={4}
                  value={adminNotes}
                  onChange={(event) => setAdminNotes(event.target.value)}
                  placeholder="Internal notes for concierge team"
                />
              </label>

              <button
                type="submit"
                className="rounded-xl bg-navy px-5 py-2 text-sm font-semibold text-white shadow-sm shadow-navy/10 transition hover:bg-sky"
              >
                Save changes
              </button>
            </form>
          </section>

          <section className="space-y-3 rounded-2xl border border-navy/10 bg-white p-5 shadow-sm shadow-navy/5">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-navy">Itinerary options</p>
              <p className="text-sm text-navy/70">Any routes suggested by the concierge team will appear below.</p>
            </div>
            <ItineraryList options={request.itinerary_options} />
          </section>
        </div>
      ) : (
        <div className="rounded-2xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy/70 shadow-sm shadow-navy/5">
          Request not found.
        </div>
      )}
    </div>
  );
}
