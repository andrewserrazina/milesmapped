"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { ConciergeRequestPayload, useConciergeRequest } from "../../hooks/useConciergeRequest";

type ConciergeFormState = ConciergeRequestPayload;

const cabinOptions = [
  { value: "economy", label: "Economy" },
  { value: "premium_economy", label: "Premium Economy" },
  { value: "business", label: "Business" },
  { value: "first", label: "First" }
];

const createInitialFormState = (): ConciergeFormState => ({
  origin: "",
  destination: "",
  departure_date: "",
  return_date: "",
  cabin: cabinOptions[0].value,
  passengers: 1,
  notes: ""
});

function Field({ label, hint, children, required }: { label: string; hint?: string; children: React.ReactNode; required?: boolean }) {
  return (
    <label className="space-y-2">
      <div className="flex items-center justify-between text-sm font-semibold text-navy">
        <span>
          {label}
          {required && <span className="ml-1 text-red-600">*</span>}
        </span>
        {hint && <span className="text-xs font-medium text-navy/60">{hint}</span>}
      </div>
      {children}
    </label>
  );
}

function TextInput({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={`w-full rounded-2xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-sm shadow-navy/5 focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/20 ${className}`}
      {...props}
    />
  );
}

function TextArea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      className="w-full rounded-2xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-sm shadow-navy/5 focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/20"
      rows={4}
      {...props}
    />
  );
}

function StatusBanner({ variant, title, message }: { variant: "success" | "error"; title: string; message?: string }) {
  const styles =
    variant === "success"
      ? "bg-emerald-50 text-emerald-900 border-emerald-100"
      : "bg-red-50 text-red-900 border-red-100";
  return (
    <div className={`rounded-2xl border px-4 py-3 text-sm font-medium ${styles}`} role="status" aria-live="polite">
      <p className="font-semibold">{title}</p>
      {message && <p className="mt-1 text-sm opacity-90">{message}</p>}
    </div>
  );
}

