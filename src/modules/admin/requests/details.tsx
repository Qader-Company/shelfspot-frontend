"use client";

import { useState, type ComponentType, type SVGProps } from "react";
import { UserRound } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ScrollableTable } from "@/shared/components/scrollable-table";
import { BackChevronIcon, BoxIcon, CalendarIcon, ClockIcon, CostIcon, MapPinIcon, RepeatIcon, SidebarChevronIcon, SidebarChevronUpIcon, ViewIcon, WarningIcon } from "@/shared/components/dashboard/dashboard-icons";
import { StatusBadge, type StatusBadgeStatus } from "@/shared/components/dashboard/status-badge";
import { EmptyState, ErrorState, PageLoadingSkeleton } from "@/shared/components/feedback";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";
import { useAdminRequest } from "./hooks";
import { AssignMerchandiserDialog } from "./dialogs";
import type { AdminRequestService, AdminRequestStatus } from "./types";
import styles from "./request-motion.module.css";

const badge: Record<AdminRequestStatus, StatusBadgeStatus> = {
  draft: "draft", pending: "pending", completed: "completed", failed: "failed",
  in_progress: "inProgress", canceled: "canceled", in_review: "inReview",
  accepted: "accepted", rejected: "rejected", reopened: "reopened",
};

type IconComponent = ComponentType<SVGProps<SVGSVGElement>>;

export function AdminRequestDetails({ requestId }: { requestId: string }) {
  const t = useTranslations("adminDashboard.requests.details");
  const dashboard = useTranslations("dashboard.requestDetails");
  const query = useAdminRequest(requestId);
  const [assignOpen, setAssignOpen] = useState(false);

  if (query.isLoading) return <PageLoadingSkeleton label={t("loading")} cardCount={3} tableRows={4} tableColumns={4} />;
  if (query.isError) return <ErrorState title={t("error")} description={t("errorDescription")} retryLabel={t("retry")} onRetry={() => query.refetch()} />;
  if (!query.data) return <EmptyState title={t("notFound")} description={t("notFoundDescription")} />;

  const item = query.data;
  const products = item.services.reduce((sum, service) => sum + service.products.length, 0);
  const showAssign = item.status === "canceled";

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      <div className="flex items-start gap-3">
        <Button asChild variant="ghost" size="icon" className="mt-1 size-12 shrink-0 rounded-full bg-card text-foreground shadow-sm hover:bg-muted">
          <Link href="/admin/requests" aria-label={dashboard("back")}><BackChevronIcon aria-hidden="true" className="size-6 rtl:rotate-180" /></Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold leading-tight text-foreground">{t("title")}</h1>
          <p className="mt-1 text-lg font-medium text-muted-foreground">{t("subtitle", { id: item.id })}</p>
        </div>
      </div>

      <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3"><h2 className="text-2xl font-bold text-foreground">REQ-{item.id}</h2><span key={item.status} className={styles.status}><StatusBadge status={badge[item.status]} label={t(`statuses.${item.status}`)} /></span></div>
          <div className="text-end"><p className="text-xs text-muted-foreground">{t("created")}</p><p className="text-sm font-semibold text-foreground">{new Date(item.createdAt).toLocaleString()}</p></div>
        </div>
        <div className="mt-4 grid grid-cols-1 gap-4 rounded-lg border border-border bg-muted/20 p-4 sm:grid-cols-2 xl:grid-cols-5">
          <Info icon={MapPinIcon} label={t("location")} value={item.location} />
          <Info icon={WarningIcon} label={t("assignedBy")} value={item.assignedBy ?? "—"} />
          <Info icon={CalendarIcon} label={t("executionDate")} value={item.executionDate ?? "—"} />
          <Info icon={ClockIcon} label={t("timeWindow")} value={item.timeWindow ?? "—"} />
          <Info icon={UserRound} label={t("worker")} value={item.worker ?? "—"} />
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-3">
        <Metric icon={CostIcon} label={t("totalCost")} value={`$${item.price}`} tone="bg-success/15 text-success" />
        <Metric icon={BoxIcon} label={t("totalProducts")} value={String(products)} tone="bg-primary/15 text-primary" />
        <Metric icon={ClockIcon} label={t("timeRemaining")} value={item.expiresAt ? t("calculatedTime") : "—"} tone="bg-destructive/15 text-destructive" />
      </div>
      {showAssign ? <Button className={cn(styles.action, "h-12 w-full rounded-xl text-sm font-semibold")} onClick={() => setAssignOpen(true)}><RepeatIcon className="size-4" />{t("reassign")}</Button> : null}
      {["rejected", "completed", "accepted", "reopened"].includes(item.status) ? <Button asChild variant="outline" className="h-12 w-full rounded-xl text-sm font-semibold"><Link href={`/admin/requests/${item.id}/execution`}><ViewIcon className="size-4" />{t("viewExecution")}</Link></Button> : null}

      <section className="space-y-4">
        <h2 className="text-xl font-bold text-foreground">{t("services", { count: item.services.length })}</h2>
        {item.services.map((service, index) => <AdminServiceCard key={service.id} service={service} index={index} />)}
      </section>
      {assignOpen ? <AssignMerchandiserDialog requestId={requestId} workerId={item.workerId} workerName={item.worker} onClose={() => setAssignOpen(false)} /> : null}
    </div>
  );
}

