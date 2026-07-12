import type { StatusBadgeStatus } from "@/modules/dashboard/components/status-badge";

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

export type PaymentMethodKey = "promoCode" | "creditCard" | "bankTransfer";

export type PromoBadgeVariant = "brand" | "danger";

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

export interface PromoCodeItem {
  id: string;
  variant: PromoBadgeVariant;
}

export const paymentSummaryData: PaymentSummaryData = {
  balance: "$12,665.00",
  accountId: "ACC-2847-9256-1043",
  monthlySpending: "$24,850",
  pendingAmount: "$24,850",
  pendingMethodCount: 3,
};

export const paymentTransactions: PaymentTransaction[] = [
  { id: "pmt-1", typeKey: "couponRedemption",     amount: "3455$", direction: "credit", date: "Mar 19, 2026", status: "refunded"  },
  { id: "pmt-2", typeKey: "manualWalletRecharge",  amount: "3455$", direction: "credit", date: "Mar 19, 2026", status: "completed" },
  { id: "pmt-3", typeKey: "taskPayment",            amount: "3455$", direction: "debit",  date: "Mar 19, 2026", status: "failed"    },
  { id: "pmt-4", typeKey: "taskRefund",             amount: "3455$", direction: "credit", date: "Mar 19, 2026", status: "completed" },
  { id: "pmt-5", typeKey: "couponRedemption",       amount: "3455$", direction: "debit",  date: "Mar 19, 2026", status: "refunded"  },
  { id: "pmt-6", typeKey: "couponRedemption",       amount: "3455$", direction: "credit", date: "Mar 19, 2026", status: "failed"    },
  { id: "pmt-7", typeKey: "couponRedemption",       amount: "3455$", direction: "debit",  date: "Mar 19, 2026", status: "completed" },
  { id: "pmt-8", typeKey: "couponRedemption",       amount: "3455$", direction: "debit",  date: "Mar 19, 2026", status: "failed"    },
];

export const paymentPagination = {
  pages: ["1", "2", "3", "...", "8", "9", "10"],
  activePage: "1",
};

export const paymentMethodKeys: PaymentMethodKey[] = [
  "promoCode",
  "creditCard",
  "bankTransfer",
];

export const availablePromoCodes: PromoCodeItem[] = [
  { id: "welcomeBonus", variant: "brand"  },
  { id: "credit100",    variant: "danger" },
];
