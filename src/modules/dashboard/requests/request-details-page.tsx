"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { StatusBadge } from "@/modules/dashboard/components/status-badge";
import {
  ActivityIcon,
  CalendarIcon,
  ClockIcon,
  CloseIcon,
  CostIcon,
  MapPinIcon,
  PaginationPreviousIcon,
  ScheduleIcon,
  WarningIcon,
} from "@/shared/components/dashboard/dashboard-icons";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import type { RequestDetail, RequestDetailStatus } from "./request-details.seed";
import { ServiceDetailCard } from "./service-detail-card";

// ─── Reschedule date picker (visual only) ────────────────────────────────

function RescheduleDateDialog({
  isOpen,
  title,
  closeLabel,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  closeLabel: string;
  onClose: () => void;
}) {
  if (!isOpen) return null;

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const weeks = [
    [28, 29, 30, 31, 1, 2, 3],
    [4, 5, 6, 7, 8, 9, 10],
    [11, 12, 13, 14, 15, 16, 17],
    [18, 19, 20, 21, 22, 23, 24],
    [25, 26, 27, 28, 29, 30, 31],
  ];

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
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-foreground">{title}</h2>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={closeLabel} onClick={onClose} className="rounded-full text-muted-foreground">
            <CloseIcon className="size-4" />
          </Button>
        </div>

        <div className="mt-4 text-center">
          <p className="text-xl font-bold text-foreground">May 2026</p>
          <div className="mt-4 grid grid-cols-7 gap-1 text-xs font-medium text-muted-foreground">
            {days.map((d) => <span key={d} className="py-1">{d}</span>)}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="grid grid-cols-7 gap-1 mt-1">
              {week.map((day, di) => (
                <button
                  key={di}
                  type="button"
                  className={cn(
                    "rounded-full py-1.5 text-sm transition-colors hover:bg-primary/10",
                    (wi === 0 && di < 3) || (wi === 4 && di > 4)
                      ? "text-muted-foreground/40"
                      : "text-foreground",
                    wi === 1 && di === 6 && "bg-primary font-bold text-white hover:bg-primary",
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

// ─── Reschedule time picker (visual only) ────────────────────────────────

function RescheduleTimeDialog({
  isOpen,
  title,
  closeLabel,
  onClose,
}: {
  isOpen: boolean;
  title: string;
  closeLabel: string;
  onClose: () => void;
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
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-lg font-bold text-foreground">{title} <span className="text-destructive">*</span></h2>
          <Button type="button" variant="ghost" size="icon-sm" aria-label={closeLabel} onClick={onClose} className="rounded-full text-muted-foreground">
            <CloseIcon className="size-4" />
          </Button>
        </div>
        <div className="relative mt-4">
          <input
            type="text"
            placeholder="--:-- --"
            readOnly
            className="h-12 w-full rounded-lg border border-border bg-secondary px-4 text-sm text-muted-foreground focus:outline-none"
          />
          <ClockIcon className="pointer-events-none absolute end-3 top-1/2 size-5 -translate-y-1/2 text-primary" />
        </div>
      </section>
    </div>
  );
}

// ─── Action buttons per status ───────────────────────────────────────────

type DialogType = "date" | "time" | null;

interface ActionButtonsProps {
  status: RequestDetailStatus;
  t: ReturnType<typeof useTranslations<"dashboard">>;
  onRescheduleDate: () => void;
}

function ActionButtons({ status, t, onRescheduleDate }: ActionButtonsProps) {
  const hasPrimary =
    status !== "completed" && status !== "canceled";

  if (!hasPrimary) return null;

  const primaryLabel = (s: RequestDetailStatus): string => {
    if (s === "inProgress" || s === "failed") return t("requestDetails.actions.reschedule");
    if (s === "reopened") return t("requestDetails.actions.cancelReopening");
    return t("requestDetails.actions.repeatRequest");
  };

  const primaryVariant = (s: RequestDetailStatus) =>
    s === "pending" || s === "reopened" ? "destructive" : "default";

  const primaryIcon = (s: RequestDetailStatus) =>
    s === "reopened" || s === "pending"
      ? <CloseIcon className="size-4" />
      : s === "inProgress" || s === "failed"
        ? <ScheduleIcon className="size-4" />
        : <ScheduleIcon className="size-4" />;

  const hasSecondary = status !== "inProgress" && status !== "pending";
  const secondaryIsCancel = status === "failed";

  const handlePrimaryClick = () => {
    if (status === "inProgress" || status === "failed") {
      onRescheduleDate();
    }
  };

  if (status === "pending") {
    return (
      <Button
        type="button"
        className="h-12 w-full gap-2 rounded-xl bg-destructive text-sm font-semibold text-white hover:bg-destructive/90"
      >
        <CloseIcon className="size-4" />
        {t("requestDetails.actions.cancelRequest")}
      </Button>
    );
  }

  return (
    <div className={cn("grid gap-3", hasSecondary ? "grid-cols-2" : "grid-cols-1")}>
      {/* Primary */}
      <Button
        type="button"
        className={cn(
          "h-12 gap-2 rounded-xl text-sm font-semibold",
          primaryVariant(status) === "destructive"
            ? "bg-destructive text-white hover:bg-destructive/90"
            : "text-white hover:text-white",
        )}
        onClick={handlePrimaryClick}
      >
        {primaryIcon(status)}
        {primaryLabel(status)}
      </Button>

      {/* Secondary */}
      {hasSecondary && (
        <Button
          type="button"
          variant="outline"
          className={cn(
            "h-12 gap-2 rounded-xl text-sm font-semibold shadow-none",
            secondaryIsCancel && "border-destructive text-destructive hover:text-destructive",
          )}
        >
          {secondaryIsCancel ? (
            <>
              <CloseIcon className="size-4" />
              {t("requestDetails.actions.cancelRequest")}
            </>
          ) : (
            <>
              <ActivityIcon className="size-4" />
              {t("requestDetails.actions.viewExecution")}
            </>
          )}
        </Button>
      )}
    </div>
  );
}

// ─── Main page ───────────────────────────────────────────────────────────

interface RequestDetailsPageProps {
  request: RequestDetail;
}

export function RequestDetailsPage({ request }: RequestDetailsPageProps) {
  const t = useTranslations("dashboard");
  const [openDialog, setOpenDialog] = useState<DialogType>(null);

  const serviceLabels = {
    productHeading: `${t("requestDetails.services.productHeading")}(${request.services[0]?.products.length ?? 0})`,
    products:       t("requestDetails.services.columns.products"),
    skuCode:        t("requestDetails.services.columns.skuCode"),
    quantity:       t("requestDetails.services.columns.quantity"),
    expiryDate:     t("requestDetails.services.columns.expiryDate"),
    executionGuidelines: t("requestDetails.services.executionGuidelines"),
    brandLabel:       t("requestDetails.services.brand"),
    subBrandLabel:    t("requestDetails.services.subBrand"),
    categoryLabel:    t("requestDetails.services.category"),
    subCategoryLabel: t("requestDetails.services.subCategory"),
  };

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold leading-tight text-foreground">
          {t("requestDetails.title")}
        </h1>
        <p className="mt-1 text-lg font-medium text-muted-foreground">
          {t("requestDetails.subtitle", { id: request.id })}
        </p>
      </div>

      {/* Request card */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
        {/* Top row: ID + status + created date */}
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl font-bold text-foreground">{request.id}</span>
            <StatusBadge
              status={request.status}
              label={t(`requestDetails.status.${request.status}` as Parameters<typeof t>[0])}
            />
          </div>
          <div className="text-end">
            <p className="text-xs text-muted-foreground">{t("requestDetails.createdOn")}</p>
            <p className="text-sm font-semibold text-foreground">{request.createdAt}</p>
          </div>
        </div>

        {/* Info grid */}
        <div className="mt-4 grid grid-cols-2 gap-4 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-4">
          {[
            { icon: MapPinIcon, label: t("requestDetails.info.location"),      value: request.location      },
            { icon: WarningIcon, label: t("requestDetails.info.assignedBy"),    value: request.assignedBy    },
            { icon: CalendarIcon, label: t("requestDetails.info.executionDate"), value: request.executionDate },
            { icon: ClockIcon, label: t("requestDetails.info.timeWindow"),    value: request.timeWindow    },
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
            <p className="text-2xl font-bold text-foreground">{request.totalCost}</p>
            <p className="text-xs text-success">{request.totalCostSubtitle}</p>
          </div>
        </div>

        {/* Total Products */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary/15">
            <PaginationPreviousIcon className="size-5 text-primary rotate-180" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">{t("requestDetails.stats.totalProducts")}</p>
            <p className="text-2xl font-bold text-foreground">{request.totalProducts}</p>
            <p className="text-xs text-muted-foreground">{t("requestDetails.stats.unitsSubtitle")}</p>
          </div>
        </div>

        {/* Time Remaining */}
        <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
          <span className="flex size-11 shrink-0 items-center justify-center rounded-full bg-destructive/15">
            <ClockIcon className="size-5 text-destructive" />
          </span>
          <div>
            <p className="text-xs text-muted-foreground">{t("requestDetails.stats.timeRemaining")}</p>
            <div className="flex items-center gap-2">
              <p className={cn("text-2xl font-bold", request.isExpired ? "text-foreground" : "text-foreground")}>
                {request.timeRemaining}
              </p>
              {request.isExpired && (
                <span className="rounded px-1.5 py-0.5 text-xs font-bold bg-destructive/10 text-destructive">
                  {t("requestDetails.stats.expired")}
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground">{t("requestDetails.stats.untilDeadline")}</p>
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <ActionButtons
        status={request.status}
        t={t}
        onRescheduleDate={() => setOpenDialog("date")}
      />

      {/* Services section */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">
          {t("requestDetails.services.heading", { count: request.services.length })}
        </h2>
        {request.services.map((svc, index) => (
          <ServiceDetailCard
            key={svc.id}
            service={svc}
            labels={serviceLabels}
            defaultExpanded={index === 0}
          />
        ))}
      </div>

      {/* Reschedule dialogs */}
      <RescheduleDateDialog
        isOpen={openDialog === "date"}
        title={t("requestDetails.reschedule.dateTitle")}
        closeLabel={t("requestDetails.reschedule.close")}
        onClose={() => setOpenDialog("time")}
      />
      <RescheduleTimeDialog
        isOpen={openDialog === "time"}
        title={t("requestDetails.reschedule.timeTitle")}
        closeLabel={t("requestDetails.reschedule.close")}
        onClose={() => setOpenDialog(null)}
      />
    </div>
  );
}
