"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import { ROUTES } from "@/config/routes";
import { Link } from "@/i18n/navigation";
import {
  dashboardRequestPagination,
  dashboardRequestRows,
  dashboardRequestStats,
} from "@/modules/company/requests/list/seed";
import type { DashboardRequestRow } from "@/modules/company/requests/list/seed";
import { DashboardRequestsTable } from "@/modules/company/requests/list/table";
import { RequestDeleteDialog } from "@/modules/company/requests/delete/dialog";
import {
  AddIcon,
  FilterIcon,
  PaginationNextIcon,
  PaginationPreviousIcon,
} from "@/shared/components/dashboard/dashboard-icons";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import { DashboardStatCard } from "@/shared/components/dashboard/widgets/dashboard-stat-card";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

export function DashboardRequestsPage() {
  const t = useTranslations("dashboard");
  const [deleteTarget, setDeleteTarget] = useState("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const handleDeleteClick = (id: string) => {
    setDeleteTarget(id);
    setIsDeleteOpen(true);
  };

  const deletionReasons = [
    { value: "duplicate",  label: t("requestsPage.deleteDialog.reasons.duplicate")  },
    { value: "cancelled",  label: t("requestsPage.deleteDialog.reasons.cancelled")  },
    { value: "error",      label: t("requestsPage.deleteDialog.reasons.error")      },
    { value: "other",      label: t("requestsPage.deleteDialog.reasons.other")      },
  ];

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-tight text-foreground">
            {t("requestsPage.title")}
          </h1>
          <p className="mt-2 text-lg font-medium text-muted-foreground">
            {t("requestsPage.subtitle")}
          </p>
        </div>
        <Button
          asChild
          className="h-12 rounded-lg px-6 text-sm font-semibold text-white hover:text-white"
        >
          <Link href={ROUTES.dashboardCreateRequest}>
            <AddIcon className="size-5" />
            {t("requestsPage.actions.createRequest")}
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {dashboardRequestStats.map((item) => (
          <DashboardStatCard
            key={item.key}
            item={item}
            title={t(item.titleKey)}
            trend={t(item.trendKey)}
          />
        ))}
      </div>

      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SearchInput
          label={t("requestsPage.search.label")}
          placeholder={t("requestsPage.search.placeholder")}
          className="max-w-[420px]"
        />
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-3 rounded-lg border-border bg-card px-5 text-sm font-medium text-foreground shadow-none"
        >
          <FilterIcon className="size-4" />
          {t("requestsPage.filters.allStatuses")}
        </Button>
      </div>

      <DashboardRequestsTable
        rows={dashboardRequestRows}
        labels={{
          requestId: t("requestsPage.table.columns.requestId"),
          location: t("requestsPage.table.columns.location"),
          assignedBy: t("requestsPage.table.columns.assignedBy"),
          time: t("requestsPage.table.columns.time"),
          status: t("requestsPage.table.columns.status"),
          action: t("requestsPage.table.columns.action"),
          selectAll: t("requestsPage.table.actions.selectAll"),
          selectRow: t("requestsPage.table.actions.selectRow"),
          delete: t("requestsPage.table.actions.delete"),
          edit: t("requestsPage.table.actions.edit"),
        }}
        resolveText={(key) => t(key)}
        resolveStatus={(status: DashboardRequestRow["status"]) =>
          t(`requestsPage.status.${status}`)
        }
        onDelete={handleDeleteClick}
      />

      <RequestDeleteDialog
        isOpen={isDeleteOpen}
        requestId={deleteTarget}
        labels={{
          title:               t("requestsPage.deleteDialog.title"),
          description:        t("requestsPage.deleteDialog.description"),
          reasonLabel:        t("requestsPage.deleteDialog.reasonLabel"),
          reasonPlaceholder:  t("requestsPage.deleteDialog.reasonPlaceholder"),
          reasons:            deletionReasons,
          cancel:             t("requestsPage.deleteDialog.cancel"),
          confirm:            t("requestsPage.deleteDialog.confirm"),
        }}
        onClose={() => setIsDeleteOpen(false)}
      />

      <div className="flex flex-col items-center justify-between gap-4 px-5 pb-2 md:flex-row">
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-2 rounded-lg border-border bg-card px-4 text-sm font-semibold shadow-none"
        >
          <PaginationPreviousIcon className="size-4 rtl:rotate-180" />
          {t("requestsPage.pagination.previous")}
        </Button>
        <div className="flex items-center gap-2">
          {dashboardRequestPagination.pages.map((page) => (
            <Button
              key={page}
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn(
                "rounded-lg text-sm text-muted-foreground",
                page === dashboardRequestPagination.activePage &&
                  "bg-primary/20 text-foreground hover:bg-primary/20",
              )}
            >
              {page}
            </Button>
          ))}
        </div>
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-2 rounded-lg border-border bg-card px-4 text-sm font-semibold shadow-none"
        >
          {t("requestsPage.pagination.next")}
          <PaginationNextIcon className="size-4 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
}
