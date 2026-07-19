"use client";

import { useQuery } from "@tanstack/react-query";
import { getSubBrandsService } from "@/modules/dashboard/services/get-sub-brands-service";
import type { GetSubBrandsParams } from "@/modules/dashboard/types/sub-brand";
import { QUERY_KEYS } from "@/shared/lib/query/keys";

export function useSubBrandsQuery(params: GetSubBrandsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.subBrands(params as Record<string, unknown>),
    queryFn: () => getSubBrandsService(params),
    placeholderData: (previous) => previous,
  });
}
