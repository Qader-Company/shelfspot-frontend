"use client";
import { useTranslations } from "next-intl";
export type DashboardPeriod = "today" | "week" | "month" | "year";
export function getPeriodRange(period: DashboardPeriod, now = new Date()) {
  const from = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const to = new Date(from);
  if (period === "week") { from.setDate(from.getDate() - from.getDay()); to.setTime(from.getTime()); to.setDate(to.getDate() + 6); }
  if (period === "month") { from.setDate(1); to.setMonth(to.getMonth() + 1, 0); }
  if (period === "year") { from.setMonth(0, 1); to.setMonth(11, 31); }
  const format = (date: Date) => [date.getFullYear(), String(date.getMonth() + 1).padStart(2, "0"), String(date.getDate()).padStart(2, "0")].join("-");
  return { date_from: format(from), date_to: format(to) };
}
export function PeriodFilter({ value, onChange }: { value: DashboardPeriod; onChange: (period: DashboardPeriod) => void }) {
  const t = useTranslations("dashboard.overview.periods");
  return <select aria-label={t("label")} value={value} onChange={event => onChange(event.target.value as DashboardPeriod)} className="h-10 w-full rounded-lg border border-border bg-card px-4 text-sm font-medium text-muted-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 md:w-auto">{(["today", "week", "month", "year"] as const).map(period => <option key={period} value={period}>{t(period)}</option>)}</select>;
}
