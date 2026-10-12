"use client";

import { useDeferredValue, useState } from "react";
import { CircleX, Files, Hourglass } from "lucide-react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { ScrollableTable } from "@/shared/components/scrollable-table";
import { CheckCircleIcon, ClockIcon, CostIcon, PaginationNextIcon, PaginationPreviousIcon } from "@/shared/components/dashboard/dashboard-icons";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import { StatusBadge, type StatusBadgeStatus } from "@/shared/components/dashboard/status-badge";
import { EmptyState, ErrorState, PageLoadingSkeleton } from "@/shared/components/feedback";
import { Button } from "@/shared/ui/button";
import { ShelfSelect } from "@/shared/ui/shelf-select";
import { cn } from "@/shared/lib/utils";
import { useAdminRequests } from "./hooks";
import type { AdminRequestStatus } from "./types";

const badge: Record<AdminRequestStatus, StatusBadgeStatus> = {
  draft: "draft", pending: "pending", completed: "completed", failed: "failed",
  in_progress: "inProgress", canceled: "canceled", in_review: "inReview",
  accepted: "accepted", rejected: "rejected", reopened: "reopened",
};

export function AdminRequestsPage() {
  const t = useTranslations("adminDashboard.requests");
  const [search, setSearch] = useState("");
  const deferred = useDeferredValue(search);
  const [status, setStatus] = useState("all");
  const [deleted, setDeleted] = useState(false);
  const [page, setPage] = useState(1);
  const query = useAdminRequests({ search: deferred, status, companyDeleted: deleted ? true : undefined, page, perPage: 9 });
  const stats = query.data?.stats;
  const cards = [
    { key: "total", value: stats?.total ?? 0, icon: Files, tone: "bg-primary/15 text-primary" },
    { key: "pending", value: stats?.pending ?? 0, icon: Hourglass, tone: "bg-warning/10 text-warning" },
    { key: "inProgress", value: stats?.inProgress ?? 0, icon: ClockIcon, tone: "bg-primary/15 text-primary" },
    { key: "rejected", value: stats?.rejected ?? 0, icon: CircleX, tone: "bg-destructive/15 text-destructive" },
    { key: "completed", value: stats?.completedWeek ?? 0, icon: CheckCircleIcon, tone: "bg-success/15 text-success" },
    { key: "commission", value: `$${stats?.commission ?? 0}`, icon: CostIcon, tone: "bg-accent text-accent-foreground" },
  ];
  const lastPage = query.data?.meta.lastPage ?? 1;

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      <div>
        <h1 className="text-3xl font-bold leading-tight text-foreground">{t("title")}</h1>
        <p className="mt-2 text-lg font-medium text-muted-foreground">{t("subtitle")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {cards.map(({ key, value, icon: Icon, tone }) => (
          <div key={key} className="flex min-h-24 items-center gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
            <span className={cn("flex size-11 shrink-0 items-center justify-center rounded-full", tone)}><Icon aria-hidden="true" className="size-5" /></span>
            <div className="min-w-0"><p className="text-xs text-muted-foreground">{t(`stats.${key}`)}</p><p className="text-2xl font-bold text-foreground">{value}</p></div>
          </div>
        ))}
      </div>
      <div className="flex flex-col gap-3 md:flex-row md:items-center">
        <SearchInput label={t("searchLabel")} placeholder={t("searchPlaceholder")} value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} className="max-w-md" />
        <ShelfSelect value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }} aria-label={t("statusFilter")} className="h-11 rounded-lg border border-border bg-card px-4 text-sm md:ms-auto">
          <option value="all">{t("statuses.all")}</option>
          {Object.keys(badge).map((value) => <option key={value} value={value}>{t(`statuses.${value}`)}</option>)}
        </ShelfSelect>
      </div>
      <div className="flex flex-wrap gap-2">
        {[false, true].map((isDeleted) => (
          <button key={String(isDeleted)} type="button" aria-pressed={deleted === isDeleted} onClick={() => { setDeleted(isDeleted); setPage(1); }} className={cn("rounded-full px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", deleted === isDeleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground")}>
            {t(isDeleted ? "tabs.deleted" : "tabs.all")}
          </button>
        ))}
      </div>
      {query.isLoading ? <PageLoadingSkeleton showHeader={false} cardCount={0} tableRows={8} tableColumns={6} label={t("loading")} />
        : query.isError ? <ErrorState title={t("error")} description={t("errorDescription")} retryLabel={t("retry")} onRetry={() => query.refetch()} />
          : !query.data?.data.length ? <EmptyState title={t("empty")} description={t("emptyDescription")} />
            : (
              <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <ScrollableTable>
                  <table className="w-full min-w-[850px] border-separate border-spacing-0 text-start">
                    <thead><tr className="text-xs font-medium text-foreground">
                      {["id", "company", "created", "store", "price", "status"].map((key) => <th key={key} scope="col" className="border-b border-e border-border px-5 py-3 text-start font-medium last:border-e-0">{t(`columns.${key}`)}</th>)}
                    </tr></thead>
                    <tbody>
                      {query.data.data.map((item) => (
                        <tr key={item.id} className="text-sm transition-colors hover:bg-muted/40 [&:last-child>td]:border-b-0">
                          <td className="border-b border-border px-5 py-4"><Link href={`/admin/requests/${item.id}`} className="font-semibold text-primary hover:underline">REQ-{item.id}</Link></td>
                          <td className="border-b border-border px-5 py-4"><p className="font-semibold text-foreground">{item.companyName}</p><p className="text-xs text-muted-foreground">{item.companyCountry}</p></td>
                          <td className="border-b border-border px-5 py-4 text-muted-foreground">{new Date(item.createdAt).toLocaleDateString()}</td>
                          <td className="border-b border-border px-5 py-4 text-muted-foreground">{item.storeName}</td>
                          <td className="border-b border-border px-5 py-4 text-muted-foreground">${item.price}</td>
                          <td className="border-b border-border px-5 py-4"><StatusBadge status={badge[item.status]} label={t(`statuses.${item.status}`)} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </ScrollableTable>
              </div>
            )}
      <div className="flex items-center justify-between gap-4">
        <Button variant="outline" disabled={query.isFetching || page <= 1} onClick={() => setPage(page - 1)}><PaginationPreviousIcon className="size-4 rtl:rotate-180" />{t("previous")}</Button>
        <span className="text-sm text-muted-foreground">{page} / {lastPage}</span>
        <Button variant="outline" disabled={query.isFetching || page >= lastPage} onClick={() => setPage(page + 1)}>{t("next")}<PaginationNextIcon className="size-4 rtl:rotate-180" /></Button>
      </div>
    </div>
  );
}
