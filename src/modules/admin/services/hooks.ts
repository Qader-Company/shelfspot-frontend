"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getService, getServices, updateService } from "./service";
import type { AdminService, ServicePayload } from "./types";

export const serviceKeys = {
  all: ["admin", "services"] as const,
  list: (active?: boolean) => ["admin", "services", { active }] as const,
  detail: (key: string) => ["admin", "services", key] as const,
};

export function useServices(active?: boolean) {
  return useQuery({
    queryKey: serviceKeys.list(active),
    queryFn: () => getServices(active),
  });
}

export function useService(key: string) {
  return useQuery({
    queryKey: serviceKeys.detail(key),
    queryFn: () => getService(key),
    enabled: Boolean(key),
  });
}

export function useUpdateService() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (v: { id: AdminService["id"]; payload: ServicePayload }) =>
      updateService(v),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: serviceKeys.all }),
  });
}
