"use client";

import { useQuery } from "@tanstack/react-query";

import { getDashboardReportService } from "@/modules/company/dashboard/services/get-dashboard-report-service";
import { QUERY_KEYS } from "@/shared/lib/query/keys";

export function useDashboardReportQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.dashboardReport,
    queryFn: getDashboardReportService,
  });
}
