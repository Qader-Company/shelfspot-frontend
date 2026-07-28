"use client";

import { useTranslations } from "next-intl";

import { ROUTES } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import {
  requestRows,
  type RequestStatus,
} from "@/modules/company/dashboard/components/dashboard-overview.seed";
import { RequestsTable } from "@/modules/company/dashboard/components/requests-table";
import { useDashboardReportQuery } from "@/modules/company/dashboard/hooks/use-dashboard-report-query";
import { AddIcon, SidebarChevronIcon } from "@/shared/components/dashboard/dashboard-icons";
import { ChartCard } from "@/shared/components/dashboard/widgets/chart-card";
import { DashboardStatCard } from "@/shared/components/dashboard/widgets/dashboard-stat-card";
import { RequestsChart } from "@/shared/components/dashboard/widgets/requests-chart";
import { StatusDonutChart } from "@/shared/components/dashboard/widgets/status-donut-chart";
import type {
  DashboardStatItem,
  RequestsChartPoint,
  StatusDonutItem,
} from "@/shared/components/dashboard/widgets/types";
import { Button } from "@/shared/ui/button";

export function DashboardOverview() {
  const t = useTranslations("dashboard");
  const reportQuery = useDashboardReportQuery();
  const report = reportQuery.data;
  const cards = report?.cards;
  const dashboardStats: DashboardStatItem[] = [
    {
      key: "active",
      titleKey: "overview.stats.active.title",
      value: String(cards?.active_requests.value ?? 0),
      trendKey: "overview.stats.active.trend",
      changePercentage: cards?.active_requests.change_percentage ?? 0,
      tone: "info",
      iconSrc: "/company/folders.svg",
    },
    {
      key: "completed",
      titleKey: "overview.stats.completed.title",
      value: String(cards?.completed_this_period.value ?? 0),
      trendKey: "overview.stats.completed.trend",
      changePercentage: cards?.completed_this_period.change_percentage ?? 0,
      tone: "success",
      iconSrc: "/company/rightsign.svg",
    },
    {
      key: "delayed",
      titleKey: "overview.stats.delayed.title",
      value: String(cards?.delayed_requests.value ?? 0),
      trendKey: "overview.stats.delayed.trend",
      changePercentage: cards?.delayed_requests.change_percentage ?? 0,
      tone: "danger",
      iconSrc: "/company/alert.svg",
    },
    {
      key: "acceptance",
      titleKey: "overview.stats.acceptance.title",
      value: `${cards?.acceptance_rate.value ?? 0}%`,
      trendKey: "overview.stats.acceptance.trend",
      changePercentage: cards?.acceptance_rate.change_percentage ?? 0,
      tone: "purple",
      iconSrc: "/company/star.svg",
    },
  ];
  const monthKeys = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"] as const;
  const requestsOverTimeData: RequestsChartPoint[] = (report?.charts.requests_over_time ?? []).map((item) => ({
    key: String(item.month),
    monthKey: `overview.months.${monthKeys[item.month - 1] ?? "jan"}`,
    value: item.total,
  }));
  const totals = new Map(
    (report?.charts.status_distribution ?? []).map((item) => [item.status, item.total]),
  );
  const sumStatuses = (...statuses: string[]) =>
    statuses.reduce((sum, status) => sum + (totals.get(status) ?? 0), 0);
  const statusDonutData: StatusDonutItem[] = [
    { key: "pending", labelKey: "overview.status.pending", value: sumStatuses("draft", "pending"), tone: "warning" },
    { key: "inProgress", labelKey: "overview.status.inProgress", value: sumStatuses("started", "in_progress", "reopened"), tone: "info" },
    { key: "completed", labelKey: "overview.status.completed", value: sumStatuses("completed", "accepted"), tone: "success" },
    { key: "failed", labelKey: "overview.status.failed", value: sumStatuses("worker_cancelled", "company_cancelled", "rejected", "failed"), tone: "danger" },
  ];
  const statusItems = statusDonutData.map((item) => ({ ...item, label: t(item.labelKey) }));

  return (
    <div className="min-w-0 space-y-4 px-4 py-6 sm:py-7 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-2xl font-bold leading-tight text-foreground sm:text-3xl">{t("overview.title")}</h1>
          <p className="mt-2 text-base font-medium text-muted-foreground sm:text-lg">{t("overview.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" className="h-10 flex-1 gap-3 rounded-lg border-border bg-card px-4 text-sm font-medium text-muted-foreground shadow-none sm:flex-none sm:px-5">
            {t("overview.filters.thisWeek")}<SidebarChevronIcon className="size-4" />
          </Button>
          <Button asChild className="h-10 flex-1 rounded-lg px-4 text-sm font-semibold text-white hover:text-white sm:flex-none sm:px-5">
            <Link href={ROUTES.dashboardCreateRequest}><AddIcon className="size-4" />{t("overview.actions.createRequest")}</Link>
          </Button>
        </div>
      </div>
      {reportQuery.isError ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t("overview.errors.report")}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy={reportQuery.isPending}>
        {dashboardStats.map((item) => {
          const changePercentage = item.changePercentage ?? 0;
          return (
            <DashboardStatCard
              key={item.key}
              item={item}
              title={t(item.titleKey)}
              trend={t("overview.stats.change", {
                value:
                  changePercentage > 0
                    ? `+${changePercentage}`
                    : changePercentage,
              })}
            />
          );
        })}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,1fr)]">
        <ChartCard title={t("overview.charts.requestsOverTime")} action={<Button type="button" variant="outline" className="h-9 gap-3 rounded-lg border-border bg-card px-4 text-xs font-medium text-muted-foreground shadow-none">{t("overview.filters.thisWeek")}<SidebarChevronIcon className="size-3.5" /></Button>}>
          <RequestsChart data={requestsOverTimeData} months={requestsOverTimeData.map((item) => t(item.monthKey))} />
        </ChartCard>
        <ChartCard><StatusDonutChart items={statusItems} /></ChartCard>
      </div>
      <RequestsTable rows={requestRows} labels={{ title: t("overview.table.title"), requestId: t("overview.table.columns.requestId"), location: t("overview.table.columns.location"), assignedBy: t("overview.table.columns.assignedBy"), time: t("overview.table.columns.time"), status: t("overview.table.columns.status"), action: t("overview.table.columns.action"), delete: t("overview.table.actions.delete"), edit: t("overview.table.actions.edit") }} resolveText={(key) => t(key)} resolveStatus={(status: RequestStatus) => t(`overview.status.${status}`)} />
    </div>
  );
}
