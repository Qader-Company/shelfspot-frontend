"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";

import { StatusBadge } from "@/shared/components/dashboard/status-badge";
import type { StatusBadgeStatus } from "@/shared/components/dashboard/status-badge";
import { DeleteConfirmDialog } from "@/shared/components/dashboard/delete-confirm-dialog";
import {
  ActivityIcon,
  BoxIcon,
  CalendarIcon,
  ClockIcon,
  CloseIcon,
  CostIcon,
  MapPinIcon,
  PaginationPreviousIcon,
  PaymentIcon,
  WarningIcon,
} from "@/shared/components/dashboard/dashboard-icons";
import { Button } from "@/shared/ui/button";
import { usePermission } from "@/shared/components/auth/permission-provider";
import { ErrorState, PageLoadingSkeleton } from "@/shared/components/feedback";
import { normalizeApiError } from "@/shared/lib/api/errors";

import { ServiceDetailCard } from "./service-card";
import { useTaskQuery, useTaskMutations } from "./use-query";
import type { CompanyTask } from "./types";
import { PaymentConfirmDialog } from "@/modules/company/requests/shared/payment-confirm-dialog";

// ─── Helpers ─────────────────────────────────────────────────────────────

function toStatusBadge(status: string): StatusBadgeStatus {
  if (status === "in_progress") return "inProgress";
  if (status === "in_review")   return "inReview";
  if (status === "worker_cancelled" || status === "company_cancelled") return "canceled";
  if (status === "started")     return "inProgress";
  if (status === "draft")       return "pending";
  const known: StatusBadgeStatus[] = [
    "pending","accepted","completed","failed","rejected","canceled","reopened",
    "active","inactive","refunded","inProgress","inReview",
  ];
  return known.includes(status as StatusBadgeStatus) ? (status as StatusBadgeStatus) : "pending";
}

function formatDate(value: string | null | undefined, locale: string): string {
  if (!value) return "—";
  const d = new Date(value.replace(" ", "T"));
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(d);
}

function formatDateOnly(value: string | null | undefined, locale: string): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(d);
}

