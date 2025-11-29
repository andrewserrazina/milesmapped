"use client";

import { useMemo, useState } from "react";

type LoyaltyProgram = {
  id: number;
  name: string;
  type: string;
  alliance?: string | null;
  notes?: string | null;
};

type LoyaltyBalance = {
  id?: number | string;
  loyalty_program_id: number;
  points_balance: number;
  program_name?: string | null;
  last_updated?: string;
};

type LoyaltyBalancesTableProps = {
  programs: LoyaltyProgram[];
  balances: LoyaltyBalance[];
};

type BalanceRow = {
  program: LoyaltyProgram;
  balance?: LoyaltyBalance;
  draft: string;
};

export function LoyaltyBalancesTable({ programs, balances }: LoyaltyBalancesTableProps) {
  const [rows, setRows] = useState<BalanceRow[]>(() =>
    programs.map((program) => {
      const match = balances.find((balance) => balance.loyalty_program_id === program.id);
      return {
        program,
        balance: match,
        draft: match?.points_balance.toString() ?? ""
      };
    })
  );

  const [savingId, setSavingId] = useState<number | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const programCountText = useMemo(() => {
    if (programs.length === 0) return "No programs available";
    return `${programs.length} program${programs.length === 1 ? "" : "s"}`;
  }, [programs.length]);

  async function handleSave(programId: number) {
    const row = rows.find((entry) => entry.program.id === programId);
    if (!row) return;

    const parsedPoints = Number(row.draft);
    if (Number.isNaN(parsedPoints) || parsedPoints < 0) {
      setErrorMessage("Please enter a valid non-negative number for points.");
      setStatusMessage(null);
      return;
    }

    setSavingId(programId);
    setErrorMessage(null);
    setStatusMessage(null);

    const response = await fetch("/api/loyalty/balances", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ program_id: programId, points_balance: parsedPoints })
    });

    const result = (await response.json().catch(() => ({}))) as LoyaltyBalance & {
      detail?: string;
    };

    setSavingId(null);

    if (!response.ok) {
      setErrorMessage(result.detail ?? "Unable to save your balance.");
      return;
    }

    setRows((previous) =>
      previous.map((entry) =>
        entry.program.id === programId
          ? { ...entry, balance: result, draft: result.points_balance.toString() }
          : entry
      )
    );
    setStatusMessage(`${row.program.name} balance updated.`);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-sky">Programs</p>
          <h2 className="text-lg font-semibold text-navy">Loyalty balances</h2>
        </div>
        <p className="text-sm text-navy/70">{programCountText}</p>
      </div>

      {(statusMessage || errorMessage) && (
        <div
          className={`rounded-xl border px-4 py-3 text-sm ${
            errorMessage
              ? "border-red-100 bg-red-50 text-red-900"
              : "border-emerald-100 bg-emerald-50 text-emerald-900"
          }`}
        >
          {errorMessage ?? statusMessage}
        </div>
      )}

      <div className="overflow-hidden rounded-2xl border border-navy/10 bg-white shadow-sm shadow-navy/5">
        <div className="grid grid-cols-[1.5fr,1fr,1fr,1fr,140px] bg-mist px-4 py-3 text-xs font-semibold uppercase tracking-[0.15em] text-navy/70">
          <span>Program</span>
          <span>Type</span>
          <span>Alliance</span>
          <span>Balance</span>
          <span className="text-right">Actions</span>
        </div>

        {rows.length === 0 && (
          <p className="px-4 py-6 text-sm text-navy/70">No programs found.</p>
        )}

        {rows.map(({ program, balance, draft }) => (
          <div
            key={program.id}
            className="grid grid-cols-[1.5fr,1fr,1fr,1fr,140px] items-center border-t border-navy/5 px-4 py-4 text-sm text-navy"
          >
            <div>
              <p className="font-semibold text-navy">{program.name}</p>
              {balance?.last_updated && (
                <p className="text-xs text-navy/60">Last updated {formatDate(balance.last_updated)}</p>
              )}
            </div>
            <span className="text-navy/70">{formatProgramType(program.type)}</span>
            <span className="text-navy/70">{program.alliance ?? "—"}</span>
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={0}
                value={draft}
                onChange={(event) =>
                  setRows((previous) =>
                    previous.map((entry) =>
                      entry.program.id === program.id
                        ? { ...entry, draft: event.target.value }
                        : entry
                    )
                  )
                }
                className="w-full rounded-lg border border-navy/20 px-3 py-2 text-right focus:border-sky focus:outline-none"
                placeholder="0"
              />
            </div>
            <div className="flex justify-end">
              <button
                type="button"
                onClick={() => handleSave(program.id)}
                className="rounded-lg bg-navy px-4 py-2 text-sm font-semibold text-white transition hover:bg-sky focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky disabled:cursor-not-allowed disabled:bg-navy/50"
                disabled={savingId === program.id}
              >
                {savingId === program.id ? "Saving..." : balance ? "Update" : "Add"}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function formatProgramType(type?: string) {
  if (!type) return "—";
  const normalized = type.toLowerCase();
  if (normalized === "airline") return "Airline";
  if (normalized === "hotel") return "Hotel";
  return type;
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

