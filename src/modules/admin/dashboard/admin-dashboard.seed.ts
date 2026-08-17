import type {
  DashboardStatItem,
  RequestsChartPoint,
  StatusDonutItem,
} from "@/shared/components/dashboard/widgets/types";

export type AdminStatIcon = "company" | "request" | "worker" | "revenue";

export interface AdminDashboardStat extends DashboardStatItem {
  icon: AdminStatIcon;
}

export interface RankedCompany {
  id: string;
  nameKey: string;
  requestCount: number;
  revenue: number;
}

export interface RankedWorker {
  id: string;
  nameKey: string;
  completedCount: number;
  rating: number;
  earnings: number;
}

export const adminDashboardStats: AdminDashboardStat[] = [
  { key: "totalCompanies", titleKey: "stats.totalCompanies", value: "1,248", trendKey: "trends.monthlyIncrease", changePercentage: 12, tone: "info", icon: "company", iconSrc: "/company/folders.svg" },
  { key: "activeCompanies", titleKey: "stats.activeCompanies", value: "876", trendKey: "trends.weeklyIncrease", changePercentage: 8, tone: "success", icon: "company", iconSrc: "/company/rightsign.svg" },
  { key: "requestsToday", titleKey: "stats.requestsToday", value: "124", trendKey: "trends.weeklyDecrease", changePercentage: -2, tone: "danger", icon: "request", iconSrc: "/company/alert.svg" },
  { key: "totalWorkers", titleKey: "stats.totalWorkers", value: "3,567", trendKey: "trends.workersIncrease", changePercentage: 18, tone: "purple", icon: "worker", iconSrc: "/company/star.svg" },
  { key: "activeWorkers", titleKey: "stats.activeWorkers", value: "2,341", trendKey: "trends.activeWorkersIncrease", changePercentage: 15, tone: "info", icon: "worker", iconSrc: "/company/star.svg" },
  { key: "platformRevenue", titleKey: "stats.platformRevenue", value: "$48,392", trendKey: "trends.revenueIncrease", changePercentage: 24, tone: "success", icon: "revenue", iconSrc: "/company/rightsign.svg" },
];

export const adminRequestsOverTime: RequestsChartPoint[] = [
  { key: "mar3", monthKey: "chart.dates.mar3", value: 0 },
  { key: "mar9", monthKey: "chart.dates.mar9", value: 38 },
  { key: "mar15", monthKey: "chart.dates.mar15", value: 44 },
  { key: "mar18", monthKey: "chart.dates.mar18", value: 71 },
  { key: "mar21", monthKey: "chart.dates.mar21", value: 79 },
  { key: "mar25", monthKey: "chart.dates.mar25", value: 121 },
  { key: "mar28", monthKey: "chart.dates.mar28", value: 156 },
];

export const adminRequestStatus: StatusDonutItem[] = [
  { key: "pending", labelKey: "status.pending", value: 23, tone: "warning" },
  { key: "inProgress", labelKey: "status.inProgress", value: 67, tone: "info" },
  { key: "completed", labelKey: "status.completed", value: 156, tone: "success" },
  { key: "failed", labelKey: "status.rejected", value: 8, tone: "danger" },
];

export const topCompanies: RankedCompany[] = [
  { id: "company-1", nameKey: "mock.companies.techCorp", requestCount: 234, revenue: 19080 },
  { id: "company-2", nameKey: "mock.companies.retailHub", requestCount: 218, revenue: 17420 },
  { id: "company-3", nameKey: "mock.companies.namaa", requestCount: 196, revenue: 15870 },
  { id: "company-4", nameKey: "mock.companies.vision", requestCount: 181, revenue: 14230 },
  { id: "company-5", nameKey: "mock.companies.supplyPoint", requestCount: 169, revenue: 12950 },
];

export const topActiveWorkers: RankedWorker[] = [
  { id: "worker-1", nameKey: "mock.workers.ibrahim", completedCount: 32, rating: 4.6, earnings: 19080 },
  { id: "worker-2", nameKey: "mock.workers.omar", completedCount: 29, rating: 4.8, earnings: 17420 },
  { id: "worker-3", nameKey: "mock.workers.sara", completedCount: 27, rating: 4.7, earnings: 15870 },
  { id: "worker-4", nameKey: "mock.workers.khaled", completedCount: 25, rating: 4.5, earnings: 14230 },
  { id: "worker-5", nameKey: "mock.workers.mona", completedCount: 23, rating: 4.6, earnings: 12950 },
];
