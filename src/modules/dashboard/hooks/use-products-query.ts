"use client";

import { useQuery } from "@tanstack/react-query";

import { getProductsService } from "@/modules/dashboard/services/get-products-service";
import type { GetProductsParams } from "@/modules/dashboard/types/product";
import { QUERY_KEYS } from "@/shared/lib/query/keys";

export function useProductsQuery(params?: GetProductsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.products(params as Record<string, unknown>),
    queryFn: () => getProductsService(params),
  });
}
