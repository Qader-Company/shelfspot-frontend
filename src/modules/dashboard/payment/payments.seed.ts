import type { StatusBadgeStatus } from "@/shared/components/dashboard/status-badge";

export type PaymentTransactionType =
  | "couponRedemption"
  | "manualWalletRecharge"
  | "taskPayment"
  | "taskRefund";

export type PaymentTransactionStatus = Extract<
  StatusBadgeStatus,
  "refunded" | "completed" | "failed"
>;

export type PaymentDirection = "credit" | "debit";

export interface PaymentTransaction {
  id: string;
  typeKey: PaymentTransactionType;
  amount: string;
  direction: PaymentDirection;
  date: string;
  status: PaymentTransactionStatus;
}

export interface PaymentSummaryData {
  balance: string;
  accountId: string;
  monthlySpending: string;
  pendingAmount: string;
  pendingMethodCount: number;
}
