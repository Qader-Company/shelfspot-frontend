"use client";

import { useQuery } from "@tanstack/react-query";

import { getPayment, getPayments } from "./service";
import type { PaymentsParams } from "./types";

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
