"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createPromoCode, deletePromoCode, getPromoCode, getPromoCodes, updatePromoCode, updatePromoStatus } from "./service";
import type { PromoListParams } from "./types";
export function usePromoCodes(params: PromoListParams) { return useQuery({ queryKey: ["admin", "promo-codes", "list", params], queryFn: () => getPromoCodes(params), placeholderData: (previous) => previous }); }
export function usePromoCode(id: string, enabled: boolean) { return useQuery({ queryKey: ["admin", "promo-codes", "detail", id], queryFn: () => getPromoCode(id), enabled }); }
export function useCreatePromoCode() { return useMutation({ mutationFn: createPromoCode }); }
export function useUpdatePromoCode() { return useMutation({ mutationFn: updatePromoCode }); }
export function useDeletePromoCode() { return useMutation({ mutationFn: deletePromoCode }); }
export function useUpdatePromoStatus() { return useMutation({ mutationFn: updatePromoStatus }); }
