"use client";

import {
  Boxes,
  ArrowLeft,
  Building2,
  CircleCheck,
  Clock3,
  Coins,
  FileText,
  Mail,
  Package,
  Phone,
  Zap,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import {
  StatusBadge,
  type StatusBadgeStatus,
} from "@/shared/components/dashboard/status-badge";
import { EmptyState, ErrorState, PageLoadingSkeleton } from "@/shared/components/feedback";
import { Button } from "@/shared/ui/button";

import { useCompany } from "./hooks";

export function CompanyDetailsPage({ companyId }: { companyId: string }) {
  const t = useTranslations("adminDashboard.companies.details");
  const locale = useLocale();
  const company = useCompany(companyId);

  if (company.isLoading) return <PageLoadingSkeleton label={t("loading")} cardCount={5} tableRows={3} tableColumns={4} />;
  if (company.isError) return <ErrorState title={t("error")} retryLabel={t("retry")} onRetry={() => company.refetch()} className="m-8" />;
  if (!company.data) return <EmptyState title={t("notFound")} className="m-8" />;

  const item = company.data;
  const active = item.active ?? (
    item.is_active === true ||
    item.is_active === 1 ||
    item.is_active === "1"
  );
  const industry = typeof item.industry === "string" ? item.industry : item.industry?.name ?? "—";
  const created = item.created_at
    ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(new Date(item.created_at))
    : "—";
  const details = [
    { label: t("industry"), value: industry, icon: Building2, tone: "bg-destructive/10 text-destructive" },
    { label: t("email"), value: item.work_email ?? item.email ?? "—", icon: Mail, tone: "bg-accent text-accent-foreground" },
    { label: t("crNumber"), value: item.cr_number ?? "—", icon: FileText, tone: "bg-success/10 text-success" },
    { label: t("phone"), value: item.phone ?? "—", icon: Phone, tone: "bg-secondary text-secondary-foreground" },
  ];
  const catalog = ["brand", "sub-brand", "category", "sub-category", "product"] as const;
  const stats = [
    { label: t("stats.totalRequests"), value: item.total_requests_count ?? 0, icon: Package, tone: "bg-primary/10 text-primary" },
    { label: t("stats.completed"), value: item.completed_requests_count ?? 0, icon: CircleCheck, tone: "bg-destructive/10 text-destructive" },
    { label: t("stats.pending"), value: item.pending_requests_count ?? 0, icon: Clock3, tone: "bg-success/10 text-success" },
    { label: t("stats.spending"), value: item.total_spending ?? 0, icon: Coins, tone: "bg-warning/10 text-warning" },
    { label: t("stats.products"), value: item.total_products_count ?? 0, icon: Boxes, tone: "bg-accent text-accent-foreground" },
  ];
  const statusLabels: Record<string, string> = {
    draft: t("statuses.draft"),
    pending: t("statuses.pending"),
    completed: t("statuses.completed"),
    failed: t("statuses.failed"),
    cancelled: t("statuses.cancelled"),
    canceled: t("statuses.cancelled"),
    rejected: t("statuses.rejected"),
    in_progress: t("statuses.inProgress"),
  };
  const badgeStatuses: Record<string, StatusBadgeStatus> = {
    draft: "draft",
    pending: "pending",
    completed: "completed",
    failed: "failed",
    cancelled: "canceled",
    canceled: "canceled",
    rejected: "rejected",
    in_progress: "inProgress",
  };

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      <div className="flex items-center gap-3"><Button asChild variant="ghost" size="icon-sm"><Link href="/admin/companies" aria-label={t("back")}><ArrowLeft className="size-5 rtl:rotate-180" /></Link></Button><h1 className="text-3xl font-bold">{t("title")}</h1></div>
      <section className="space-y-6 rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><div className="flex items-center gap-3"><span className="rounded-full bg-success/10 p-3 text-success"><Zap className="size-5" /></span><h2 className="text-xl font-bold">{item.name}</h2><StatusBadge status={active ? "active" : "inactive"} label={active ? t("active") : t("inactive")} /></div><div><p className="text-xs text-muted-foreground">{t("createdOn")}</p><p className="text-sm font-medium">{created}</p></div></div>
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">{details.map(({ label, value, icon: Icon, tone }) => <div key={label} className="flex items-start gap-3"><span className={`rounded-full p-2 ${tone}`}><Icon className="size-4" /></span><div><dt className="text-xs text-muted-foreground">{label}</dt><dd className="mt-1 text-sm font-medium">{String(value)}</dd></div></div>)}</dl>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        {stats.map(({ label, value, icon: Icon, tone }) => (
          <article key={label} className="rounded-xl border border-border bg-card p-5">
            <span className={`inline-flex rounded-full p-3 ${tone}`}><Icon className="size-5" /></span>
            <p className="mt-4 text-sm text-muted-foreground">{label}</p>
            <p className="mt-1 text-2xl font-bold">{new Intl.NumberFormat(locale).format(value)}</p>
          </article>
        ))}
      </section>
      <section className="rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between gap-4"><h2 className="text-lg font-bold">{t("history.title")}</h2><Link href={`/admin/requests?company_id=${encodeURIComponent(companyId)}`} className="text-sm font-medium text-primary underline-offset-4 hover:underline">{t("history.viewAll")}</Link></div>
        {(item.latest_tasks ?? []).length === 0 ? (
          <EmptyState title={t("history.empty")} variant="plain" />
        ) : (
          <div className="mt-4 overflow-x-auto rounded-lg border border-border">
            <table className="w-full min-w-[640px] text-sm">
              <thead><tr className="border-b border-border"><th className="p-4 text-start">{t("history.requestId")}</th><th className="p-4 text-start">{t("history.location")}</th><th className="p-4 text-start">{t("history.time")}</th><th className="p-4 text-start">{t("history.status")}</th></tr></thead>
              <tbody>{(item.latest_tasks ?? []).map((task) => {
                const taskDate = task.created_at ?? task.date;
                return <tr key={task.id} className="border-b border-border last:border-0"><td className="p-4">{t("history.requestNumber", { id: task.id })}</td><td className="p-4">{task.location?.location_name ?? task.location?.address ?? "—"}</td><td className="p-4">{taskDate ? new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: task.created_at ? "short" : undefined }).format(new Date(taskDate)) : "—"}</td><td className="p-4"><StatusBadge status={badgeStatuses[task.status] ?? "pending"} label={statusLabels[task.status] ?? task.status_label ?? task.status} /></td></tr>;
              })}</tbody>
            </table>
          </div>
        )}
      </section>
      <section className="rounded-xl border border-border bg-card p-5"><h2 className="text-lg font-bold">{t("catalogTitle")}</h2><div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-5">{catalog.map((resource) => <article key={resource} className="rounded-xl border border-border p-4 text-center"><h3 className="font-semibold">{t(`catalog.${resource}.title`)}</h3><p className="mt-1 text-xs text-muted-foreground">{t(`catalog.${resource}.description`)}</p><Button asChild className="mt-4 w-full"><Link href={`/admin/companies/${companyId}/catalog/${resource}`}>{t("manage")}</Link></Button></article>)}</div></section>
    </div>
  );
}
