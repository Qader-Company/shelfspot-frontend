"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getAdminProfile, updateAdminProfile } from "./service";

export const adminProfileQueryKey = ["admin", "profile"] as const;

export function useAdminProfile() {
  return useQuery({
    queryKey: adminProfileQueryKey,
    queryFn: getAdminProfile,
  });
}

export function useUpdateAdminProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateAdminProfile,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminProfileQueryKey });
    },
  });
}
