"use client";

import { useMemo, useState } from "react";
import { useLocale, useTranslations } from "next-intl";

import { ROUTES } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import { useDeleteTaskMutation } from "@/modules/company/requests/delete/use-mutation";
import type { CompanyTaskListItem, DashboardRequestRow } from "@/modules/company/requests/list/types";
import { useTasksQuery } from "@/modules/company/requests/list/use-query";
import { useStoreOptionsQuery } from "@/modules/company/stores/hooks";
import { DashboardRequestsTable } from "@/modules/company/requests/list/table";
import { AddIcon, PaginationNextIcon, PaginationPreviousIcon } from "@/shared/components/dashboard/dashboard-icons";
import { DeleteConfirmDialog } from "@/shared/components/dashboard/delete-confirm-dialog";
import { SlidersHorizontal, RotateCcw } from "lucide-react";
import type { StatusBadgeStatus } from "@/shared/components/dashboard/status-badge";
import { EmptyState, ErrorState, PageLoadingSkeleton } from "@/shared/components/feedback";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { Button } from "@/shared/ui/button";
import { PermissionGate } from "@/shared/components/auth/permission-provider";

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
    ? value || "\u2014"
    : new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

export function DashboardRequestsPage() {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [filters, setFilters] = useState({ storeId: "", from: "", to: "" });
  const updateFilter = (key: keyof typeof filters, value: string) => { setFilters((previous) => ({ ...previous, [key]: value })); setPage(1); };
  const hasFilters = Boolean(status || Object.values(filters).some(Boolean));
  const [deleteTarget, setDeleteTarget] = useState("");
  const tasksQuery = useTasksQuery({ page, status: status || undefined, date_from: filters.from || undefined, date_to: filters.to || undefined, store_id: filters.storeId || undefined });
  const storesQuery = useStoreOptionsQuery();
  const deleteMutation = useDeleteTaskMutation();
  const tasks = useMemo(() => tasksQuery.data?.data ?? [], [tasksQuery.data?.data]);

  const lastPage = tasksQuery.data?.meta?.last_page ?? 1;
  const currentPage = page;
  const rows = useMemo<DashboardRequestRow[]>(() => tasks
    .map((task) => ({
      id: `REQ-${task.id}`,
      taskId: task.id,
      location: task.location?.location_name || task.location?.address || "—",
      assignee: task.assigned_worker?.name || "—",
      time: formatCreatedAt(task.created_at || task.date || "", locale),
      status: badgeStatus(task.status),
      statusLabel: task.status_label,
      canEdit: task.status === "draft",
    })), [locale, tasks]);

  if (tasksQuery.isPending) return <PageLoadingSkeleton actionCount={1} cardCount={0} tableRows={6} tableColumns={7} />;
  if (tasksQuery.isError) return <ErrorState className="m-8" title={t("requestsPage.states.errorTitle")} description={t("requestsPage.states.errorDescription")} retryLabel={t("requestsPage.states.retry")} onRetry={() => void tasksQuery.refetch()} />;

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div><h1 className="text-3xl font-bold leading-tight text-foreground">{t("requestsPage.title")}</h1><p className="mt-2 text-lg font-medium text-muted-foreground">{t("requestsPage.subtitle")}</p></div>
        <PermissionGate permission="create_task"><Button asChild className="h-12 rounded-lg px-6 text-sm font-semibold text-white hover:text-white"><Link href={ROUTES.dashboardCreateRequest}><AddIcon className="size-5" />{t("requestsPage.actions.createRequest")}</Link></Button></PermissionGate>
      </div>

      <section aria-label={t("requestsPage.filters.title")} className="rounded-xl border border-primary/20 bg-card p-4 shadow-sm">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold"><span className="rounded-lg bg-primary/10 p-2 text-primary"><SlidersHorizontal className="size-4" /></span>{t("requestsPage.filters.title")}<span aria-live="polite" className="rounded-full bg-primary/10 px-2.5 py-1 text-xs text-primary">{t("requestsPage.filters.results", { count: tasksQuery.data?.meta?.total ?? tasks.length })}</span></div>
          <Button variant="ghost" size="sm" disabled={!hasFilters} onClick={() => { setFilters({ storeId: "", from: "", to: "" }); setStatus(""); setPage(1); }} className="text-primary"><RotateCcw className="size-3.5" />{t("requestsPage.filters.reset")}</Button>
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="min-w-0 space-y-1.5 text-xs font-medium text-muted-foreground"><span>{t("requestsPage.filters.location")}</span><select value={filters.storeId} disabled={storesQuery.isPending || storesQuery.isError} onChange={(event) => updateFilter("storeId", event.target.value)} className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"><option value="">{t("requestsPage.filters.allStores")}</option>{storesQuery.data?.map((store) => <option key={store.id} value={store.id}>{store.name}{store.number ? " #" + store.number : ""}</option>)}</select>{storesQuery.isError ? <button type="button" className="text-destructive underline" onClick={() => void storesQuery.refetch()}>{t("requestsPage.states.retry")}</button> : null}</label>
          <label className="min-w-0 space-y-1.5 text-xs font-medium text-muted-foreground"><span>{t("requestsPage.table.columns.status")}</span><select value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15"><option value="">{t("requestsPage.filters.allStatuses")}</option>{statusOptions.map(([value, label]) => <option key={value} value={value}>{t("requestsPage.status." + label)}</option>)}</select></label>
          {(["from", "to"] as const).map((key) => <label key={key} className="min-w-0 space-y-1.5 text-xs font-medium text-muted-foreground"><span>{t("requestsPage.filters." + key)}</span><input type="date" value={filters[key]} min={key === "to" ? filters.from || undefined : undefined} max={key === "from" ? filters.to || undefined : undefined} onChange={(event) => updateFilter(key, event.target.value)} className="h-11 w-full min-w-0 rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus:border-primary focus:ring-2 focus:ring-primary/15" /></label>)}
        </div>
      </section>

      {rows.length ? <DashboardRequestsTable rows={rows} labels={{ requestId: t("requestsPage.table.columns.requestId"), location: t("requestsPage.table.columns.location"), assignedBy: t("requestsPage.table.columns.assignedBy"), time: t("requestsPage.table.columns.time"), status: t("requestsPage.table.columns.status"), action: t("requestsPage.table.columns.action"), selectAll: t("requestsPage.table.actions.selectAll"), selectRow: t("requestsPage.table.actions.selectRow"), delete: t("requestsPage.table.actions.delete"), edit: t("requestsPage.table.actions.edit") }} resolveStatus={(value) => t(`requestsPage.status.${value}`)} onDelete={setDeleteTarget} /> : <EmptyState title={t("requestsPage.states.emptyTitle")} description={t("requestsPage.states.emptyDescription")} />}

      <DeleteConfirmDialog isOpen={Boolean(deleteTarget)} title={t("requestsPage.deleteDialog.title")} descriptionLine1={t("requestsPage.deleteDialog.description", { id: `REQ-${deleteTarget}` })} descriptionLine2="" cancelLabel={t("requestsPage.deleteDialog.cancel")} confirmLabel={t("requestsPage.deleteDialog.confirm")} onClose={() => setDeleteTarget("")} isPending={deleteMutation.isPending} errorMessage={deleteMutation.isError ? normalizeApiError(deleteMutation.error).message || t("requestsPage.deleteDialog.error") : undefined} onConfirm={() => deleteMutation.mutate(deleteTarget, { onSuccess: () => setDeleteTarget("") })} />

      {lastPage > 1 ? <div className="flex items-center justify-between gap-4"><Button variant="outline" disabled={tasksQuery.isFetching || currentPage <= 1} onClick={() => setPage(currentPage - 1)}><PaginationPreviousIcon className="size-4 rtl:rotate-180" />{t("requestsPage.pagination.previous")}</Button><span className="text-sm text-muted-foreground">{currentPage} / {lastPage}</span><Button variant="outline" disabled={tasksQuery.isFetching || currentPage >= lastPage} onClick={() => setPage(currentPage + 1)}>{t("requestsPage.pagination.next")}<PaginationNextIcon className="size-4 rtl:rotate-180" /></Button></div> : null}
    </div>
  );
}
