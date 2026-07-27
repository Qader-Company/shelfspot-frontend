"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { ROUTES } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { useDeleteTaskMutation } from "@/modules/company/requests/delete/use-mutation";
import type { CompanyTaskListItem, DashboardRequestRow } from "@/modules/company/requests/list/types";
import { useTasksQuery } from "@/modules/company/requests/list/use-query";
import { DashboardRequestsTable } from "@/modules/company/requests/list/table";
import { AddIcon, PaginationNextIcon, PaginationPreviousIcon } from "@/shared/components/dashboard/dashboard-icons";
import { DeleteConfirmDialog } from "@/shared/components/dashboard/delete-confirm-dialog";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import type { StatusBadgeStatus } from "@/shared/components/dashboard/status-badge";
import { DashboardStatCard } from "@/shared/components/dashboard/widgets/dashboard-stat-card";
import type { DashboardStatItem } from "@/shared/components/dashboard/widgets/types";
import { EmptyState, ErrorState, PageLoadingSkeleton } from "@/shared/components/feedback";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { Button } from "@/shared/ui/button";

const requestStats = [
  { key: "total", titleKey: "requestsPage.stats.total.title", value: "0", trendKey: "requestsPage.stats.total.trend", tone: "info", iconSrc: "/company/folders.svg" },
  { key: "completed", titleKey: "requestsPage.stats.completed.title", value: "0", trendKey: "requestsPage.stats.completed.trend", tone: "success", iconSrc: "/company/rightsign.svg" },
  { key: "delayed", titleKey: "requestsPage.stats.delayed.title", value: "0", trendKey: "requestsPage.stats.delayed.trend", tone: "danger", iconSrc: "/company/alert.svg" },
  { key: "acceptance", titleKey: "requestsPage.stats.acceptance.title", value: "0%", trendKey: "requestsPage.stats.acceptance.trend", tone: "purple", iconSrc: "/company/star.svg" },
] satisfies DashboardStatItem[];

const statusOptions = [
  ["draft", "draft"], ["pending", "pending"], ["accepted", "accepted"],
  ["started", "started"], ["in_progress", "inProgress"], ["completed", "completed"],
  ["rejected", "rejected"], ["failed", "failed"], ["company_cancelled", "canceled"],
] as const;

function badgeStatus(status: CompanyTaskListItem["status"]): StatusBadgeStatus {
  if (status === "started" || status === "in_progress") return "inProgress";
  if (status === "worker_cancelled" || status === "company_cancelled") return "canceled";
  if (status === "draft") return "pending";
  return status;
}

