"use client";

import { useQuery } from "@tanstack/react-query";

import { getServicesService } from "@/modules/company/requests/create/services-service";
import { QUERY_KEYS } from "@/shared/lib/query/keys";

export function useServicesQuery() {
  return useQuery({
    queryKey: QUERY_KEYS.services,
    queryFn: getServicesService,
    staleTime: 5 * 60 * 1000, // 5 min — services rarely change
  });
}
