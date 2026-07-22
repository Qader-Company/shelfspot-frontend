export interface DashboardReportCard {
  value: number;
  previous_value: number;
  change_percentage: number;
  trend: number;
}

export interface DashboardReportResponse {
  success: boolean;
  data: {
    period: string;
    range: {
      from: string;
      to: string;
    };
    cards: {
      active_requests: DashboardReportCard;
      completed_this_period: DashboardReportCard;
      delayed_requests: DashboardReportCard;
      acceptance_rate: DashboardReportCard;
    };
    charts: {
      requests_over_time: Array<{ month: number; total: number }>;
      status_distribution: Array<{ status: string; total: number }>;
    };
  };
}
