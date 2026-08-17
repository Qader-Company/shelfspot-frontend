"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getAdminProfile, getPlatformSettings, updateAdminProfile, updatePlatformSettings } from "./service";

export const platformSettingsQueryKey = ["platform-settings"] as const;

export function usePlatformSettings() {
  return useQuery({ queryKey: platformSettingsQueryKey, queryFn: getPlatformSettings });
}

export function useUpdatePlatformSettings() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updatePlatformSettings,
    onSuccess: (response) => {
      queryClient.setQueryData(platformSettingsQueryKey, response.data);
      void queryClient.invalidateQueries({ queryKey: platformSettingsQueryKey });
    },
  });
}

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
