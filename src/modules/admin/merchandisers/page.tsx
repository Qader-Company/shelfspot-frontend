"use client";

import { useDeferredValue, useState } from "react";
import { CircleOff, Pencil, Trash2, UserRoundPlus, UsersRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { DeleteConfirmDialog } from "@/shared/components/dashboard/delete-confirm-dialog";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import { StatusToggle } from "@/shared/components/dashboard/status-toggle";
import { EmptyState, ErrorState, PageLoadingSkeleton } from "@/shared/components/feedback";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { useDeleteMerchandiser, useMerchandisers, useUpdateMerchandiserStatus } from "./hooks";
import type { AdminMerchandiser } from "./types";

export function MerchandisersPage() {
  const t = useTranslations("adminDashboard.merchandisers");
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("all");
  const [page, setPage] = useState(1);
  const [deleteTarget, setDeleteTarget] = useState<AdminMerchandiser | null>(null);
  const [actionError, setActionError] = useState("");
  const deferredSearch = useDeferredValue(search.trim());
  const query = useMerchandisers({ search: deferredSearch, status, page, perPage: 8 });
  const deleteMutation = useDeleteMerchandiser();
  const statusMutation = useUpdateMerchandiserStatus();
  const meta = query.data?.meta;

  async function refresh() { await queryClient.invalidateQueries({ queryKey: ["admin", "merchandisers"] }); }
  async function toggle(record: AdminMerchandiser) { setActionError(""); try { await statusMutation.mutateAsync({ id: record.id, active: !record.active }); await refresh(); } catch { setActionError(t("errors.status")); } }
  async function remove() { if (!deleteTarget) return; setActionError(""); try { await deleteMutation.mutateAsync(deleteTarget.id); setDeleteTarget(null); await refresh(); } catch { setActionError(t("errors.delete")); } }

  const stats = [
    { label: t("stats.total"), value: meta?.total ?? 0, icon: UsersRound, tone: "bg-primary/10 text-primary" },
    { label: t("stats.active"), value: meta?.active ?? 0, icon: UserRoundPlus, tone: "bg-success/10 text-success" },
    { label: t("stats.inactive"), value: meta?.inactive ?? 0, icon: CircleOff, tone: "bg-destructive/10 text-destructive" },
  ];

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      <div><h1 className="text-3xl font-bold">{t("title")}</h1><p className="mt-2 text-muted-foreground">{t("subtitle")}</p></div>
      <div className="grid gap-4 md:grid-cols-3">{stats.map(({ label, value, icon: Icon, tone }) => <div key={label} className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"><span className={cn("rounded-full p-3", tone)}><Icon className="size-5" /></span><div><p className="text-sm text-muted-foreground">{label}</p><p className="text-2xl font-bold">{value}</p></div></div>)}</div>
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center"><SearchInput label={t("searchLabel")} placeholder={t("searchPlaceholder")} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="max-w-md" /><div className="ms-auto flex gap-3"><select aria-label={t("statusFilterLabel")} value={status} onChange={(event) => { setStatus(event.target.value as typeof status); setPage(1); }} className="h-11 rounded-lg border border-border bg-card px-4"><option value="all">{t("statuses.all")}</option><option value="active">{t("statuses.active")}</option><option value="inactive">{t("statuses.inactive")}</option></select><Button asChild><Link href="/admin/merchandisers/create"><UserRoundPlus className="size-4" />{t("add")}</Link></Button></div></div>
      {actionError ? <p role="alert" className="rounded-lg bg-destructive/10 p-3 text-destructive">{actionError}</p> : null}
      {query.isLoading ? <PageLoadingSkeleton showHeader={false} cardCount={0} tableRows={8} tableColumns={6} label={t("loading")} className="px-0 py-0" /> : query.isError ? <ErrorState title={t("errors.load")} description={t("errors.loadDescription")} retryLabel={t("retry")} onRetry={() => query.refetch()} /> : !query.data?.data.length ? <EmptyState title={t("emptyTitle")} description={t("emptyDescription")} /> : <div className="overflow-x-auto rounded-xl border border-border bg-card"><table className="w-full min-w-[850px] text-sm"><thead><tr className="border-b border-border"><th className="p-4 text-start">{t("columns.name")}</th><th className="p-4 text-start">{t("columns.phone")}</th><th className="p-4 text-start">{t("columns.email")}</th><th className="p-4 text-center">{t("columns.completed")}</th><th className="p-4 text-center">{t("columns.status")}</th><th className="p-4 text-center">{t("columns.action")}</th></tr></thead><tbody>{query.data.data.map((record) => <tr key={record.id} className="border-b border-border last:border-0"><td className="p-4 font-medium"><Link href={`/admin/merchandisers/${record.id}`} className="hover:text-primary">{record.fullName}</Link></td><td className="p-4" dir="ltr">{record.phone}</td><td className="p-4">{record.email}</td><td className="p-4 text-center">{record.completedTasks}</td><td className="p-4 text-center"><button type="button" onClick={() => toggle(record)} disabled={statusMutation.isPending}><StatusToggle isActive={record.active} ariaLabel={t("toggleStatus", { name: record.fullName })} /></button></td><td className="p-4"><div className="flex justify-center gap-1"><Button asChild variant="ghost" size="icon-sm"><Link href={`/admin/merchandisers/${record.id}/edit`} aria-label={t("edit", { name: record.fullName })}><Pencil className="size-4" /></Link></Button><Button variant="ghost" size="icon-sm" aria-label={t("delete", { name: record.fullName })} onClick={() => setDeleteTarget(record)}><Trash2 className="size-4" /></Button></div></td></tr>)}</tbody></table></div>}
      <div className="flex items-center justify-between"><Button variant="outline" disabled={(meta?.currentPage ?? 1) <= 1} onClick={() => setPage((value) => value - 1)}>{t("pagination.previous")}</Button><span className="rounded-lg bg-primary/10 px-4 py-2 text-primary">{meta?.currentPage ?? 1}</span><Button variant="outline" disabled={(meta?.currentPage ?? 1) >= (meta?.lastPage ?? 1)} onClick={() => setPage((value) => value + 1)}>{t("pagination.next")}</Button></div>
      <DeleteConfirmDialog isOpen={Boolean(deleteTarget)} title={t("deleteDialog.title")} descriptionLine1={t("deleteDialog.description", { name: deleteTarget?.fullName ?? "" })} descriptionLine2={t("deleteDialog.warning")} cancelLabel={t("deleteDialog.cancel")} confirmLabel={t("deleteDialog.confirm")} onClose={() => setDeleteTarget(null)} onConfirm={remove} isPending={deleteMutation.isPending} errorMessage={actionError} />
    </div>
  );
}
