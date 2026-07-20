"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { useRouter } from "@/i18n/navigation";

import { StatusBadge } from "@/shared/components/dashboard/status-badge";
import type { StatusBadgeStatus } from "@/shared/components/dashboard/status-badge";
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
import { ErrorState, PageLoadingSkeleton } from "@/shared/components/feedback";

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

function timeRemaining(expiresAt: string | null | undefined): { label: string; expired: boolean } {
  if (!expiresAt) return { label: "—", expired: false };
  const diff = new Date(expiresAt.replace(" ", "T")).getTime() - Date.now();
  if (diff <= 0) return { label: "0h 0m", expired: true };
  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  return { label: `${h}h ${m}m`, expired: false };
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

// ─── Cancel confirm dialog ────────────────────────────────────────────────

function CancelConfirmDialog({
  isOpen,
  title,
  description,
  cancelLabel,
  confirmLabel,
  isPending,
  onClose,
  onConfirm,
}: {
  isOpen: boolean;
  title: string;
  description: string;
  cancelLabel: string;
  confirmLabel: string;
  isPending: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) {
  if (!isOpen) return null;
  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/30 p-4"
    >
      <section
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-6 shadow-xl"
      >
        <h2 className="text-lg font-bold text-foreground">{title}</h2>
        <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        <div className="mt-6 flex gap-3">
          <Button type="button" variant="outline" className="h-11 flex-1" onClick={onClose} disabled={isPending}>
            {cancelLabel}
          </Button>
          <Button
            type="button"
            className="h-11 flex-1 bg-destructive text-white hover:bg-destructive/90"
            onClick={onConfirm}
            disabled={isPending}
          >
            {isPending ? "…" : confirmLabel}
          </Button>
        </div>
      </section>
    </div>
  );
}

// ─── Inner page (receives resolved task) ─────────────────────────────────

function RequestDetailsView({ task, id }: { task: CompanyTask; id: string | number }) {
  const t = useTranslations("dashboard");
  const locale = useLocale();
  const router = useRouter();
  const { act, pay } = useTaskMutations();
  const [showCancel, setShowCancel] = useState(false);
  const [showPay, setShowPay] = useState(false);

  const remaining = timeRemaining(task.expires_at);
  const locationName = task.location.location_name || task.location.address || "—";
  const badgeStatus = toStatusBadge(task.status);

  const totalProducts = task.services.reduce(
    (sum, svc) => sum + svc.products.length,
    0,
  );

  const isDraft = task.status === "draft";
  const canCancel = task.status === "pending";

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
            <StatusBadge
              status={task.payment_status === "charged" ? "completed" : "pending"}
              label={task.payment_status_label}
            />
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
            <p className="text-2xl font-bold text-foreground">{task.total_price} SAR</p>
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
              <p className="text-2xl font-bold text-foreground">{remaining.label}</p>
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
      {isDraft && (
        <Button
          type="button"
          className="h-12 w-full gap-2 rounded-xl text-sm font-semibold text-white hover:text-white"
          onClick={() => setShowPay(true)}
        >
          <PaymentIcon className="size-4" />
          {t("requestDetails.actions.pay")}
        </Button>
      )}
      {canCancel && (
        <Button
          type="button"
          className="h-12 w-full gap-2 rounded-xl bg-destructive text-sm font-semibold text-white hover:bg-destructive/90"
          onClick={() => setShowCancel(true)}
        >
          <CloseIcon className="size-4" />
          {t("requestDetails.actions.cancelRequest")}
        </Button>
      )}

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
      <CancelConfirmDialog
        isOpen={showCancel}
        title={t("requestDetails.cancelDialog.title")}
        description={t("requestDetails.cancelDialog.description")}
        cancelLabel={t("requestDetails.cancelDialog.cancel")}
        confirmLabel={t("requestDetails.cancelDialog.confirm")}
        isPending={act.isPending}
        onClose={() => setShowCancel(false)}
        onConfirm={() =>
          act.mutate(
            { id, action: "cancel" },
            { onSuccess: () => { setShowCancel(false); router.back(); } },
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
