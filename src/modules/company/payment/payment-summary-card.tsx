"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
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

    </div>
  );
}
