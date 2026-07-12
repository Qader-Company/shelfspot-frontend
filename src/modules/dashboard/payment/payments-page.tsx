"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

import {
  AddIcon,
  FilterIcon,
  PaginationNextIcon,
  PaginationPreviousIcon,
} from "@/shared/components/dashboard/dashboard-icons";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import { AddFundDialog } from "./add-fund-dialog";
import { PaymentSummaryCard } from "./payment-summary-card";
import {
  paymentPagination,
  paymentSummaryData,
  paymentTransactions,
} from "./payments.seed";
import type {
  PaymentTransactionStatus,
  PaymentTransactionType,
} from "./payments.seed";
import { PaymentsTable } from "./payments-table";

export function PaymentsPage() {
  const t = useTranslations("dashboard");
  const [isAddFundOpen, setIsAddFundOpen] = useState(false);

  return (
    <div className="space-y-6 px-4 py-8 lg:px-8">
      {/* Page header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h1 className="text-3xl font-bold leading-tight text-foreground">
            {t("paymentPage.title")}
          </h1>
          <p className="mt-2 text-lg font-medium text-muted-foreground">
            {t("paymentPage.subtitle")}
          </p>
        </div>
        <Button
          type="button"
          className="h-12 rounded-lg px-6 text-sm font-semibold text-white hover:text-white"
          onClick={() => setIsAddFundOpen(true)}
        >
          <AddIcon className="size-5" />
          {t("paymentPage.actions.addFund")}
        </Button>
      </div>

      {/* Account summary card */}
      <PaymentSummaryCard data={paymentSummaryData} />

      {/* Search + filters */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <SearchInput
          label={t("paymentPage.search.label")}
          placeholder={t("paymentPage.search.placeholder")}
          className="max-w-[420px]"
        />
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            className="h-10 gap-3 rounded-lg border-border bg-card px-5 text-sm font-medium text-foreground shadow-none"
          >
            <FilterIcon className="size-4" />
            {t("paymentPage.filters.date")}
          </Button>
          <Button
            type="button"
            variant="outline"
            className="h-10 gap-3 rounded-lg border-border bg-card px-5 text-sm font-medium text-foreground shadow-none"
          >
            <FilterIcon className="size-4" />
            {t("paymentPage.filters.allStatuses")}
          </Button>
        </div>
      </div>

      {/* Transactions table */}
      <PaymentsTable
        rows={paymentTransactions}
        labels={{
          types:         t("paymentPage.table.columns.types"),
          totalSpending: t("paymentPage.table.columns.totalSpending"),
          date:          t("paymentPage.table.columns.date"),
          status:        t("paymentPage.table.columns.status"),
          action:        t("paymentPage.table.columns.action"),
          delete:        t("paymentPage.table.actions.delete"),
        }}
        resolveType={(typeKey: PaymentTransactionType) =>
          t(`paymentPage.types.${typeKey}` as Parameters<typeof t>[0])
        }
        resolveStatus={(status: PaymentTransactionStatus) =>
          t(`paymentPage.status.${status}` as Parameters<typeof t>[0])
        }
      />

      {/* Pagination */}
      <div className="flex flex-col items-center justify-between gap-4 px-5 pb-2 md:flex-row">
        <Button
          type="button"
          variant="outline"
          className="h-10 gap-2 rounded-lg border-border bg-card px-4 text-sm font-semibold shadow-none"
        >
          <PaginationPreviousIcon className="size-4 rtl:rotate-180" />
          {t("paymentPage.pagination.previous")}
        </Button>
        <div className="flex items-center gap-2">
          {paymentPagination.pages.map((page) => (
            <Button
              key={page}
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn(
                "rounded-lg text-sm text-muted-foreground",
                page === paymentPagination.activePage &&
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
          {t("paymentPage.pagination.next")}
          <PaginationNextIcon className="size-4 rtl:rotate-180" />
        </Button>
      </div>

      {/* Add Fund dialog */}
      <AddFundDialog
        isOpen={isAddFundOpen}
        onClose={() => setIsAddFundOpen(false)}
      />
    </div>
  );
}
