"use client";

import { useEffect, type ReactNode } from "react";

import { ROUTES } from "@/config/routes";
import { useRouter } from "@/i18n/navigation";
import { PageLoadingSkeleton } from "@/shared/components/feedback";
import { useAuthStore } from "@/shared/stores/auth-store";

export function DashboardAuthGuard({ children }: { children: ReactNode }) {
  const router = useRouter();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const isHydrated = useAuthStore((state) => state.isHydrated);

  useEffect(() => {
    if (isHydrated && !isAuthenticated) {
      router.replace(ROUTES.login);
    }
  }, [isAuthenticated, isHydrated, router]);

  if (!isHydrated || !isAuthenticated) {
    return (
      <PageLoadingSkeleton
        actionCount={2}
        cardCount={4}
        chartCount={2}
      />
    );
  }

  return children;
}
