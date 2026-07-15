"use client";

import { useEffect } from "react";

import { setupApiClient } from "@/shared/lib/api/client";
import { useAuthStore } from "@/shared/stores/auth-store";

export function AuthSessionProvider() {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);

  useEffect(() => {
    hydrateSession();
    setupApiClient();
  }, [hydrateSession]);

  return null;
}
