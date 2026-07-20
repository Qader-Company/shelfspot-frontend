import type { StatusBadgeStatus } from "@/shared/components/dashboard/status-badge";
import type { DashboardStatItem } from "@/shared/components/dashboard/widgets/types";

export interface DashboardRequestRow {
  id: string;
  taskId?: number;
  locationKey: string;
  assigneeKey: string;
  time: string;
  status: StatusBadgeStatus;
  statusLabel?: string;
}

export const dashboardRequestStats: DashboardStatItem[] = [
  {
    key: "total",
    titleKey: "requestsPage.stats.total.title",
    value: "124",
    trendKey: "requestsPage.stats.total.trend",
    tone: "info",
    iconSrc: "/company/folders.svg",
  },
  {
    key: "completed",
    titleKey: "requestsPage.stats.completed.title",
    value: "124",
    trendKey: "requestsPage.stats.completed.trend",
    tone: "success",
    iconSrc: "/company/rightsign.svg",
  },
  {
    key: "delayed",
    titleKey: "requestsPage.stats.delayed.title",
    value: "124",
    trendKey: "requestsPage.stats.delayed.trend",
    tone: "danger",
    iconSrc: "/company/alert.svg",
  },
  {
    key: "acceptance",
    titleKey: "requestsPage.stats.acceptance.title",
    value: "94.2%",
    trendKey: "requestsPage.stats.acceptance.trend",
    tone: "purple",
    iconSrc: "/company/star.svg",
  },
];

export const dashboardRequestRows: DashboardRequestRow[] = [
  { id: "REQ-4521", locationKey: "requestsPage.mock.locations.dammam", assigneeKey: "requestsPage.mock.assignees.mohamedAli", time: "22 May 2026, 15:43PM", status: "inProgress" },
  { id: "REQ-4521", locationKey: "requestsPage.mock.locations.dammam", assigneeKey: "requestsPage.mock.assignees.mohamedAli", time: "22 May 2026, 15:43PM", status: "inReview" },
  { id: "REQ-4521", locationKey: "requestsPage.mock.locations.dammam", assigneeKey: "requestsPage.mock.assignees.mohamedAli", time: "22 May 2026, 15:43PM", status: "rejected" },
  { id: "REQ-4521", locationKey: "requestsPage.mock.locations.dammam", assigneeKey: "requestsPage.mock.assignees.mohamedAli", time: "22 May 2026, 15:43PM", status: "pending" },
  { id: "REQ-4521", locationKey: "requestsPage.mock.locations.dammam", assigneeKey: "requestsPage.mock.assignees.mohamedAli", time: "22 May 2026, 15:43PM", status: "accepted" },
  { id: "REQ-4521", locationKey: "requestsPage.mock.locations.dammam", assigneeKey: "requestsPage.mock.assignees.mohamedAli", time: "22 May 2026, 15:43PM", status: "failed" },
  { id: "REQ-4521", locationKey: "requestsPage.mock.locations.dammam", assigneeKey: "requestsPage.mock.assignees.mohamedAli", time: "22 May 2026, 15:43PM", status: "canceled" },
  { id: "REQ-4521", locationKey: "requestsPage.mock.locations.dammam", assigneeKey: "requestsPage.mock.assignees.mohamedAli", time: "22 May 2026, 15:43PM", status: "inProgress" },
  { id: "REQ-4521", locationKey: "requestsPage.mock.locations.dammam", assigneeKey: "requestsPage.mock.assignees.mohamedAli", time: "22 May 2026, 15:43PM", status: "inProgress" },
  { id: "REQ-4521", locationKey: "requestsPage.mock.locations.dammam", assigneeKey: "requestsPage.mock.assignees.mohamedAli", time: "22 May 2026, 15:43PM", status: "failed" },
];

export const dashboardRequestPagination = {
  pages: ["1", "2", "3", "...", "8", "9", "10"],
  activePage: "1",
};