export default function ConciergePage() {
  const [form, setForm] = useState<ConciergeFormState>(createInitialFormState);
  const { state, submitRequest } = useConciergeRequest();

  const isLoading = state.status === "loading";
  const isSuccess = state.status === "success";
  const isError = state.status === "error";

  useEffect(() => {
    if (isSuccess) {
      setForm(createInitialFormState());
    }
  }, [isSuccess]);

  const handleChange = <K extends keyof ConciergeFormState>(key: K) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      const value = event.target.value;
      setForm((prev) => ({
        ...prev,
        [key]: key === "passengers" ? Number(value) : value
      }));
    };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await submitRequest(form);
  };

  const requestDashboardHref = useMemo(() => {
    if (state.requestId) {
      return `/dashboard?requestId=${state.requestId}`;
    }

    return "/dashboard";
  }, [state.requestId]);

  return (
    <div className="space-y-8">
      <section className="section-card space-y-4">
        <div className="space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-sky">Guided concierge</p>
          <h1 className="text-3xl font-bold text-navy sm:text-4xl">Submit a concierge travel request</h1>
          <p className="text-base text-navy/70">
            Tell us where you need to go and when. Our specialists will search award inventory, craft routing options, and send
            you booking-ready recommendations aligned with your rewards.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl bg-mist px-4 py-3 text-sm text-navy/80">
            <p className="font-semibold text-navy">Expert research</p>
            <p>Carrier holds, mixed-cabin options, alliance sweet spots, and more.</p>
          </div>
          <div className="rounded-2xl bg-mist px-4 py-3 text-sm text-navy/80">
            <p className="font-semibold text-navy">Hands-on support</p>
            <p>Work directly with a concierge to tweak dates, cabins, and budgets.</p>
          </div>
          <div className="rounded-2xl bg-mist px-4 py-3 text-sm text-navy/80">
            <p className="font-semibold text-navy">Dashboard tracking</p>
            <p>Receive updates and view your request status inside your dashboard.</p>
          </div>
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-[3fr,2fr]">
        <section className="section-card space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold text-navy">Trip details</p>
              <p className="text-sm text-navy/60">Share the basics. You can refine everything after we review.</p>
            </div>
            {isSuccess && <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">Submitted</span>}
          </div>

          {isSuccess && (
            <StatusBanner
              variant="success"
              title="Request received"
              message={state.message ?? "We'll start researching options right away."}
            />
          )}

          {isError && (
            <StatusBanner variant="error" title="We couldn't submit your request" message={state.message} />
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Origin" required hint="Where you're departing from">
                <TextInput
                  name="origin"
                  placeholder="e.g. JFK"
                  value={form.origin}
                  onChange={handleChange("origin")}
                  required
                />
              </Field>
              <Field label="Destination" required hint="Where you need to go">
                <TextInput
                  name="destination"
                  placeholder="e.g. CDG"
                  value={form.destination}
                  onChange={handleChange("destination")}
                  required
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <Field label="Departure date" required>
                <TextInput
                  type="date"
                  name="departure_date"
                  value={form.departure_date}
                  onChange={handleChange("departure_date")}
                  required
                />
              </Field>
              <Field label="Return date" hint="Optional">
                <TextInput
                  type="date"
                  name="return_date"
                  value={form.return_date}
                  onChange={handleChange("return_date")}
                />
              </Field>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
              <Field label="Cabin" required>
                <select
                  name="cabin"
                  className="w-full rounded-2xl border border-navy/10 bg-white px-4 py-3 text-sm text-navy shadow-sm shadow-navy/5 focus:border-sky focus:outline-none focus:ring-2 focus:ring-sky/20"
                  value={form.cabin}
                  onChange={handleChange("cabin")}
                  required
                >
                  {cabinOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Passengers" required hint="Adults + children">
                <TextInput
                  type="number"
                  name="passengers"
                  min={1}
                  max={9}
                  value={form.passengers}
                  onChange={handleChange("passengers")}
                  required
                />
              </Field>
              <div className="hidden md:block" />
            </div>

            <Field label="Notes" hint="Preferences, flexibility, points balances">
              <TextArea
                name="notes"
                placeholder="Include preferred airlines, flexibility, loyalty balances, or special requests."
                value={form.notes}
                onChange={handleChange("notes")}
              />
            </Field>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                className="btn-primary"
                disabled={isLoading}
              >
                {isLoading ? "Submitting..." : "Send concierge request"}
              </button>
              <p className="text-sm text-navy/60">Our team typically responds within a few hours.</p>
            </div>
          </form>
        </section>

        <aside className="section-card space-y-6 bg-gradient-to-br from-white to-mist/60">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-navy">What happens next</p>
            <p className="text-sm text-navy/70">
              We pair your request with a concierge, review award space, and surface 2-3 options that balance convenience and
              points value.
            </p>
          </div>
          <div className="space-y-3 text-sm text-navy/80">
            <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm shadow-navy/5">
              <p className="font-semibold text-navy">Research & alerts</p>
              <p className="mt-1">We monitor award space, set holds when possible, and notify you when options open up.</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm shadow-navy/5">
              <p className="font-semibold text-navy">Personalized routing</p>
              <p className="mt-1">We suggest creative routings, mixed cabins, and transfer partners that fit your balances.</p>
            </div>
            <div className="rounded-2xl border border-white/70 bg-white/70 p-4 shadow-sm shadow-navy/5">
              <p className="font-semibold text-navy">Booking-ready guidance</p>
              <p className="mt-1">Receive detailed steps to book, or ask us to finalize tickets on your behalf.</p>
            </div>
          </div>

          <div className="rounded-2xl border border-sky/20 bg-sky/5 p-4 text-sm text-navy">
            <p className="font-semibold text-sky">Have a complex itinerary?</p>
            <p className="mt-1 text-navy/70">Let us know connections, time windows, or must-fly carriers in the notes.</p>
          </div>
        </aside>
      </div>

      {isSuccess && (
        <div className="section-card flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-lg font-semibold text-navy">You’re all set!</p>
            <p className="text-sm text-navy/70">We are reviewing your concierge request now. Expect an update soon.</p>
          </div>
          <Link
            href={requestDashboardHref}
            className="rounded-full border border-sky bg-white px-4 py-2 text-sm font-semibold text-sky shadow-sm shadow-sky/20 transition hover:-translate-y-0.5 hover:border-sky/80"
          >
            View this request in your dashboard
          </Link>
        </div>
      )}
    </div>
  );
}
