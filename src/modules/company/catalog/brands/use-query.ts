"use client";

import { useQuery } from "@tanstack/react-query";

import { getBrandsService } from "@/modules/company/catalog/brands/get-service";
import type { GetBrandsParams } from "@/modules/company/catalog/brands/types";
import { QUERY_KEYS } from "@/shared/lib/query/keys";

export function useBrandsQuery(params: GetBrandsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.brands(params as Record<string, unknown>),
    queryFn: () => getBrandsService(params),
    placeholderData: (previousData) => previousData,
  });
}
