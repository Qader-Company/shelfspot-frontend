"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AddIcon } from "@/shared/components/dashboard/dashboard-icons";
import { PageLoadingSkeleton } from "@/shared/components/feedback";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { Button } from "@/shared/ui/button";
import { AddFundDialog } from "./add-fund-dialog";
import { PaymentSummaryCard } from "./payment-summary-card";
import { PaymentsTable } from "./payments-table";
import type { PaymentTransaction } from "./payments.seed";
import { useRedeemWalletCoupon, useTransactionTypes, useWallet } from "./use-wallet";

const money = (value: string | number | undefined) => new Intl.NumberFormat(undefined, { style: "currency", currency: "SAR" }).format(Number(value ?? 0));
const transactionDirection = (type: string, direction?: "credit" | "debit"): "credit" | "debit" => {
  if (direction) return direction;
  return type === "task_payment" || type === "taskPayment" ? "debit" : "credit";
};
export function PaymentsPage() {
  const t = useTranslations("dashboard"); const [open, setOpen] = useState(false); const [type, setType] = useState("");
  const wallet = useWallet({ per_page: 100 }); const types = useTransactionTypes(); const redeemCoupon = useRedeemWalletCoupon();
  const rows = useMemo<PaymentTransaction[]>(() => (wallet.data?.transactions ?? []).filter(item => { const itemType = item.transaction_type ?? item.type ?? ""; return !type || itemType === type; }).map(item => { const itemType = String(item.transaction_type ?? item.type ?? ""); return { id: String(item.id), typeLabel: item.type_label ?? (itemType || "-"), amount: money(item.amount), direction: transactionDirection(itemType, item.direction), date: item.created_at ?? item.date ? new Date(String(item.created_at ?? item.date)).toLocaleDateString() : "-", performedBy: item.performed_by?.name ?? "-" }; }), [wallet.data, type]);
  const error = wallet.error ?? types.error;
  if (wallet.isPending || types.isPending) return <PageLoadingSkeleton actionCount={1} cardCount={1} tableRows={7} tableColumns={4} />;
  return <div className="space-y-6 px-4 py-8 lg:px-8">
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><h1 className="text-3xl font-bold">{t("paymentPage.title")}</h1><p className="mt-2 text-lg font-medium text-muted-foreground">{t("paymentPage.subtitle")}</p></div><Button className="h-12 px-6 text-white" onClick={() => setOpen(true)}><AddIcon className="size-5"/>{t("paymentPage.actions.addFund")}</Button></div>
    <PaymentSummaryCard data={{ balance: money(wallet.data?.balance ?? wallet.data?.current_balance) }}/>
    <div className="flex justify-end"><select value={type} onChange={e => setType(e.target.value)} className="h-10 rounded-lg border bg-card px-4 text-sm"><option value="">{t("paymentPage.filters.allStatuses")}</option>{types.data?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
    {error && <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">{normalizeApiError(error).message}</p>}
    <PaymentsTable rows={rows} labels={{ types:t("paymentPage.table.columns.types"), totalSpending:t("paymentPage.table.columns.totalSpending"), date:t("paymentPage.table.columns.date"), performedBy:t("paymentPage.table.columns.performedBy") }}/>
    <AddFundDialog isOpen={open} onClose={() => setOpen(false)} onRedeem={code => redeemCoupon.mutateAsync({ code })}/>
  </div>;
}
