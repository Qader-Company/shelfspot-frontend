import { apiClient } from "@/shared/lib/api/client";
import type { GetDashboardReportResponse } from "@/modules/dashboard/types/dashboard-report";

const DASHBOARD_REPORT_ENDPOINT = "/api/company/reports/dashboard";

export async function getDashboardReportService(): Promise<GetDashboardReportResponse> {
  const response = await apiClient.get<GetDashboardReportResponse>(
    DASHBOARD_REPORT_ENDPOINT,
  );
  return response.data;
}
