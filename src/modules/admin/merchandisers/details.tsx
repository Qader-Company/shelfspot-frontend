"use client";

import { useMemo, useState } from "react";
import { Box, CalendarDays, CheckCircle2, Mail, Pencil, Phone, Trash2, UserRound, XCircle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@/i18n/navigation";
import { DeleteConfirmDialog } from "@/shared/components/dashboard/delete-confirm-dialog";
import { StatusBadge } from "@/shared/components/dashboard/status-badge";
import { EmptyState, ErrorState, PageLoadingSkeleton } from "@/shared/components/feedback";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";
import { useDeleteMerchandiserRequest, useMerchandiser } from "./hooks";
import type { MerchandiserRequestStatus } from "./types";

export function MerchandiserDetails({ merchandiserId }: { merchandiserId: string }) {
  const t = useTranslations("adminDashboard.merchandisers.details");
  const queryClient = useQueryClient();
  const query = useMerchandiser(merchandiserId);
  const deleteMutation = useDeleteMerchandiserRequest();
  const [tab, setTab] = useState<"all" | MerchandiserRequestStatus>("all");
  const [date, setDate] = useState("");
  const [deleteRequestId, setDeleteRequestId] = useState<string | null>(null);
  const filteredRequests = useMemo(() => (query.data?.requests ?? []).filter((request) => (tab === "all" || request.status === tab) && (!date || request.occurredAt.startsWith(date))), [date, query.data?.requests, tab]);
  if (query.isLoading) return <PageLoadingSkeleton label={t("loading")} cardCount={4} tableRows={3} tableColumns={5} />;
  if (query.isError) return <ErrorState title={t("error")} description={t("errorDescription")} retryLabel={t("retry")} onRetry={() => query.refetch()} />;
  if (!query.data) return <EmptyState title={t("notFound")} description={t("notFoundDescription")} />;
  const record = query.data;
  const completed = record.requests.filter((request) => request.status === "completed").length;
  const canceled = record.requests.filter((request) => request.status === "canceled").length;
  const stats = [{ label: t("stats.total"), value: record.requests.length, icon: Box, tone: "bg-primary/10 text-primary" }, { label: t("stats.completed"), value: completed, icon: CheckCircle2, tone: "bg-success/10 text-success" }, { label: t("stats.canceled"), value: canceled, icon: XCircle, tone: "bg-destructive/10 text-destructive" }];
  async function removeRequest() { if (!deleteRequestId) return; await deleteMutation.mutateAsync({ merchandiserId, requestId: deleteRequestId }); setDeleteRequestId(null); await queryClient.invalidateQueries({ queryKey: ["admin", "merchandisers", merchandiserId] }); }
  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      <div className="flex items-start gap-4"><Link href="/admin/merchandisers" className="rounded-full p-3 hover:bg-muted" aria-label={t("back")}>←</Link><div><h1 className="text-3xl font-bold">{t("title")}</h1><p className="mt-1 text-muted-foreground">{t("subtitle")}</p></div></div>
      <section className="rounded-xl border border-border bg-card p-6"><div className="flex flex-col gap-6 lg:flex-row lg:items-center"><span className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary"><UserRound /></span><div><div className="flex items-center gap-3"><h2 className="text-xl font-bold">{record.fullName}</h2><StatusBadge status={record.active ? "active" : "inactive"} label={record.active ? t("active") : t("inactive")} /></div></div><div className="ms-auto grid gap-5 sm:grid-cols-2"><Info icon={Mail} label={t("email")} value={record.email} /><Info icon={Phone} label={t("phone")} value={record.phone} /></div></div></section>
      {record.currentTask ? <section className="rounded-xl border border-border bg-card p-5"><div className="flex flex-wrap items-center gap-4"><div><h2 className="font-bold">{record.currentTask.name}</h2><p className="text-muted-foreground">{record.currentTask.company}</p></div><StatusBadge status="inProgress" label={t("inProgress")} /><span className="ms-auto text-sm">{record.currentTask.progress}%</span></div><div className="mt-4 h-2 overflow-hidden rounded-full bg-muted"><div className="h-full rounded-full bg-primary" style={{ width: `${record.currentTask.progress}%` }} /></div><p className="mt-2 text-xs text-muted-foreground">{t("due", { date: new Date(record.currentTask.dueDate).toLocaleDateString() })}</p></section> : null}
      <section className="space-y-6 rounded-xl border border-border bg-card p-4 lg:p-6"><div className="flex justify-end"><label className="flex items-center gap-2 rounded-lg border border-border px-3 py-2"><CalendarDays className="size-4" /><span className="sr-only">{t("filterDate")}</span><input type="date" value={date} onChange={(event) => setDate(event.target.value)} className="bg-transparent" /></label></div><div className="grid gap-4 md:grid-cols-3">{stats.map(({ label, value, icon: Icon, tone }) => <div key={label} className="rounded-xl border border-border p-5"><span className={cn("inline-flex rounded-full p-3", tone)}><Icon className="size-5" /></span><p className="mt-3 text-muted-foreground">{label}</p><p className="text-2xl font-bold">{value}</p></div>)}</div><div><h2 className="text-lg font-bold">{t("history")}</h2><div className="mt-3 flex gap-2">{(["all", "completed", "failed", "canceled"] as const).map((value) => <button key={value} type="button" onClick={() => setTab(value)} className={cn("rounded-full px-4 py-2 text-sm", tab === value ? "bg-primary/10 text-primary" : "bg-muted")}>{t(`tabs.${value}`)}</button>)}</div></div>{filteredRequests.length ? <div className="overflow-x-auto rounded-xl border border-border"><table className="w-full min-w-[720px] text-sm"><thead><tr className="border-b border-border"><th className="p-4 text-start">{t("columns.id")}</th><th className="p-4 text-start">{t("columns.location")}</th><th className="p-4 text-start">{t("columns.time")}</th><th className="p-4 text-center">{t("columns.status")}</th><th className="p-4 text-center">{t("columns.action")}</th></tr></thead><tbody>{filteredRequests.map((request) => <tr key={request.id} className="border-b border-border last:border-0"><td className="p-4 font-medium">{request.id}</td><td className="p-4">{request.location}</td><td className="p-4">{new Date(request.occurredAt).toLocaleString()}</td><td className="p-4 text-center"><StatusBadge status={request.status} label={t(`tabs.${request.status}`)} /></td><td className="p-4"><div className="flex justify-center gap-1"><Button variant="ghost" size="icon-sm" aria-label={t("editRequest")} disabled title={t("requestApiMissing")}><Pencil className="size-4" /></Button><Button variant="ghost" size="icon-sm" aria-label={t("deleteRequest")} onClick={() => setDeleteRequestId(request.id)}><Trash2 className="size-4" /></Button></div></td></tr>)}</tbody></table></div> : <EmptyState title={t("emptyHistory")} description={t("emptyHistoryDescription")} />}</section>
      <DeleteConfirmDialog isOpen={Boolean(deleteRequestId)} title={t("deleteDialog.title")} descriptionLine1={t("deleteDialog.description")} descriptionLine2={t("deleteDialog.warning")} cancelLabel={t("deleteDialog.cancel")} confirmLabel={t("deleteDialog.confirm")} onClose={() => setDeleteRequestId(null)} onConfirm={removeRequest} isPending={deleteMutation.isPending} />
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) { return <div className="flex items-center gap-3"><span className="rounded-full bg-primary/10 p-3 text-primary"><Icon className="size-5" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="font-medium">{value}</p></div></div>; }
