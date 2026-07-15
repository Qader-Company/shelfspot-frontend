"use client";

import { useTranslations } from "next-intl";

import { ROUTES } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { ChartCard } from "@/modules/dashboard/components/chart-card";
import {
  requestRows,
  type DashboardStatItem,
  type RequestsChartPoint,
  type StatusDonutItem,
  type RequestStatus,
} from "@/modules/dashboard/components/dashboard-overview.seed";
import { DashboardStatCard } from "@/modules/dashboard/components/dashboard-stat-card";
import { RequestsChart } from "@/modules/dashboard/components/requests-chart";
import { RequestsTable } from "@/modules/dashboard/components/requests-table";
import { StatusDonutChart } from "@/modules/dashboard/components/status-donut-chart";
import { useDashboardReportQuery } from "@/modules/dashboard/hooks/use-dashboard-report-query";
import type { DashboardCardMetric } from "@/modules/dashboard/types/dashboard-report";
import { ErrorState, PageLoadingSkeleton } from "@/shared/components/feedback";
import {
  AddIcon,
  SidebarChevronIcon,
} from "@/shared/components/dashboard/dashboard-icons";
import { Button } from "@/shared/ui/button";

export function DashboardOverview() {
  const t = useTranslations("dashboard");
  const reportQuery = useDashboardReportQuery();

  if (reportQuery.isPending) {
    return (
      <PageLoadingSkeleton
        actionCount={2}
        cardCount={4}
        chartCount={2}
        tableRows={4}
        tableColumns={6}
      />
    );
  }

  if (reportQuery.isError || !reportQuery.data?.data) {
    return (
      <ErrorState
        className="m-8 min-h-[50dvh]"
        title={t("overview.error.title")}
        description={t("overview.error.description")}
        retryLabel={t("overview.error.retry")}
        onRetry={() => void reportQuery.refetch()}
      />
    );
  }

  const report = reportQuery.data.data;
  const metricToStat = (
    key: string,
    titleKey: string,
    metric: DashboardCardMetric,
    tone: DashboardStatItem["tone"],
    iconSrc: string,
    suffix = "",
  ): DashboardStatItem => ({
    key,
    titleKey,
    value: `${metric.value}${suffix}`,
    trendKey: "",
    tone,
    iconSrc,
    trend: metric.trend,
  });
  const dashboardStats = [
    metricToStat("active", "overview.stats.active.title", report.cards.active_requests, "info", "/company/folders.svg"),
    metricToStat("completed", "overview.stats.completed.title", report.cards.completed_this_period, "success", "/company/rightsign.svg"),
    metricToStat("delayed", "overview.stats.delayed.title", report.cards.delayed_requests, "danger", "/company/alert.svg"),
    metricToStat("acceptance", "overview.stats.acceptance.title", report.cards.acceptance_rate, "purple", "/company/star.svg", "%"),
  ];
  const cardMetrics = [
    report.cards.active_requests,
    report.cards.completed_this_period,
    report.cards.delayed_requests,
    report.cards.acceptance_rate,
  ];
  const formatChange = (metric: DashboardCardMetric) => {
    const sign = metric.trend > 0 ? "+" : metric.trend < 0 ? "-" : "";
    return `${sign}${Math.abs(metric.change_percentage)}`;
  };
  const monthKeys = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];
  const requestsOverTimeData: RequestsChartPoint[] = report.charts.requests_over_time.map((item) => ({
    key: String(item.month),
    monthKey: `overview.months.${monthKeys[item.month - 1] ?? "jan"}`,
    value: item.total,
  }));
  const statusTotals = new Map(report.charts.status_distribution.map((item) => [item.status, item.total]));
  const sumStatuses = (...statuses: string[]) => statuses.reduce((sum, status) => sum + (statusTotals.get(status) ?? 0), 0);
  const statusDonutData: StatusDonutItem[] = [
    { key: "pending", labelKey: "overview.status.pending", value: sumStatuses("draft", "pending"), tone: "warning" },
    { key: "inProgress", labelKey: "overview.status.inProgress", value: sumStatuses("accepted", "started", "in_progress", "reopened"), tone: "info" },
    { key: "completed", labelKey: "overview.status.completed", value: sumStatuses("completed"), tone: "success" },
    { key: "failed", labelKey: "overview.status.failed", value: sumStatuses("worker_cancelled", "company_cancelled", "rejected", "failed"), tone: "danger" },
  ];

  const statusItems = statusDonutData.map((item) => ({
    ...item,
    label: t(item.labelKey),
  }));

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-tight text-foreground">
            {t("overview.title")}
          </h1>
          <p className="mt-2 text-lg font-medium text-muted-foreground">
            {t("overview.subtitle")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-10 gap-3 rounded-lg border-border bg-card px-5 text-sm font-medium text-muted-foreground shadow-none"
          >
            {t("overview.filters.thisWeek")}
            <SidebarChevronIcon className="size-4" />
          </Button>
          <Button
            asChild
            className="h-10 rounded-lg px-5 text-sm font-semibold text-white hover:text-white"
          >
            <Link href={ROUTES.dashboardCreateRequest}>
              <AddIcon className="size-4" />
              {t("overview.actions.createRequest")}
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((item, index) => (
          <DashboardStatCard
            key={item.key}
            item={item}
            title={t(item.titleKey)}
            trend={t("overview.stats.change", {
              value: formatChange(cardMetrics[index]),
            })}
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,1fr)]">
        <ChartCard
          title={t("overview.charts.requestsOverTime")}
          action={
            <Button
              type="button"
              variant="outline"
              className="h-9 gap-3 rounded-lg border-border bg-card px-4 text-xs font-medium text-muted-foreground shadow-none"
            >
              {t("overview.filters.thisWeek")}
              <SidebarChevronIcon className="size-3.5" />
            </Button>
          }
        >
          <RequestsChart
            data={requestsOverTimeData}
            months={requestsOverTimeData.map((item) => t(item.monthKey))}
          />
        </ChartCard>

        <ChartCard>
          <StatusDonutChart items={statusItems} />
        </ChartCard>
      </div>

      <RequestsTable
        rows={requestRows}
        labels={{
          title: t("overview.table.title"),
          requestId: t("overview.table.columns.requestId"),
          location: t("overview.table.columns.location"),
          assignedBy: t("overview.table.columns.assignedBy"),
          time: t("overview.table.columns.time"),
          status: t("overview.table.columns.status"),
          action: t("overview.table.columns.action"),
          delete: t("overview.table.actions.delete"),
          edit: t("overview.table.actions.edit"),
        }}
        resolveText={(key) => t(key)}
        resolveStatus={(status: RequestStatus) => t(`overview.status.${status}`)}
      />
    </div>
  );
}
