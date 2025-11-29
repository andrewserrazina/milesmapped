"use client";

import { useEffect, useState } from "react";
import type { UserProfile } from "../lib/auth";

type HookState = {
  user: UserProfile | null;
  loading: boolean;
  error?: string;
};

export function useCurrentUser(): HookState {
  const [state, setState] = useState<HookState>({
    user: null,
    loading: true
  });

  useEffect(() => {
    let isActive = true;

    const fetchProfile = async () => {
      try {
        const response = await fetch("/api/auth/me", {
          method: "GET",
          credentials: "include"
        });

        if (!isActive) return;

        if (!response.ok) {
          setState({ user: null, loading: false, error: undefined });
          return;
        }

        const user = (await response.json()) as UserProfile;
        setState({ user, loading: false });
      } catch (error) {
        if (!isActive) return;
        setState({ user: null, loading: false, error: "Unable to load profile." });
      }
    };

    fetchProfile();

    return () => {
      isActive = false;
    };
  }, []);

  return state;
}
