"use client";

import { useQuery } from "@tanstack/react-query";

import { getDashboardReportService } from "@/modules/dashboard/services/get-dashboard-report-service";
import { QUERY_KEYS } from "@/shared/lib/query/keys";
import { useAuthStore } from "@/shared/stores/auth-store";

export function useDashboardReportQuery() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery({
    queryKey: QUERY_KEYS.dashboardReport,
    queryFn: getDashboardReportService,
    enabled: isAuthenticated,
  });
}
