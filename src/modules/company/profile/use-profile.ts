"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getCompanyProfile, updateCompanyProfile } from "./service";

const PROFILE_QUERY_KEY = ["app", "company", "profile"] as const;

export function useCompanyProfile() {
  return useQuery({ queryKey: PROFILE_QUERY_KEY, queryFn: getCompanyProfile });
}

export function useUpdateCompanyProfile() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: updateCompanyProfile,
    onSuccess: (profile) => queryClient.setQueryData(PROFILE_QUERY_KEY, profile),
  });
}
