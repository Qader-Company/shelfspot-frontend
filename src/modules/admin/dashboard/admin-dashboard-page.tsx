"use client";

import { Building2, HandCoins, PackageCheck, Users } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { ChartCard } from "@/modules/dashboard/components/chart-card";
import { DashboardStatCard } from "@/modules/dashboard/components/dashboard-stat-card";
import { RequestsChart } from "@/modules/dashboard/components/requests-chart";
import { StatusDonutChart } from "@/modules/dashboard/components/status-donut-chart";
import { Button } from "@/shared/ui/button";

import { adminDashboardStats, adminRequestsOverTime, adminRequestStatus, topActiveWorkers, topCompanies, type AdminStatIcon } from "./admin-dashboard.seed";
import { AdminRankingCard } from "./admin-ranking-card";

const statIcons = { company: Building2, request: PackageCheck, worker: Users, revenue: HandCoins } satisfies Record<AdminStatIcon, typeof Building2>;

export function AdminDashboardPage() {
  const t = useTranslations("adminDashboard");
  const locale = useLocale();
  const currency = new Intl.NumberFormat(locale, { style: "currency", currency: "USD", maximumFractionDigits: 0 });
  const statusItems = adminRequestStatus.map((item) => ({ ...item, label: t(item.labelKey) }));

  return (
    <div className="space-y-6 px-4 py-7 lg:px-8 lg:py-10">
      <header>
        <h1 className="text-3xl font-bold text-foreground lg:text-4xl">{t("title")}</h1>
        <p className="mt-2 text-base text-muted-foreground lg:text-lg">{t("welcome")}</p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3" aria-label={t("summaryLabel")}>
        {adminDashboardStats.map((item) => {
          const Icon = statIcons[item.icon];
          return <DashboardStatCard key={item.key} item={item} title={t(item.titleKey)} trend={t(item.trendKey)} icon={<Icon className="size-6" aria-hidden="true" />} />;
        })}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.6fr)_minmax(20rem,1fr)]">
        <ChartCard title={t("chart.requestsOverTime")} action={<Button type="button" variant="outline" className="pointer-events-none h-10 rounded-lg text-muted-foreground">{t("chart.thisWeek")}</Button>}>
          <RequestsChart data={adminRequestsOverTime} months={adminRequestsOverTime.map((point) => t(point.monthKey))} />
        </ChartCard>
        <ChartCard title={t("chart.statusDistribution")} className="min-h-[20rem]">
          <StatusDonutChart items={statusItems} />
        </ChartCard>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminRankingCard title={t("rankings.companies")} items={topCompanies} requestLabel={(count) => t("rankings.requests", { count })} completedLabel={(count) => t("rankings.completed", { count })} formatCurrency={(value) => currency.format(value)} resolveName={(key) => t(key)} />
        <AdminRankingCard title={t("rankings.workers")} items={topActiveWorkers} requestLabel={(count) => t("rankings.requests", { count })} completedLabel={(count) => t("rankings.completed", { count })} formatCurrency={(value) => currency.format(value)} resolveName={(key) => t(key)} workerList />
      </div>
    </div>
  );
}
