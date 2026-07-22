"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { getTransactionTypes, getWallet, redeemWalletCoupon } from "./wallet-api";

export const useWallet = (params: Record<string, unknown>) => useQuery({ queryKey: ["app", "wallet", params], queryFn: () => getWallet(params) });
export const useTransactionTypes = () => useQuery({ queryKey: ["app", "transaction-types"], queryFn: getTransactionTypes });
export const useRedeemWalletCoupon = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: redeemWalletCoupon,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["app", "wallet"] }),
  });
};
