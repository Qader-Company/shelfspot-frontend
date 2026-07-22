"use client";

import { useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { AddIcon } from "@/shared/components/dashboard/dashboard-icons";
import { SearchInput } from "@/shared/components/dashboard/search-input";
import { normalizeApiError } from "@/shared/lib/api/errors";
import { Button } from "@/shared/ui/button";
import { AddFundDialog } from "./add-fund-dialog";
import { PaymentSummaryCard } from "./payment-summary-card";
import { PaymentsTable } from "./payments-table";
import type { PaymentTransaction, PaymentTransactionStatus, PaymentTransactionType } from "./payments.seed";
import { useRedeemWalletCoupon, useTransactionTypes, useWallet } from "./use-wallet";

const money = (value: string | number | undefined) => new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(Number(value ?? 0));
export function PaymentsPage() {
  const t = useTranslations("dashboard"); const [open, setOpen] = useState(false); const [search, setSearch] = useState(""); const [type, setType] = useState("");
  const wallet = useWallet({ per_page: 100 }); const types = useTransactionTypes(); const redeemCoupon = useRedeemWalletCoupon();
  const rows = useMemo<PaymentTransaction[]>(() => (wallet.data?.transactions ?? []).filter(item => { const itemType = item.transaction_type ?? item.type ?? ""; return (!type || itemType === type) && `${itemType} ${item.amount ?? ""}`.toLowerCase().includes(search.toLowerCase()); }).map(item => { const rawStatus = String(item.status ?? "completed").toLowerCase(); const status: PaymentTransactionStatus = rawStatus === "failed" ? "failed" : rawStatus === "refunded" ? "refunded" : "completed"; return { id: String(item.id), typeKey: String(item.transaction_type ?? item.type ?? "manualWalletRecharge") as PaymentTransactionType, amount: money(item.amount), direction: item.direction ?? (Number(item.amount ?? 0) < 0 ? "debit" : "credit"), date: item.created_at ?? item.date ? new Date(String(item.created_at ?? item.date)).toLocaleString() : "-", status }; }), [wallet.data, search, type]);
  const error = wallet.error ?? types.error;
  return <div className="space-y-6 px-4 py-8 lg:px-8">
    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between"><div><h1 className="text-3xl font-bold">{t("paymentPage.title")}</h1><p className="mt-2 text-lg font-medium text-muted-foreground">{t("paymentPage.subtitle")}</p></div><Button className="h-12 px-6 text-white" onClick={() => setOpen(true)}><AddIcon className="size-5"/>{t("paymentPage.actions.addFund")}</Button></div>
    <PaymentSummaryCard data={{ balance: money(wallet.data?.balance ?? wallet.data?.current_balance), accountId: String(wallet.data?.id ?? "-"), monthlySpending: money(wallet.data?.monthly_spending), pendingAmount: money(wallet.data?.pending_amount), pendingMethodCount: wallet.data?.pending_count ?? 0 }}/>
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"><SearchInput label={t("paymentPage.search.label")} placeholder={t("paymentPage.search.placeholder")} value={search} onChange={e => setSearch(e.target.value)} className="max-w-[420px]"/><select value={type} onChange={e => setType(e.target.value)} className="h-10 rounded-lg border bg-card px-4 text-sm"><option value="">{t("paymentPage.filters.allStatuses")}</option>{types.data?.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}</select></div>
    {error && <p className="rounded-xl border border-destructive/20 bg-destructive/10 p-4 text-destructive">{normalizeApiError(error).message}</p>}
    <PaymentsTable rows={rows} labels={{ types:t("paymentPage.table.columns.types"), totalSpending:t("paymentPage.table.columns.totalSpending"), date:t("paymentPage.table.columns.date"), status:t("paymentPage.table.columns.status"), action:t("paymentPage.table.columns.action"), delete:t("paymentPage.table.actions.delete") }} resolveType={key => types.data?.find(x => x.value === key)?.label ?? key} resolveStatus={status => t(`paymentPage.status.${status}` as Parameters<typeof t>[0])}/>
    <AddFundDialog isOpen={open} onClose={() => setOpen(false)} onRedeem={code => redeemCoupon.mutateAsync({ code })}/>
  </div>;
}
