"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  FilterIcon,
  PaginationNextIcon,
  PaginationPreviousIcon,
} from "@/shared/components/dashboard/dashboard-icons";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import {
  trashDefaultTab,
  trashPagination,
  trashRows,
  trashTabs,
} from "./trash.seed";
import type { TrashTabKey } from "./trash.seed";
import { TrashTable } from "./trash-table";
import { TrashTabs } from "./trash-tabs";

export function TrashPage() {
  const t = useTranslations("dashboard");
  const [activeTab, setActiveTab] = useState<TrashTabKey>(trashDefaultTab);

  const resolvedTabs = trashTabs.map((tab) => ({
    key: tab.key,
    label: t(tab.labelKey as Parameters<typeof t>[0]),
    count: tab.count,
  }));

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold leading-tight text-foreground">
          {t("trashPage.title")}
        </h1>
        <p className="mt-2 text-lg font-medium text-muted-foreground">
          {t("trashPage.subtitle")}
        </p>
      </div>

      {/* Category tabs */}
      <TrashTabs
        tabs={resolvedTabs}
        activeTab={activeTab}
        onTabChange={(key) => setActiveTab(key as TrashTabKey)}
      />

      {/* Search + filter */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SearchInput
          label={t("trashPage.search.label")}
          placeholder={t("trashPage.search.placeholder")}
          className="max-w-[420px]"
        />
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-3 rounded-lg border-border bg-card px-5 text-sm font-medium text-foreground shadow-none"
        >
          <FilterIcon className="size-4" />
          {t("trashPage.filters.allStatuses")}
        </Button>
      </div>

      {/* Trash table */}
      <TrashTable
        rows={trashRows}
        labels={{
          products:     t("trashPage.table.columns.products"),
          family:       t("trashPage.table.columns.family"),
          sku:          t("trashPage.table.columns.sku"),
          description:  t("trashPage.table.columns.description"),
          status:       t("trashPage.table.columns.status"),
          deletedDate:  t("trashPage.table.columns.deletedDate"),
          action:       t("trashPage.table.columns.action"),
          selectAll:    t("trashPage.table.actions.selectAll"),
          selectRow:    t("trashPage.table.actions.selectRow"),
          deleteRow:    t("trashPage.table.actions.delete"),
          restoreRow:   t("trashPage.table.actions.restore"),
          toggleStatus: t("trashPage.table.actions.toggleStatus"),
        }}
      />

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-4 px-5 pb-2 md:flex-row">
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-2 rounded-lg border-border bg-card px-4 text-sm font-semibold shadow-none"
        >
          <PaginationPreviousIcon className="size-4 rtl:rotate-180" />
          {t("trashPage.pagination.previous")}
        </Button>
        <div className="flex items-center gap-2">
          {trashPagination.pages.map((page) => (
            <Button
              key={page}
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn(
                "rounded-lg text-sm text-muted-foreground",
                page === trashPagination.activePage &&
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
          {t("trashPage.pagination.next")}
          <PaginationNextIcon className="size-4 rtl:rotate-180" />
        </Button>
      </div>
    </div>
  );
}
