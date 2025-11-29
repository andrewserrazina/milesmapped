"use client";

import { useState } from "react";

type SubmissionStatus = "idle" | "loading" | "success" | "error";

export type ConciergeRequestPayload = {
  origin: string;
  destination: string;
  departure_date: string;
  return_date?: string;
  cabin: string;
  passengers: number;
  notes?: string;
};

type SubmissionState = {
  status: SubmissionStatus;
  message?: string;
  requestId?: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export function useConciergeRequest() {
  const [state, setState] = useState<SubmissionState>({ status: "idle" });

  const submitRequest = async (payload: ConciergeRequestPayload) => {
    if (!API_BASE_URL) {
      setState({ status: "error", message: "API base URL is not configured." });
      return;
    }

    setState({ status: "loading" });

    try {
      const response = await fetch(`${API_BASE_URL}/concierge/requests`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "include",
        body: JSON.stringify({
          ...payload,
          return_date: payload.return_date || null,
          notes: payload.notes?.trim() || null
        })
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        const message = (data as { detail?: string } | null)?.detail ??
          "We couldn't submit your concierge request.";
        setState({ status: "error", message });
        return;
      }

      setState({
        status: "success",
        message: "Your request has been submitted.",
        requestId: (data as { id?: string } | null)?.id
      });
    } catch (error) {
      setState({
        status: "error",
        message: "Something went wrong while sending your request. Please try again."
      });
    }
  };

  return { state, submitRequest };
}
