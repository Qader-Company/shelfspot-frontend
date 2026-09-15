"use client";
import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { useTasksQuery } from "@/modules/company/requests/list/use-query";
import { useDeleteTaskMutation } from "@/modules/company/requests/delete/use-mutation";
import { DashboardRequestsTable } from "@/modules/company/requests/list/table";
import type { DashboardRequestRow } from "@/modules/company/requests/list/types";
import { DeleteConfirmDialog } from "@/shared/components/dashboard/delete-confirm-dialog";
import { EmptyState, ErrorState, PageLoadingSkeleton } from "@/shared/components/feedback";
import { formatApiError } from "@/shared/lib/api/errors";

export function LiveRequests({ range }: { range?: { date_from: string; date_to: string } }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const query = useTasksQuery({ page: 1, ...range });
  const deletion = useDeleteTaskMutation();
  const [target, setTarget] = useState("");
  const rows: DashboardRequestRow[] = (query.data?.data ?? []).map(task => {
    const timestamp = task.created_at || task.date || "";
    const date = new Date(timestamp.replace(" ", "T"));
    const status = task.status === "started" || task.status === "in_progress" ? "inProgress" : task.status === "company_cancelled" || task.status === "worker_cancelled" ? "canceled" : task.status;
    return { id: "REQ-" + task.id, taskId: task.id, location: task.location?.location_name || task.location?.address || "\u2014", assignee: task.assigned_worker?.name || "\u2014", time: Number.isNaN(date.getTime()) ? timestamp || "\u2014" : new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date), status, statusLabel: task.status_label, canEdit: task.status === "draft" };
  });
  return <section className="min-w-0 space-y-4 rounded-xl border border-border bg-card p-4 sm:p-6">
    <header className="flex flex-wrap items-center justify-between gap-3"><h2 className="text-xl font-bold sm:text-2xl">{t("overview.table.title")}</h2><Link href="/dashboard/requests" className="text-sm font-medium text-primary hover:underline">{t("overview.table.viewAll")}</Link></header>
    {query.isPending ? <PageLoadingSkeleton cardCount={0} tableRows={4} tableColumns={6} /> : query.isError ? <ErrorState title={t("requestsPage.states.errorTitle")} retryLabel={t("requestsPage.states.retry")} onRetry={() => void query.refetch()} /> : !rows.length ? <EmptyState title={t("requestsPage.states.emptyTitle")} description={t("requestsPage.states.emptyDescription")} /> : <div className="max-h-80 overflow-auto"><DashboardRequestsTable rows={rows} labels={{ requestId: t("requestsPage.table.columns.requestId"), location: t("requestsPage.table.columns.location"), assignedBy: t("requestsPage.table.columns.assignedBy"), time: t("requestsPage.table.columns.time"), status: t("requestsPage.table.columns.status"), action: t("requestsPage.table.columns.action"), selectAll: t("requestsPage.table.actions.selectAll"), selectRow: t("requestsPage.table.actions.selectRow"), delete: t("requestsPage.table.actions.delete"), edit: t("requestsPage.table.actions.edit") }} resolveStatus={status => t("requestsPage.status." + status)} onDelete={id => { deletion.reset(); setTarget(id); }} /></div>}
    <DeleteConfirmDialog isOpen={Boolean(target)} title={t("requestsPage.deleteDialog.title")} descriptionLine1={t("requestsPage.deleteDialog.description", { id: "REQ-" + target })} descriptionLine2="" cancelLabel={t("requestsPage.deleteDialog.cancel")} confirmLabel={t("requestsPage.deleteDialog.confirm")} isPending={deletion.isPending} errorMessage={deletion.isError ? formatApiError(deletion.error) : undefined} onClose={() => setTarget("")} onConfirm={() => deletion.mutate(target, { onSuccess: () => setTarget("") })} />
  </section>;
}
