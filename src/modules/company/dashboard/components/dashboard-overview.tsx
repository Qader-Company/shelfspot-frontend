"use client";

import { useState } from "react";
import { PeriodFilter, getPeriodRange, type DashboardPeriod } from "./period-filter";
import { useLocale, useTranslations } from "next-intl";

import { ROUTES } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { LiveRequests } from "./live-requests";
import { usePeriodTasks } from "../hooks/use-period-tasks";

import { AddIcon } from "@/shared/components/dashboard/dashboard-icons";
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
  const [period, setPeriod] = useState<DashboardPeriod>("week");
  const range = getPeriodRange(period);
  const locale = useLocale();
  const tasksQuery = usePeriodTasks(range);
  const tasks = tasksQuery.data ?? [];
  const pending = tasks.filter(task => ["draft", "pending"].includes(task.status)).length;
  const active = tasks.filter(task => ["pending", "accepted", "started", "in_progress", "reopened"].includes(task.status));
  const completed = tasks.filter(task => task.status === "completed").length;
  const today = getPeriodRange("today").date_from;
  const delayed = active.filter(task => task.date && task.date.slice(0, 10) < today).length;
  const dashboardStats: DashboardStatItem[] = [
    {
      key: "total",
      titleKey: "requestsPage.stats.total.title",
      value: tasksQuery.isSuccess ? String(tasks.length) : "\u2014",
      trendKey: "requestsPage.stats.total.trend",
      tone: "purple",
      iconSrc: "/company/folders.svg",
    },
    {
      key: "active",
      titleKey: "overview.stats.active.title",
      value: tasksQuery.isSuccess ? String(active.length) : "\u2014",
      trendKey: "overview.stats.active.trend",
      tone: "info",
      iconSrc: "/company/folders.svg",
    },
    {
      key: "completed",
      titleKey: "overview.periods.completed",
      value: tasksQuery.isSuccess ? String(completed) : "\u2014",
      trendKey: "overview.stats.completed.trend",
      tone: "success",
      iconSrc: "/company/rightsign.svg",
    },
    {
      key: "delayed",
      titleKey: "overview.stats.delayed.title",
      value: tasksQuery.isSuccess ? String(delayed) : "\u2014",
      trendKey: "overview.stats.delayed.trend",
      tone: "danger",
      iconSrc: "/company/alert.svg",
    },
  ];
  const bucketDates: Date[] = [];
  const cursor = new Date(range.date_from + "T00:00:00");
  const end = new Date(range.date_to + "T00:00:00");
  while (cursor <= end) { bucketDates.push(new Date(cursor)); if (period === "year") cursor.setMonth(cursor.getMonth() + 1); else cursor.setDate(cursor.getDate() + 1); }
  const requestsOverTimeData: RequestsChartPoint[] = bucketDates.map((date, index) => {
    const key = getPeriodRange("today", date).date_from;
    const label = new Intl.DateTimeFormat(locale, period === "year" ? { month: "short" } : { month: "short", day: "numeric" }).format(date);
    return { key, monthKey: period === "month" && index % 5 !== 0 && index !== bucketDates.length - 1 ? "" : label, value: tasks.filter(task => (task.date || task.created_at || "").slice(0, period === "year" ? 7 : 10) === key.slice(0, period === "year" ? 7 : 10)).length };
  });
  const statusDonutData: StatusDonutItem[] = [
    { key: "pending", labelKey: "overview.status.pending", value: pending, tone: "warning" },
    { key: "inProgress", labelKey: "overview.status.inProgress", value: tasks.filter(task => ["accepted", "started", "in_progress", "reopened"].includes(task.status)).length, tone: "info" },
    { key: "completed", labelKey: "overview.status.completed", value: completed, tone: "success" },
    { key: "failed", labelKey: "overview.status.failed", value: tasks.filter(task => ["worker_cancelled", "company_cancelled", "rejected", "failed"].includes(task.status)).length, tone: "danger" },
  ];
  const statusItems = statusDonutData.map((item) => ({ ...item, label: t(item.labelKey) }));

  return (
    <div className="min-w-0 space-y-4 px-4 py-5 sm:py-7 lg:px-8 lg:py-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div className="min-w-0">
          <h1 className="text-[clamp(1.5rem,5vw,1.875rem)] leading-tight font-bold text-foreground">{t("overview.title")}</h1>
          <p className="mt-1.5 text-[clamp(0.875rem,3vw,1.125rem)] leading-[1.5] font-medium text-muted-foreground sm:mt-2">{t("overview.subtitle")}</p>
        </div>
        <div className="grid w-full grid-cols-1 gap-3 min-[420px]:grid-cols-2 md:flex md:w-auto md:flex-wrap md:items-center">
          <PeriodFilter value={period} onChange={setPeriod} />
          <Button asChild className="h-10 w-full rounded-lg px-4 text-sm font-semibold text-white hover:text-white md:w-auto md:px-5">
            <Link href={ROUTES.dashboardCreateRequest}><AddIcon className="size-4" />{t("overview.actions.createRequest")}</Link>
          </Button>
        </div>
      </div>
      {tasksQuery.isError ? (
        <p className="rounded-lg border border-destructive/20 bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {t("overview.errors.report")}
        </p>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4" aria-busy={tasksQuery.isPending}>
        {dashboardStats.map((item) => {

          return (
            <DashboardStatCard
              key={item.key}
              item={item}
              title={t(item.titleKey)}
              trend=""
            />
          );
        })}
      </div>
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.5fr)_minmax(20rem,1fr)]">
        <ChartCard title={t("overview.charts.requestsOverTime")} action={<PeriodFilter value={period} onChange={setPeriod} />}>
          <RequestsChart data={requestsOverTimeData} months={requestsOverTimeData.map((item) => item.monthKey)} />
        </ChartCard>
        <ChartCard><StatusDonutChart items={statusItems} /></ChartCard>
      </div>
      <LiveRequests range={range} />
    </div>
  );
}
