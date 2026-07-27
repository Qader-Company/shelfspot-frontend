"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  assignAdminRequest,
  deleteCompanyDeletedRequest,
  getAdminRequest,
  getAdminRequests,
  getNearbyMerchandisers,
  reopenAdminRequest,
} from "./service";
import type { AdminRequestParams } from "./types";

const requestsKey = ["admin", "requests"] as const;

export function useAdminRequests(params: AdminRequestParams) {
  return useQuery({
    queryKey: [...requestsKey, "list", params],
    queryFn: () => getAdminRequests(params),
    placeholderData: (previous) => previous,
  });
}

export function useAdminRequest(id: string) {
  return useQuery({
    queryKey: [...requestsKey, "details", id],
    queryFn: () => getAdminRequest(id),
  });
}

export function useNearbyMerchandisers(requestId: string, radiusKm: number, enabled: boolean) {
  return useQuery({
    queryKey: [...requestsKey, "details", requestId, "available-workers", radiusKm],
    queryFn: () => getNearbyMerchandisers(requestId, radiusKm),
    enabled,
  });
}

function useRefreshRequests() {
  const queryClient = useQueryClient();
  return (requestId?: string) => Promise.all([
    queryClient.invalidateQueries({ queryKey: requestsKey }),
    ...(requestId ? [queryClient.invalidateQueries({ queryKey: [...requestsKey, "details", requestId] })] : []),
  ]);
}

export function useAssignAdminRequest() {
  const refresh = useRefreshRequests();
  return useMutation({
    mutationFn: assignAdminRequest,
    onSuccess: (_, input) => refresh(input.requestId),
  });
}

export function useReopenAdminRequest() {
  const refresh = useRefreshRequests();
  return useMutation({
    mutationFn: reopenAdminRequest,
    onSuccess: (_, requestId) => refresh(requestId),
  });
}

export function useDeleteCompanyDeletedRequest() {
  const refresh = useRefreshRequests();
  return useMutation({
    mutationFn: deleteCompanyDeletedRequest,
    onSuccess: () => refresh(),
  });
}
