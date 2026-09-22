"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { approveWithdrawal, getPayment, getPayments, getWithdrawal, getWithdrawals } from "./service";
import type { PaymentsParams, WithdrawalsParams } from "./types";

export const paymentsQueryKey = (params?: PaymentsParams) =>
  ["admin", "payments", params] as const;

export function usePayments(params?: PaymentsParams) {
  return useQuery({
    queryKey: paymentsQueryKey(params),
    queryFn: () => getPayments(params),
    placeholderData: (previous) => previous,
  });
}

export function usePayment(id: string) {
  return useQuery({
    queryKey: ["admin", "payments", id],
    queryFn: () => getPayment(id),
    enabled: Boolean(id),
  });
}

// ─── Withdrawals ──────────────────────────────────────────────────────────────

export const withdrawalsQueryKey = (params?: WithdrawalsParams) =>
  ["admin", "withdrawals", params] as const;

export function useWithdrawals(params?: WithdrawalsParams) {
  return useQuery({
    queryKey: withdrawalsQueryKey(params),
    queryFn: () => getWithdrawals(params),
    placeholderData: (previous) => previous,
  });
}

export function useWithdrawal(id: string) {
  return useQuery({
    queryKey: ["admin", "withdrawals", id],
    queryFn: () => getWithdrawal(id),
    enabled: Boolean(id),
  });
}

export function useApproveWithdrawal() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => approveWithdrawal(id),
    onSuccess: () => {
      // Invalidate all withdrawals queries so the list refreshes
      queryClient.invalidateQueries({ queryKey: ["admin", "withdrawals"] });
    },
  });
}
