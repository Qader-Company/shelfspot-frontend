import { apiClient } from "@/shared/lib/api/client";
import type { DashboardReportResponse } from "@/modules/dashboard/types/dashboard-report";

const DASHBOARD_REPORT_ENDPOINT = "/api/company/reports/dashboard";

export async function getDashboardReportService() {
  const response = await apiClient.get<DashboardReportResponse>(
    DASHBOARD_REPORT_ENDPOINT,
  );
  return response.data.data;
}
