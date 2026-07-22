export type PaymentDirection = "credit" | "debit";

export interface PaymentTransaction {
  id: string;
  typeLabel: string;
  amount: string;
  direction: PaymentDirection;
  date: string;
  performedBy: string;
}

export interface PaymentSummaryData {
  balance: string;
  accountId: string;
  monthlySpending: string;
  pendingAmount: string;
  pendingMethodCount: number;
}
