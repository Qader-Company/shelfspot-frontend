"use client";
import { Building2, FileText, Mail, Phone, Zap } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { StatusBadge } from "@/shared/components/dashboard/status-badge";
import type { AdminCompany } from "./types";

export function CompanySummary({ item }: { item: AdminCompany }) {
  const t = useTranslations("adminDashboard.companies.details");
  const locale = useLocale();
  const active = item.active ?? (
    item.is_active === true ||
    item.is_active === 1 ||
    item.is_active === "1"
  );
  const industry = typeof item.industry === "string" ? item.industry : item.industry?.name ?? "—";
  const createdDate = item.created_at ? new Date(item.created_at.replace(" ", "T")) : null;
  const created = createdDate && !Number.isNaN(createdDate.getTime())
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(createdDate)
    : "—";
  const details = [
    { label: t("industry"), value: industry, icon: Building2, tone: "bg-destructive/10 text-destructive" },
    { label: t("email"), value: item.work_email ?? item.email ?? "—", icon: Mail, tone: "bg-accent text-accent-foreground" },
    { label: t("crNumber"), value: item.cr_number ?? "—", icon: FileText, tone: "bg-success/10 text-success" },
    { label: t("phone"), value: item.phone ?? "—", icon: Phone, tone: "bg-secondary text-secondary-foreground" },
  ];

  return (<section className="@container min-w-0 space-y-6 rounded-xl border border-border bg-card p-4 sm:p-6">
        <div className="flex min-w-0 flex-col gap-4 @min-[40rem]:flex-row @min-[40rem]:items-start @min-[40rem]:justify-between"><div className="flex min-w-0 flex-wrap items-center gap-3"><span className="shrink-0 rounded-full bg-success/10 p-3 text-success"><Zap className="size-5" /></span><h2 className="min-w-0 break-words text-lg font-bold sm:text-xl">{item.name}</h2><StatusBadge status={active ? "active" : "inactive"} label={active ? t("active") : t("inactive")} /></div><div className="shrink-0"><p className="text-xs text-muted-foreground">{t("createdOn")}</p><p className="text-sm font-medium">{created}</p></div></div>
        <dl className="grid min-w-0 grid-cols-1 gap-5 @min-[28rem]:grid-cols-2 @min-[52rem]:grid-cols-4">{details.map(({ label, value, icon: Icon, tone }) => <div key={label} className="flex min-w-0 items-start gap-3"><span className={`shrink-0 rounded-full p-2 ${tone}`}><Icon className="size-4" /></span><div className="min-w-0"><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 break-words text-sm font-medium [overflow-wrap:anywhere]">{String(value)}</dd></div></div>)}</dl>
      </section>);
}
