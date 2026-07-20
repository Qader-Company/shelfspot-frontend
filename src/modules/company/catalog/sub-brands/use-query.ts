"use client";

import { useQuery } from "@tanstack/react-query";
import { getSubBrandsService } from "@/modules/company/catalog/sub-brands/get-service";
import type { GetSubBrandsParams } from "@/modules/company/catalog/sub-brands/types";
import { QUERY_KEYS } from "@/shared/lib/query/keys";

export function useSubBrandsQuery(params: GetSubBrandsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.subBrands(params as Record<string, unknown>),
    queryFn: () => getSubBrandsService(params),
    placeholderData: (previous) => previous,
  });
}
