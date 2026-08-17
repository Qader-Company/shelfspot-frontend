"use client";

import {
  ArrowDownRight,
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  CircleDollarSign,
  Hash,
  Mail,
  Phone,
} from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

import { Link } from "@/i18n/navigation";
import { StatusBadge } from "@/shared/components/dashboard/status-badge";
import {
  EmptyState,
  ErrorState,
  PageLoadingSkeleton,
} from "@/shared/components/feedback";
import { Button } from "@/shared/ui/button";
import { cn } from "@/shared/lib/utils";

import { usePayment } from "./hooks";
import type { PaymentStatus } from "./types";

const STATUS_MAP: Record<PaymentStatus, "completed" | "failed" | "refunded"> = {
  completed: "completed",
  failed: "failed",
  refunded: "refunded",
};

export function PaymentDetailsPage({ id }: { id: string }) {
  const t = useTranslations("adminPayments.details");
  const locale = useLocale();
  const query = usePayment(id);

  if (query.isLoading)
    return (
      <PageLoadingSkeleton
        label={t("loading")}
        cardCount={4}
        tableRows={0}
        tableColumns={0}
      />
    );

  if (query.isError)
    return (
      <ErrorState
        title={t("error")}
        retryLabel={t("retry")}
        onRetry={() => query.refetch()}
        className="m-8"
      />
    );

  if (!query.data) return <EmptyState title={t("notFound")} className="m-8" />;

  const tx = query.data;
  const isIncoming = tx.direction === "incoming";

  const formattedDate = tx.date
    ? new Intl.DateTimeFormat(locale, { dateStyle: "long" }).format(
        new Date(tx.date),
      )
    : "—";

  const chargedAt = tx.charged_at
    ? new Intl.DateTimeFormat(locale, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(tx.charged_at))
    : null;

  const formattedAmount = new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(tx.amount);

  const companyFields = [
    {
      label: t("fields.company"),
      value: tx.company.name,
      icon: Building2,
      tone: "bg-primary/10 text-primary",
    },
    {
      label: t("fields.email"),
      value: tx.company.email ?? "—",
      icon: Mail,
      tone: "bg-accent text-accent-foreground",
    },
    {
      label: t("fields.phone"),
      value: tx.company.phone ?? "—",
      icon: Phone,
      tone: "bg-success/10 text-success",
    },
  ];

  const txFields = [
    {
      label: t("fields.transactionId"),
      value: `#${tx.id}`,
      icon: Hash,
      tone: "bg-secondary text-secondary-foreground",
    },
    {
      label: t("fields.date"),
      value: formattedDate,
      icon: CalendarDays,
      tone: "bg-accent text-accent-foreground",
    },
    ...(chargedAt
      ? [
          {
            label: t("fields.chargedAt"),
            value: chargedAt,
            icon: CalendarDays,
            tone: "bg-success/10 text-success",
          },
        ]
      : []),
    {
      label: t("fields.paymentStatus"),
      value: tx.payment_status_label ?? tx.payment_status ?? "—",
      icon: CircleDollarSign,
      tone: "bg-primary/10 text-primary",
    },
  ];

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon-sm">
          <Link href="/admin/payments" aria-label={t("back")}>
            <ArrowLeft className="size-5 rtl:rotate-180" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">{t("title")}</h1>
      </div>

      {/* Amount + status hero */}
      <section className="rounded-xl border border-border bg-card p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "rounded-full p-3",
                isIncoming
                  ? "bg-success/10 text-success"
                  : "bg-destructive/10 text-destructive",
              )}
            >
              {isIncoming ? (
                <ArrowUpRight className="size-5" />
              ) : (
                <ArrowDownRight className="size-5" />
              )}
            </span>
            <div>
              <p className="text-sm text-muted-foreground">
                {t(isIncoming ? "direction.incoming" : "direction.outgoing")}
              </p>
              <p className="text-sm text-muted-foreground">
                {t(
                  isIncoming
                    ? "direction.incomingDesc"
                    : "direction.outgoingDesc",
                )}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-start gap-2 sm:items-end">
            <span
              className={cn(
                "text-3xl font-bold",
                isIncoming ? "text-success" : "text-destructive",
              )}
            >
              {isIncoming ? "+" : "-"}
              {formattedAmount}
            </span>
            <StatusBadge
              status={STATUS_MAP[tx.status]}
              label={tx.status_label ?? t(`statuses.${tx.status}`)}
            />
          </div>
        </div>
      </section>

      {/* Company info */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-5 text-lg font-bold">{t("companyTitle")}</h2>
        <dl className="grid gap-5 sm:grid-cols-3">
          {companyFields.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="flex items-start gap-3">
              <span className={cn("rounded-full p-2", tone)}>
                <Icon className="size-4" />
              </span>
              <div>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-sm font-medium break-all">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>

      {/* Transaction info */}
      <section className="rounded-xl border border-border bg-card p-6">
        <h2 className="mb-5 text-lg font-bold">{t("transactionTitle")}</h2>
        <dl className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {txFields.map(({ label, value, icon: Icon, tone }) => (
            <div key={label} className="flex items-start gap-3">
              <span className={cn("rounded-full p-2", tone)}>
                <Icon className="size-4" />
              </span>
              <div>
                <dt className="text-xs text-muted-foreground">{label}</dt>
                <dd className="mt-1 text-sm font-medium">{value}</dd>
              </div>
            </div>
          ))}
        </dl>
      </section>
    </div>
  );
}
