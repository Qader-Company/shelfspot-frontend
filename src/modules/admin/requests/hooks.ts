"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { assignAdminRequest, getAdminRequest, getAdminRequests, getNearbyMerchandisers } from "./service";
import type { AdminRequestParams } from "./types";
export function useAdminRequests(params: AdminRequestParams) { return useQuery({ queryKey: ["admin", "requests", params], queryFn: () => getAdminRequests(params), placeholderData: (previous) => previous }); }
export function useAdminRequest(id: string) { return useQuery({ queryKey: ["admin", "requests", id], queryFn: () => getAdminRequest(id) }); }
export function useNearbyMerchandisers(requestId: string, enabled: boolean) { return useQuery({ queryKey: ["admin", "requests", requestId, "nearby-merchandisers"], queryFn: getNearbyMerchandisers, enabled }); }
export function useAssignAdminRequest() { return useMutation({ mutationFn: assignAdminRequest }); }
