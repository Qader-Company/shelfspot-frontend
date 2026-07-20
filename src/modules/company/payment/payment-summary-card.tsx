"use client";

import { useState } from "react";
import { Copy, Eye, EyeOff } from "lucide-react";
import { useTranslations } from "next-intl";

import { cn } from "@/shared/lib/utils";
import { Button } from "@/shared/ui/button";

import type { PaymentSummaryData } from "./payments.seed";

interface PaymentSummaryCardProps {
  data: PaymentSummaryData;
}

export function PaymentSummaryCard({ data }: PaymentSummaryCardProps) {
  const t = useTranslations("dashboard");
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);

  return (
    <div className="overflow-hidden rounded-2xl bg-gradient-to-br from-[var(--brand-600)] to-[var(--brand-900)] p-6 text-white shadow-lg">
      {/* Balance row */}
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-medium text-white/80">
          {t("paymentPage.summary.accountBalance")}
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className={cn(
            "text-white/70 hover:bg-white/10 hover:text-white",
            "focus-visible:ring-white/30",
          )}
          aria-label={t("paymentPage.summary.toggleBalance")}
          onClick={() => setIsBalanceVisible((prev) => !prev)}
        >
          {isBalanceVisible ? (
            <Eye className="size-4" />
          ) : (
            <EyeOff className="size-4" />
          )}
        </Button>
      </div>

      {/* Balance value */}
      <p className="mt-1 text-4xl font-bold tracking-tight">
        {isBalanceVisible ? data.balance : "••••••"}
      </p>

      {/* Account ID */}
      <div className="mt-2 flex items-center gap-1.5">
        <p className="text-sm text-white/70">
          {t("paymentPage.summary.accountId")}:{" "}
          <span className="font-medium text-white">{data.accountId}</span>
        </p>
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="text-white/60 hover:bg-white/10 hover:text-white"
          aria-label={t("paymentPage.summary.copyAccountId")}
        >
          <Copy className="size-3" />
        </Button>
      </div>

      {/* Sub-metrics */}
      <div className="mt-5 grid grid-cols-2 gap-3">
        {/* Monthly Spending */}
        <div className="rounded-xl bg-white/10 p-4">
          <p className="text-xs font-medium text-white/70">
            {t("paymentPage.summary.monthlySpending")}
          </p>
          <p className="mt-1 text-xl font-bold">{data.monthlySpending}</p>
          <p className="mt-0.5 text-xs text-white/60">
            {t("paymentPage.summary.lastMonth")}
          </p>
        </div>

        {/* Pending */}
        <div className="rounded-xl bg-white/10 p-4">
          <p className="text-xs font-medium text-white/70">
            {t("paymentPage.summary.pending")}
          </p>
          <p className="mt-1 text-xl font-bold">{data.pendingAmount}</p>
          <span className="mt-1 inline-flex items-center rounded-md bg-white/15 px-1.5 py-0.5 text-[10px] font-medium text-white">
            {data.pendingMethodCount} {t("paymentPage.summary.paymentMethods")}
          </span>
        </div>
      </div>
    </div>
  );
}
