export type DashboardPeriod = "week" | "month" | "year";

export interface DashboardCardMetric {
  value: number;
  previous_value: number;
  change_percentage: number;
  trend: number;
}

export interface DashboardReport {
  period: DashboardPeriod;
  range: { from: string; to: string };
  cards: {
    active_requests: DashboardCardMetric;
    completed_this_period: DashboardCardMetric;
    delayed_requests: DashboardCardMetric;
    acceptance_rate: DashboardCardMetric;
  };
  charts: {
    requests_over_time: Array<{ month: number; total: number }>;
    status_distribution: Array<{ status: string; total: number }>;
  };
}

export interface GetDashboardReportResponse {
  success: boolean;
  data: DashboardReport;
  message?: string;
}