function timeRemaining(expiresAt: string | null | undefined): { hours: number; minutes: number; expired: boolean; missing: boolean } {
  if (!expiresAt) return { hours: 0, minutes: 0, expired: false, missing: true };
  const diff = new Date(expiresAt.replace(" ", "T")).getTime() - Date.now();
  if (diff <= 0) return { hours: 0, minutes: 0, expired: true, missing: false };
  return {
    hours: Math.floor(diff / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    expired: false,
    missing: false,
  };
}

// ─── Progress bar ─────────────────────────────────────────────────────────

function ProgressBar({ percentage }: { percentage: number }) {
  return (
    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
      <div
        className="h-full rounded-full bg-primary transition-all"
        style={{ width: `${Math.min(100, percentage)}%` }}
      />
    </div>
  );
}

// ─── Inner page (receives resolved task) ─────────────────────────────────

function RequestDetailsView({ task, id }: { task: CompanyTask; id: string | number }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const { act, pay, update } = useTaskMutations();
  const canEditTask = usePermission("edit_task");
  const canDeleteTask = usePermission("delete_task");
  const [showCancel, setShowCancel] = useState(false);
  const [showReject, setShowReject] = useState(false);
  const [showPay, setShowPay] = useState(false);
  const [showReschedule, setShowReschedule] = useState(false);
  const [editDate, setEditDate] = useState(task.date.slice(0, 10));

  const remaining = timeRemaining(task.expires_at);
  const locationName = task.location.location_name || task.location.address || "—";
  const badgeStatus = toStatusBadge(task.status);

  const totalProducts = task.services.reduce(
    (sum, svc) => sum + svc.products.length,
    0,
  );

  const isDraft = task.status === "draft";
  const canCancel = task.status === "pending" || task.status === "failed";
  const canReschedule = task.status === "failed";
  const canReject = task.status === "completed";

  const serviceLabels = {
    productHeading:      t("requestDetails.services.productHeading"),
    products:            t("requestDetails.services.columns.products"),
    skuCode:             t("requestDetails.services.columns.skuCode"),
    minQuantity:         t("requestDetails.services.columns.minQuantity"),
    executionGuidelines: t("requestDetails.services.executionGuidelines"),
    attachments:         t("requestDetails.services.attachments"),
    brand:               t("requestDetails.services.brand"),
    subBrand:            t("requestDetails.services.subBrand"),
    category:            t("requestDetails.services.category"),
    subCategory:         t("requestDetails.services.subCategory"),
    noProducts:          t("requestDetails.services.noProducts"),
    download:            t("requestDetails.services.download"),
  };

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">

      {/* Page header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="mb-2 -ms-2 gap-1 text-muted-foreground"
            onClick={() => router.back()}
          >
            <PaginationPreviousIcon className="size-4 rtl:rotate-180" />
            {t("requestDetails.back")}
          </Button>
          <h1 className="text-3xl font-bold leading-tight text-foreground">
            {t("requestDetails.title")}
          </h1>
          <p className="mt-1 text-lg font-medium text-muted-foreground">
            {t("requestDetails.subtitle", { id: `REQ-${task.id}` })}
          </p>
        </div>
      </div>

      {/* Request card */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        {/* Top row */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-2xl font-bold text-foreground">REQ-{task.id}</span>
            <StatusBadge status={badgeStatus} label={task.status_label} />
          </div>
          <div className="text-end">
            <p className="text-xs text-muted-foreground">{t("requestDetails.createdOn")}</p>
            <p className="text-sm font-semibold text-foreground">
              {formatDate(task.created_at, locale)}
            </p>
          </div>
        </div>

        {/* Info grid */}
        <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-4">
          {[
            { icon: MapPinIcon,  label: t("requestDetails.info.location"),      value: locationName },
            { icon: WarningIcon, label: t("requestDetails.info.assignedBy"),     value: task.assigned_worker?.name ?? task.created_by },
            { icon: CalendarIcon, label: t("requestDetails.info.executionDate"), value: formatDateOnly(task.date, locale) },
            { icon: ClockIcon,   label: t("requestDetails.info.expiresAt"),      value: formatDate(task.expires_at, locale) },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-3">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
                <Icon className="size-4 text-primary" />
              </span>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="truncate text-sm font-semibold text-foreground">{value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Notes */}
        {task.notes && (
          <p className="mt-4 rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-foreground">
            <span className="font-semibold">{t("requestDetails.info.notes")}: </span>
            {task.notes}
          </p>
        )}
      </div>

      {/* Stats row */}
      <div className="grid gap-4 sm:grid-cols-3">
        {/* Total Cost */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-success/15">
            <CostIcon className="size-5 text-success" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">{t("requestDetails.stats.totalCost")}</p>
            <p className="text-2xl font-bold text-foreground">
              {t("requestDetails.stats.currencyValue", { amount: task.total_price })}
            </p>
            <p className="text-xs text-muted-foreground">
              {t("requestDetails.stats.servicesCount", { count: task.services.length })}
            </p>
          </div>
        </div>

        {/* Progress (non-draft) / Total Products (draft) */}
        {isDraft ? (
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <BoxIcon className="size-5 text-primary" />
            </span>
            <div>
              <p className="text-xs text-muted-foreground">{t("requestDetails.stats.totalProducts")}</p>
              <p className="text-2xl font-bold text-foreground">{totalProducts}</p>
              <p className="text-xs text-muted-foreground">{t("requestDetails.stats.unitsSubtitle")}</p>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15">
              <ActivityIcon className="size-5 text-primary" />
            </span>
            <div className="flex-1">
              <p className="text-xs text-muted-foreground">{t("requestDetails.stats.progress")}</p>
              <p className="text-2xl font-bold text-foreground">{task.progress.percentage}%</p>
              <ProgressBar percentage={task.progress.percentage} />
              <p className="mt-1 text-xs text-muted-foreground">
                {task.progress.completed_services} / {task.progress.total_services}
              </p>
            </div>
          </div>
        )}

        {/* Time Remaining */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-destructive/15">
            <ClockIcon className="size-5 text-destructive" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">{t("requestDetails.stats.timeRemaining")}</p>
            <div className="flex items-center gap-2">
              <p className="text-2xl font-bold text-foreground">
                {remaining.missing
                  ? "—"
                  : t("requestDetails.stats.timeRemainingValue", {
                      hours: remaining.hours,
                      minutes: remaining.minutes,
                    })}
              </p>
              {remaining.expired && (
                <span className="rounded px-1.5 py-0.5 text-xs font-bold bg-destructive/10 text-destructive">
                  {t("requestDetails.stats.expired")}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{t("requestDetails.stats.untilDeadline")}</p>
          </div>
        </div>
      </div>

      {/* Total products chip — non-draft only (draft shows it in stats) */}
      {!isDraft && totalProducts > 0 && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-card px-5 py-4 shadow-sm">
          <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
            <BoxIcon className="size-4 text-primary" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">{t("requestDetails.stats.totalProducts")}</p>
            <p className="text-lg font-bold text-foreground">{totalProducts}</p>
          </div>
        </div>
      )}

      {/* Action buttons */}
      {canEditTask && isDraft && (
        <Button type="button" className="h-12 w-full gap-2 rounded-xl text-sm font-semibold text-white hover:text-white" onClick={() => setShowPay(true)}><PaymentIcon className="size-4" />{t("requestDetails.actions.pay")}</Button>
      )}
      {((canDeleteTask && canCancel) || (canEditTask && canReschedule)) && (
        <div className="grid gap-3 sm:grid-cols-2">
        {canEditTask && canReschedule ? <Button type="button" variant="outline" className="h-12 gap-2 rounded-xl" onClick={() => setShowReschedule(true)}><CalendarIcon className="size-4" />{t("requestDetails.actions.reschedule")}</Button> : null}
        {canDeleteTask && canCancel ? (
        <Button
          type="button"
          className="h-12 w-full gap-2 rounded-xl bg-destructive text-sm font-semibold text-white hover:bg-destructive/90"
          onClick={() => setShowCancel(true)}
        >
          <CloseIcon className="size-4" />
          {t("requestDetails.actions.cancelRequest")}
        </Button>
        ) : null}
        </div>
      )}
      {canEditTask && canReject ? (
        <Button
          type="button"
          variant="outline"
          className="h-12 w-full gap-2 rounded-xl border-destructive text-sm font-semibold text-destructive hover:bg-destructive/10 hover:text-destructive"
          onClick={() => setShowReject(true)}
        >
          <CloseIcon className="size-4" />
          {t("requestDetails.actions.reject")}
        </Button>
      ) : null}

      {/* Services section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">
          {t("requestDetails.services.heading", { count: task.services.length })}
        </h2>
        {task.services.map((svc, index) => (
          <ServiceDetailCard
            key={svc.id}
            service={svc}
            labels={serviceLabels}
            index={index}
            defaultExpanded={index === 0}
          />
        ))}
      </div>

      {/* Cancel confirm dialog */}
      <DeleteConfirmDialog
        isOpen={showCancel}
        title={t("requestDetails.cancelDialog.title")}
        descriptionLine1={t("requestDetails.cancelDialog.description")}
        descriptionLine2=""
        cancelLabel={t("requestDetails.cancelDialog.cancel")}
        confirmLabel={t("requestDetails.cancelDialog.confirm")}
        isPending={act.isPending}
        errorMessage={
          act.isError
            ? normalizeApiError(act.error).message ||
              t("requestDetails.cancelDialog.error")
            : undefined
        }
        onClose={() => setShowCancel(false)}
        onConfirm={() =>
          act.mutate(
            { id, action: "cancel" },
            { onSuccess: () => { setShowCancel(false); router.back(); } },
          )
        }
      />

      <DeleteConfirmDialog
        isOpen={showReject}
        title={t("requestDetails.rejectDialog.title")}
        descriptionLine1={t("requestDetails.rejectDialog.description")}
        descriptionLine2=""
        cancelLabel={t("requestDetails.rejectDialog.cancel")}
        confirmLabel={t("requestDetails.rejectDialog.confirm")}
        isPending={act.isPending}
        errorMessage={
          act.isError
            ? normalizeApiError(act.error).message ||
              t("requestDetails.rejectDialog.error")
            : undefined
        }
        onClose={() => setShowReject(false)}
        onConfirm={() =>
          act.mutate(
            { id, action: "reject" },
            { onSuccess: () => setShowReject(false) },
          )
        }
      />

      {/* Payment dialog */}
      <PaymentConfirmDialog
        isOpen={showPay}
        isPending={pay.isPending}
        totalPrice={task.total_price}
        onClose={() => setShowPay(false)}
        onConfirm={() =>
          pay.mutate(id, {
            onSuccess: () => { setShowPay(false); router.back(); },
          })
        }
      />
      {showReschedule ? (
        <div role="presentation" className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4">
          <section role="dialog" aria-modal="true" aria-label={t("requestDetails.reschedule.dateTitle")} className="w-full max-w-md rounded-2xl border border-border bg-card p-6 shadow-xl">
            <h2 className="text-lg font-bold text-foreground">{t("requestDetails.reschedule.dateTitle")}</h2>
            <div className="mt-5 space-y-4">
              <label className="block text-sm font-medium text-foreground">{t("requestDetails.editDialog.date")}<input type="date" value={editDate} min={new Date().toISOString().slice(0, 10)} onChange={(event) => setEditDate(event.target.value)} className="mt-2 h-11 w-full rounded-lg border border-border bg-background px-3" /></label>
            </div>
            <div className="mt-6 flex gap-3">
              <Button type="button" variant="outline" className="flex-1" disabled={update.isPending} onClick={() => setShowReschedule(false)}>{t("requestDetails.editDialog.cancel")}</Button>
              <Button type="button" className="flex-1 text-white" disabled={!editDate || update.isPending} onClick={() => { const payload = new FormData(); payload.append("date", editDate); update.mutate({ id, payload }, { onSuccess: () => setShowReschedule(false) }); }}>{t("requestDetails.editDialog.save")}</Button>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  );
}

// ─── Public export — handles loading / error states ──────────────────────

interface RequestDetailsPageProps {
  id: string | number;
}

export function RequestDetailsPage({ id }: RequestDetailsPageProps) {
  const t = useTranslations("dashboard");
  const { data, isPending, isError, refetch } = useTaskQuery(id);

  if (isPending) {
    return (
      <PageLoadingSkeleton
        actionCount={1}
        cardCount={3}
        tableRows={4}
        tableColumns={3}
      />
    );
  }

  if (isError || !data?.data) {
    return (
      <ErrorState
        className="m-8"
        title={t("requestDetails.errorTitle")}
        description={t("requestDetails.errorDescription")}
        retryLabel={t("requestDetails.retry")}
        onRetry={() => void refetch()}
      />
    );
  }

  return <RequestDetailsView task={data.data} id={id} />;
}
