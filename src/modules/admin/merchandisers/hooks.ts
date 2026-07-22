"use client";

import { useMutation, useQuery } from "@tanstack/react-query";
import { createMerchandiser, deleteMerchandiser, deleteMerchandiserRequest, getMerchandiser, getMerchandisers, updateMerchandiser, updateMerchandiserStatus } from "./service";
import type { MerchandiserListParams } from "./types";

export const merchandisersQueryKey = (params?: MerchandiserListParams) => ["admin", "merchandisers", params] as const;

export function useMerchandisers(params: MerchandiserListParams) {
  return useQuery({ queryKey: merchandisersQueryKey(params), queryFn: () => getMerchandisers(params), placeholderData: (previous) => previous });
}

export function useMerchandiser(id: string) {
  return useQuery({ queryKey: ["admin", "merchandisers", id], queryFn: () => getMerchandiser(id) });
}

export function useCreateMerchandiser() { return useMutation({ mutationFn: createMerchandiser }); }
export function useUpdateMerchandiser() { return useMutation({ mutationFn: updateMerchandiser }); }
export function useDeleteMerchandiser() { return useMutation({ mutationFn: deleteMerchandiser }); }
export function useUpdateMerchandiserStatus() { return useMutation({ mutationFn: updateMerchandiserStatus }); }
export function useDeleteMerchandiserRequest() { return useMutation({ mutationFn: deleteMerchandiserRequest }); }
