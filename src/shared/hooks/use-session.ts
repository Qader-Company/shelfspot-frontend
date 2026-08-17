"use client";

import { useQuery } from "@tanstack/react-query";
import { getCompanyProfile } from "@/modules/company/profile/service";
import { getAdminProfile } from "@/modules/admin/settings/service";
import type { Portal } from "@/shared/services/notifications-api";

/**
 * Hook to get the current user session info for notifications
 */
export function useSession(portal: Portal) {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["profile", portal],
    queryFn: () => {
      if (portal === "admin") {
        return getAdminProfile();
      } else if (portal === "company") {
        return getCompanyProfile();
      }
      throw new Error(`Unsupported portal: ${portal}`);
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 1,
  });

  return {
    userId: profile?.id ?? null,
    profile,
    isLoading,
    error,
  };
}
