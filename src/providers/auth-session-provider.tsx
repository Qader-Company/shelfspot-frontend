"use client";

import { useEffect } from "react";

import { useAuthStore } from "@/shared/stores/auth-store";

export function AuthSessionProvider() {
  const hydrateSession = useAuthStore((state) => state.hydrateSession);

  useEffect(() => {
    hydrateSession();
  }, [hydrateSession]);

  return null;
}
