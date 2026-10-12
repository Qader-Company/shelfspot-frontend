"use client";

import { useLocale, useTranslations } from "next-intl";
import { useState } from "react";
import { Dialog } from "radix-ui";
import { LoaderCircle } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { BackChevronIcon, CalendarIcon, CloseIcon, RepeatIcon, WarningIcon } from "@/shared/components/dashboard/dashboard-icons";
import { ExecutionServiceCard } from "@/shared/components/dashboard/execution-service-card";
import { StatusBadge, type StatusBadgeStatus } from "@/shared/components/dashboard/status-badge";
import { EmptyState, ErrorState, PageLoadingSkeleton } from "@/shared/components/feedback";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { Button } from "@/shared/ui/button";
import { useAdminRequest, useReopenAdminRequest } from "./hooks";
import type { AdminRequestStatus } from "./types";
import { ReopenWorkerPicker } from "./reopen-worker-picker";
import { showRequestActionSuccess } from "./action-success";
import styles from "./request-motion.module.css";

const badge: Record<AdminRequestStatus, StatusBadgeStatus> = {
  draft: "draft", pending: "pending", completed: "completed", failed: "failed",
  in_progress: "inProgress", canceled: "canceled", in_review: "inReview",
  accepted: "accepted", rejected: "rejected", reopened: "reopened",
};

export function AdminRequestExecution({ requestId }: { requestId: string }) {
  const t = useTranslations("dashboard.executionDetails");
  const admin = useTranslations("adminDashboard.requests.details");
  const locale = useLocale();
  const query = useAdminRequest(requestId);
  const reopen = useReopenAdminRequest();
  const [reopenOpen, setReopenOpen] = useState(false);
  const [reason, setReason] = useState("");
  const [selectedWorkerId, setSelectedWorkerId] = useState("");

  function formatDate(value?: string | null) {
    if (!value) return "—";
    const date = new Date(value.replace(" ", "T"));
    return Number.isNaN(date.getTime()) ? "—" : new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
  }

  if (query.isPending) return <PageLoadingSkeleton actionCount={1} cardCount={2} tableRows={4} tableColumns={4} />;
  if (query.isError) return <ErrorState className="m-8" title={t("errorTitle")} description={t("errorDescription")} retryLabel={t("retry")} onRetry={() => void query.refetch()} />;
  if (!query.data) return <EmptyState title={admin("notFound")} description={admin("notFoundDescription")} />;
  const item = query.data;
  const finishedAt = item.completedAt ?? item.services.map((service) => service.execution.submission?.completed_at ?? service.execution.completed_at).filter((value): value is string => Boolean(value)).sort().at(-1);

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      <header className="flex items-start gap-3">
        <Button asChild variant="ghost" size="icon" className="mt-1 size-12 shrink-0 rounded-full bg-card shadow-sm"><Link href={`/admin/requests/${requestId}`} aria-label={admin("backToRequest")}><BackChevronIcon className="size-6 rtl:rotate-180" /></Link></Button>
        <div><h1 className="text-3xl font-bold leading-tight">{t("title", { id: `REQ-${item.id}` })}</h1><p className="mt-1 text-lg font-medium text-muted-foreground">{t("subtitle")}</p></div>
      </header>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-center gap-3"><strong className="text-2xl">REQ-{item.id}</strong><span key={item.status} className={styles.status}><StatusBadge status={badge[item.status]} label={admin(`statuses.${item.status}`)} /></span></div>
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {[
            { icon: WarningIcon, label: t("executedBy"), value: item.worker ?? "—" },
            { icon: CalendarIcon, label: t("startedAt"), value: formatDate(item.startedAt) },
            { icon: CalendarIcon, label: t("finishedAt"), value: formatDate(finishedAt) },
          ].map(({ icon: Icon, label, value }) => <div key={label} className="flex items-center gap-3"><span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon className="size-4" /></span><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-sm font-semibold">{value}</p></div></div>)}
        </div>
      </section>
      {item.rejectionReason ? <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-sm text-destructive">{item.rejectionReason}</p> : null}
      <section className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-sm">
        <h2 className="text-xl font-bold">{t("services", { count: item.services.length })}</h2>
        {item.services.map((service, index) => <ExecutionServiceCard key={service.id} service={service.execution} index={index} />)}
      </section>
      <>
        {item.status === "rejected" ? <Button className={`${styles.action} h-12 w-full rounded-xl text-sm font-semibold`} disabled={reopen.isPending} onClick={() => { reopen.reset(); setReason(""); setSelectedWorkerId(item.workerId ?? ""); setReopenOpen(true); }}><RepeatIcon className="size-4" />{admin("reopen")}</Button> : null}
        <Dialog.Root open={reopenOpen} onOpenChange={(open) => { if (!reopen.isPending) setReopenOpen(open); }}>
          <Dialog.Portal>
            <Dialog.Overlay className={`${styles.overlay} fixed inset-0 z-50 bg-foreground/30`} />
            <Dialog.Content className={`${styles.panel} fixed start-1/2 top-1/2 z-50 max-h-[90dvh] w-[calc(100%_-_2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-border bg-card p-5 shadow-xl rtl:translate-x-1/2`}>
              <div className="flex items-start justify-between gap-4">
                <Dialog.Title className="text-lg font-bold">{admin("reopen")}</Dialog.Title>
                <Dialog.Close asChild><Button variant="ghost" size="icon-sm" aria-label={admin("assignDialog.close")} disabled={reopen.isPending} className="rounded-full"><CloseIcon className="size-4" /></Button></Dialog.Close>
              </div>
              <Dialog.Description className="mt-2 text-sm text-muted-foreground">{admin("reopenDialog.description")}</Dialog.Description>
              <ReopenWorkerPicker requestId={requestId} currentWorkerId={item.workerId} currentWorkerName={item.worker} selectedId={selectedWorkerId} disabled={reopen.isPending} onSelect={(workerId) => { setSelectedWorkerId(workerId); reopen.reset(); }} />
              <label className="mt-4 block text-sm font-medium" htmlFor="admin-reopen-reason">{admin("reopenDialog.reason")}</label>
              <textarea id="admin-reopen-reason" value={reason} disabled={reopen.isPending} onChange={(event) => setReason(event.target.value)} placeholder={admin("reopenDialog.placeholder")} className="mt-2 min-h-24 w-full rounded-lg border border-border bg-background p-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring" />

              {reopen.isError ? <p role="alert" className="mt-3 text-sm text-destructive">{normalizeApiError(reopen.error).message || admin("reopenError")}</p> : null}
              <div className="mt-5 flex gap-3">
                <Dialog.Close asChild><Button variant="outline" className="flex-1" disabled={reopen.isPending}>{admin("reopenDialog.cancel")}</Button></Dialog.Close>
                <Button className={`${styles.action} flex-1`} aria-busy={reopen.isPending} disabled={reopen.isPending || !selectedWorkerId} onClick={() => {
                  if (!selectedWorkerId || reopen.isPending) return;
                  reopen.mutate({ requestId, workerId: selectedWorkerId, reason }, { onSuccess: () => { setReopenOpen(false); showRequestActionSuccess(admin("reopenedSuccess"), requestId, admin("assignDialog.close")); } });
                }}>{reopen.isPending ? <LoaderCircle aria-hidden="true" className="size-4 motion-safe:animate-spin" /> : null}{admin(reopen.isPending ? "reopening" : "reopen")}</Button>
              </div>
            </Dialog.Content>
          </Dialog.Portal>
        </Dialog.Root>
      </>
    </div>
  );
}