function Info({ icon: Icon, label, value }: { icon: IconComponent; label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary"><Icon aria-hidden="true" className="size-4" /></span>
      <div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="truncate text-sm font-semibold text-foreground" title={value}>{value}</p></div>
    </div>
  );
}

function Metric({ icon: Icon, label, value, tone }: { icon: IconComponent; label: string; value: string; tone: string }) {
  return (
    <div className="flex min-w-0 items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
      <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", tone)}><Icon aria-hidden="true" className="size-5" /></span>
      <div className="min-w-0"><p className="text-xs text-muted-foreground">{label}</p><p className="text-2xl font-bold text-foreground">{value}</p></div>
    </div>
  );
}

function AdminServiceCard({ service, index }: { service: AdminRequestService; index: number }) {
  const t = useTranslations("adminDashboard.requests.details");
  const [open, setOpen] = useState(index === 0);
  const ChevronIcon = open ? SidebarChevronUpIcon : SidebarChevronIcon;
  const contentId = `admin-service-${service.id}`;
  const pills = [
    { key: "brand", value: service.brand, tone: "bg-[var(--info-50)] text-[var(--info-700)]" },
    { key: "subBrand", value: service.subBrand, tone: "bg-[var(--warning-100)] text-[var(--warning-700)]" },
    { key: "category", value: service.category, tone: "bg-[var(--success-50)] text-[var(--success-700)]" },
    { key: "subCategory", value: service.subCategory, tone: "bg-purple-50 text-purple-700" },
  ];

  return (
    <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <button type="button" aria-expanded={open} aria-controls={open ? contentId : undefined} onClick={() => setOpen((previous) => !previous)} className="flex w-full flex-wrap items-center justify-between gap-3 px-5 py-4 text-start focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
        <div className="min-w-0"><p className="text-xs text-muted-foreground">{t("serviceNumber", { number: index + 1 })}</p><h3 className="mt-0.5 text-base font-bold text-foreground">{service.name}</h3></div>
        <div className="flex shrink-0 items-center gap-3">
          <span className="flex items-center gap-1 text-sm font-semibold text-success"><CostIcon aria-hidden="true" className="size-4" />${service.price}</span>
          <span className="flex items-center gap-1 text-xs text-muted-foreground"><ClockIcon aria-hidden="true" className="size-4" />{service.duration}</span>
          <ChevronIcon aria-hidden="true" className="size-4 text-muted-foreground" />
        </div>
      </button>
      {open ? (
        <div id={contentId} className="space-y-5 border-t border-border px-5 pb-5 pt-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {pills.map(({ key, value, tone }) => <div key={key} className={cn("rounded-lg px-4 py-3", tone)}><p className="text-xs font-medium opacity-70">{t(key)}</p><p className="mt-0.5 text-sm font-semibold">{value ?? "—"}</p></div>)}
          </div>
          <ScrollableTable className="rounded-lg border border-border">
            <table className="w-full min-w-[600px] border-separate border-spacing-0 text-sm">
              <thead><tr className="text-xs font-medium text-muted-foreground">
                {["product", "sku", "quantity", "expiry"].map((key) => <th key={key} scope="col" className="border-b border-e border-border px-4 py-3 text-start font-medium last:border-e-0">{t(key)}</th>)}
              </tr></thead>
              <tbody>{service.products.map((product) => <tr key={product.id} className="[&:last-child>td]:border-b-0">
                <td className="border-b border-border px-4 py-3 font-medium text-foreground">{product.name}</td>
                <td className="border-b border-border px-4 py-3 text-muted-foreground">{product.sku}</td>
                <td className="border-b border-border px-4 py-3 text-muted-foreground">{product.quantity}</td>
                <td className="border-b border-border px-4 py-3 text-muted-foreground">{product.expiryDate ?? "—"}</td>
              </tr>)}</tbody>
            </table>
          </ScrollableTable>
          {service.guideline ? <div><p className="mb-2 text-sm font-semibold text-foreground">{t("guidelines")}</p><p className="rounded-lg border border-border bg-muted/30 px-4 py-3 text-sm text-foreground">{service.guideline}</p></div> : null}
        </div>
      ) : null}
    </article>
  );
}
