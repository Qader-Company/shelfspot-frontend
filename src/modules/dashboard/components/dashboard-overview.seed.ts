import { EditIcon, TrashIcon } from "@/shared/components/dashboard/dashboard-icons";

export type RequestStatus = "inProgress" | "completed" | "failed" | "pending";

export interface DashboardStatItem {
  key: string;
  titleKey: string;
  value: string;
  trendKey: string;
  tone: "info" | "success" | "danger" | "purple";
  iconSrc: string;
  trend?: number;
}

export interface RequestsChartPoint {
  key: string;
  monthKey: string;
  value: number;
}

export interface StatusDonutItem {
  key: RequestStatus;
  labelKey: string;
  value: number;
  tone: "warning" | "info" | "success" | "danger";
}

export interface RequestTableRow {
  id: string;
  locationKey: string;
  assigneeKey: string;
  time: string;
  status: RequestStatus;
}

export const dashboardStats: DashboardStatItem[] = [
  {
    key: "active",
    titleKey: "overview.stats.active.title",
    value: "124",
    trendKey: "overview.stats.active.trend",
    tone: "info",
    iconSrc: "/company/folders.svg",
  },
  {
    key: "completed",
    titleKey: "overview.stats.completed.title",
    value: "124",
    trendKey: "overview.stats.completed.trend",
    tone: "success",
    iconSrc: "/company/rightsign.svg",
  },
  {
    key: "delayed",
    titleKey: "overview.stats.delayed.title",
    value: "124",
    trendKey: "overview.stats.delayed.trend",
    tone: "danger",
    iconSrc: "/company/alert.svg",
  },
  {
    key: "acceptance",
    titleKey: "overview.stats.acceptance.title",
    value: "94.2%",
    trendKey: "overview.stats.acceptance.trend",
    tone: "purple",
    iconSrc: "/company/star.svg",
  },
];

export const requestsOverTimeData: RequestsChartPoint[] = [
  { key: "jan", monthKey: "overview.months.jan", value: 0 },
  { key: "feb", monthKey: "overview.months.feb", value: 31 },
  { key: "mar", monthKey: "overview.months.mar", value: 38 },
  { key: "apr", monthKey: "overview.months.apr", value: 58 },
  { key: "may", monthKey: "overview.months.may", value: 69 },
  { key: "jun", monthKey: "overview.months.jun", value: 108 },
  { key: "jul", monthKey: "overview.months.jul", value: 140 },
];

export const statusDonutData: StatusDonutItem[] = [
  {
    key: "pending",
    labelKey: "overview.status.pending",
    value: 23,
    tone: "warning",
  },
  {
    key: "inProgress",
    labelKey: "overview.status.inProgress",
    value: 67,
    tone: "info",
  },
  {
    key: "completed",
    labelKey: "overview.status.completed",
    value: 56,
    tone: "success",
  },
  {
    key: "failed",
    labelKey: "overview.status.rejected",
    value: 8,
    tone: "danger",
  },
];

export const requestRows: RequestTableRow[] = [
  {
    id: "REQ-4521",
    locationKey: "overview.mock.locations.dammam",
    assigneeKey: "overview.mock.assignees.mohamedAli",
    time: "22 May 2026, 15:43PM",
    status: "inProgress",
  },
  {
    id: "REQ-4521",
    locationKey: "overview.mock.locations.dammam",
    assigneeKey: "overview.mock.assignees.mohamedAli",
    time: "22 May 2026, 15:43PM",
    status: "completed",
  },
  {
    id: "REQ-4521",
    locationKey: "overview.mock.locations.dammam",
    assigneeKey: "overview.mock.assignees.mohamedAli",
    time: "22 May 2026, 15:43PM",
    status: "failed",
  },
  {
    id: "REQ-4521",
    locationKey: "overview.mock.locations.dammam",
    assigneeKey: "overview.mock.assignees.mohamedAli",
    time: "22 May 2026, 15:43PM",
    status: "pending",
  },
];

export const requestActions = {
  delete: TrashIcon,
  edit: EditIcon,
};
