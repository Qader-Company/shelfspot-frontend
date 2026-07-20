"use client";

import { useQuery } from "@tanstack/react-query";

import { getProductsService } from "@/modules/company/catalog/products/get-service";
import type { GetProductsParams } from "@/modules/company/catalog/products/types";
import { QUERY_KEYS } from "@/shared/lib/query/keys";

export function useProductsQuery(params?: GetProductsParams) {
  return useQuery({
    queryKey: QUERY_KEYS.products(params as Record<string, unknown>),
    queryFn: () => getProductsService(params),
  });
}
