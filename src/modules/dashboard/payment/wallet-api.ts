import { apiClient } from "@/shared/lib/api/client";

export interface WalletTransaction {
  id: string | number;
  type?: string;
  transaction_type?: string;
  amount?: string | number;
  direction?: "credit" | "debit";
  status?: string;
  created_at?: string;
  date?: string;
}
export interface WalletData {
  id?: string | number;
  balance?: string | number;
  current_balance?: string | number;
  monthly_spending?: string | number;
  pending_amount?: string | number;
  pending_count?: number;
  transactions: WalletTransaction[];
  meta?: { current_page?: number; last_page?: number; total?: number };
}

const object = (value: unknown): Record<string, unknown> => value && typeof value === "object" ? value as Record<string, unknown> : {};
export async function getWallet(params: Record<string, unknown>): Promise<WalletData> {
  const response = await apiClient.get("/api/company/wallets", { params });
  const root = object(response.data); const first = object(root.data); const payload = object(first.data ?? root.data);
  const transactionContainer = object(payload.transactions ?? first.transactions ?? root.transactions);
  const transactionSource = Array.isArray(first.data) ? first.data : Array.isArray(payload.transactions) ? payload.transactions : Array.isArray(first.transactions) ? first.transactions : Array.isArray(root.transactions) ? root.transactions : Array.isArray(transactionContainer.data) ? transactionContainer.data : [];
  const wallet = Array.isArray(first.data) ? object(first.wallet ?? root.wallet) : payload;
  return { id: wallet.id as string | number | undefined, balance: (wallet.balance ?? first.balance ?? root.balance) as string | number | undefined, current_balance: wallet.current_balance as string | number | undefined, monthly_spending: wallet.monthly_spending as string | number | undefined, pending_amount: wallet.pending_amount as string | number | undefined, pending_count: Number(wallet.pending_count ?? 0), transactions: transactionSource as WalletTransaction[], meta: object(first.meta ?? root.meta) };
}
export const getWalletById = (id: string | number) => apiClient.get(`/api/company/wallets/${id}`).then(response => response.data);
export async function getTransactionTypes(): Promise<Array<{ value: string; label: string }>> {
  const response = await apiClient.get("/api/enums/transactions-types"); const root = object(response.data); const data = root.data ?? response.data;
  if (Array.isArray(data)) return data.map(item => typeof item === "string" ? { value: item, label: item } : { value: String(object(item).value ?? object(item).id ?? object(item).key ?? object(item).name), label: String(object(item).label ?? object(item).name ?? object(item).value) });
  return Object.entries(object(data)).map(([value, label]) => ({ value, label: String(label) }));
}
export const rechargeWallet = (payload: { amount: number }) => apiClient.post("/api/company/wallets/recharge", payload).then(r => r.data);
