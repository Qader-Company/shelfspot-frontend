import { useTranslations } from "next-intl";

import { ROUTES } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { ChartCard } from "@/modules/dashboard/components/chart-card";
import {
  dashboardStats,
  requestRows,
  requestsOverTimeData,
  statusDonutData,
  type RequestStatus,
} from "@/modules/dashboard/components/dashboard-overview.seed";
import { DashboardStatCard } from "@/modules/dashboard/components/dashboard-stat-card";
import { RequestsChart } from "@/modules/dashboard/components/requests-chart";
import { RequestsTable } from "@/modules/dashboard/components/requests-table";
import { StatusDonutChart } from "@/modules/dashboard/components/status-donut-chart";
import { AddIcon, SidebarChevronIcon } from "@/shared/components/dashboard/dashboard-icons";
import { Button } from "@/shared/ui/button";

export function DashboardOverview() {
  const t = useTranslations("dashboard");
  const statusItems = statusDonutData.map((item) => ({ ...item, label: t(item.labelKey) }));

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-tight text-foreground">{t("overview.title")}</h1>
          <p className="mt-2 text-lg font-medium text-muted-foreground">{t("overview.subtitle")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Button type="button" variant="outline" className="h-10 gap-3 rounded-lg border-border bg-card px-5 text-sm font-medium text-muted-foreground shadow-none">
            {t("overview.filters.thisWeek")}<SidebarChevronIcon className="size-4" />
          </Button>
          <Button asChild className="h-10 rounded-lg px-5 text-sm font-semibold text-white hover:text-white">
            <Link href={ROUTES.dashboardCreateRequest}><AddIcon className="size-4" />{t("overview.actions.createRequest")}</Link>
          </Button>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardStats.map((item) => <DashboardStatCard key={item.key} item={item} title={t(item.titleKey)} trend={t(item.trendKey)} />)}
      </div>
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,1fr)]">
        <ChartCard title={t("overview.charts.requestsOverTime")} action={<Button type="button" variant="outline" className="h-9 gap-3 rounded-lg border-border bg-card px-4 text-xs font-medium text-muted-foreground shadow-none">{t("overview.filters.thisWeek")}<SidebarChevronIcon className="size-3.5" /></Button>}>
          <RequestsChart data={requestsOverTimeData} months={requestsOverTimeData.map((item) => t(item.monthKey))} />
        </ChartCard>
        <ChartCard><StatusDonutChart items={statusItems} /></ChartCard>
      </div>
      <RequestsTable rows={requestRows} labels={{ title: t("overview.table.title"), requestId: t("overview.table.columns.requestId"), location: t("overview.table.columns.location"), assignedBy: t("overview.table.columns.assignedBy"), time: t("overview.table.columns.time"), status: t("overview.table.columns.status"), action: t("overview.table.columns.action"), delete: t("overview.table.actions.delete"), edit: t("overview.table.actions.edit") }} resolveText={(key) => t(key)} resolveStatus={(status: RequestStatus) => t(`overview.status.${status}`)} />
    </div>
  );
}
