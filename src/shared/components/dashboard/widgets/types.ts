export interface DashboardStatItem {
  key: string;
  titleKey: string;
  value: string;
  trendKey: string;
  changePercentage?: number;
  tone: "info" | "success" | "danger" | "purple";
  iconSrc: string;
}

export interface RequestsChartPoint {
  key: string;
  monthKey: string;
  value: number;
}

export interface StatusDonutItem {
  key: "inProgress" | "completed" | "failed" | "pending";
  labelKey: string;
  value: number;
  tone: "warning" | "info" | "success" | "danger";
}