function formatCreatedAt(value: string, locale: string) {
  const date = new Date(value.replace(" ", "T"));
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function DashboardRequestsPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState("");
  const tasksQuery = useTasksQuery({ page, status: status || undefined });
  const deleteMutation = useDeleteTaskMutation();
  const tasks = useMemo(() => tasksQuery.data?.data ?? [], [tasksQuery.data?.data]);

  const rows = useMemo<DashboardRequestRow[]>(() => tasks
    .filter((task) => {
      const term = search.trim().toLocaleLowerCase();
      if (!term) return true;
      return [String(task.id), `req-${task.id}`, task.location.location_name,
        task.location.address, task.assigned_worker?.name, task.created_by,
        task.status, task.status_label]
        .some((value) => value?.toLocaleLowerCase().includes(term));
    })
    .map((task) => ({
      id: `REQ-${task.id}`,
      taskId: task.id,
      location: task.location.location_name || task.location.address || "—",
      assignee: task.assigned_worker?.name || "—",
      time: formatCreatedAt(task.created_at, locale),
      status: badgeStatus(task.status),
      statusLabel: task.status_label,
      canEdit: task.status === "draft",
    })), [locale, search, tasks]);

  const completed = tasks.filter((task) => task.status === "completed").length;
  const delayed = tasks.filter((task) => task.status === "failed").length;
  const decided = tasks.filter((task) => !["draft", "pending"].includes(task.status));
  const accepted = decided.filter((task) => ["accepted", "started", "in_progress", "completed"].includes(task.status)).length;
  const stats = requestStats.map((item) => ({
    ...item,
    value: item.key === "total" ? String(tasksQuery.data?.meta?.total ?? tasks.length)
      : item.key === "completed" ? String(completed)
      : item.key === "delayed" ? String(delayed)
      : `${decided.length ? Math.round((accepted / decided.length) * 100) : 0}%`,
  }));
  const meta = tasksQuery.data?.meta;

  if (tasksQuery.isPending) return <PageLoadingSkeleton actionCount={1} cardCount={4} tableRows={6} tableColumns={7} />;
  if (tasksQuery.isError) return <ErrorState className="m-8" title={t("requestsPage.states.errorTitle")} description={t("requestsPage.states.errorDescription")} retryLabel={t("requestsPage.states.retry")} onRetry={() => void tasksQuery.refetch()} />;

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div><h1 className="text-3xl font-bold leading-tight text-foreground">{t("requestsPage.title")}</h1><p className="mt-2 text-lg font-medium text-muted-foreground">{t("requestsPage.subtitle")}</p></div>
        <Button asChild className="h-12 rounded-lg px-6 text-sm font-semibold text-white hover:text-white"><Link href={ROUTES.dashboardCreateRequest}><AddIcon className="size-5" />{t("requestsPage.actions.createRequest")}</Link></Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((item) => <DashboardStatCard key={item.key} item={item} title={t(item.titleKey)} trend="" />)}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SearchInput value={search} onChange={(event) => setSearch(event.target.value)} label={t("requestsPage.search.label")} placeholder={t("requestsPage.search.placeholder")} className="max-w-[420px]" />
        <select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label={t("requestsPage.filters.allStatuses")} className="h-10 rounded-lg border border-border bg-card px-4 text-sm text-foreground">
          <option value="">{t("requestsPage.filters.allStatuses")}</option>
          {statusOptions.map(([value, label]) => <option key={value} value={value}>{t(`requestsPage.status.${label}`)}</option>)}
        </select>
      </div>

      {rows.length ? <DashboardRequestsTable rows={rows} labels={{ requestId: t("requestsPage.table.columns.requestId"), location: t("requestsPage.table.columns.location"), assignedBy: t("requestsPage.table.columns.assignedBy"), time: t("requestsPage.table.columns.time"), status: t("requestsPage.table.columns.status"), action: t("requestsPage.table.columns.action"), selectAll: t("requestsPage.table.actions.selectAll"), selectRow: t("requestsPage.table.actions.selectRow"), delete: t("requestsPage.table.actions.delete"), edit: t("requestsPage.table.actions.edit") }} resolveStatus={(value) => t(`requestsPage.status.${value}`)} onDelete={setDeleteTarget} /> : <EmptyState title={t("requestsPage.states.emptyTitle")} description={t("requestsPage.states.emptyDescription")} />}

      <DeleteConfirmDialog isOpen={Boolean(deleteTarget)} title={t("requestsPage.deleteDialog.title")} descriptionLine1={t("requestsPage.deleteDialog.description", { id: `REQ-${deleteTarget}` })} descriptionLine2="" cancelLabel={t("requestsPage.deleteDialog.cancel")} confirmLabel={t("requestsPage.deleteDialog.confirm")} onClose={() => setDeleteTarget("")} isPending={deleteMutation.isPending} errorMessage={deleteMutation.isError ? normalizeApiError(deleteMutation.error).message || t("requestsPage.deleteDialog.error") : undefined} onConfirm={() => deleteMutation.mutate(deleteTarget, { onSuccess: () => setDeleteTarget("") })} />

      {meta && meta.last_page > 1 ? <div className="flex items-center justify-between gap-4"><Button variant="outline" disabled={page <= 1} onClick={() => setPage((value) => value - 1)}><PaginationPreviousIcon className="size-4 rtl:rotate-180" />{t("requestsPage.pagination.previous")}</Button><span className="text-sm text-muted-foreground">{page} / {meta.last_page}</span><Button variant="outline" disabled={page >= meta.last_page} onClick={() => setPage((value) => value + 1)}>{t("requestsPage.pagination.next")}<PaginationNextIcon className="size-4 rtl:rotate-180" /></Button></div> : null}
    </div>
  );
}
