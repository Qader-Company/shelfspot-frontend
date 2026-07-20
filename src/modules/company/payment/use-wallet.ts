"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { getTransactionTypes, getWallet, rechargeWallet } from "./wallet-api";

export const useWallet = (params: Record<string, unknown>) => useQuery({ queryKey: ["app", "wallet", params], queryFn: () => getWallet(params) });
export const useTransactionTypes = () => useQuery({ queryKey: ["app", "transaction-types"], queryFn: getTransactionTypes });
export const useRechargeWallet = () => useMutation({ mutationFn: rechargeWallet });
