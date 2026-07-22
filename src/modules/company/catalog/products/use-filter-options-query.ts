"use client";

import { useQuery } from "@tanstack/react-query";
import { apiClient } from "@/shared/lib/api/client";

export interface ProductFilterOption { id: string | number; name: string; }
interface FilterOptionsData {
  brands?: ProductFilterOption[];
  sub_brands?: ProductFilterOption[];
  categories?: ProductFilterOption[];
  sub_categories?: ProductFilterOption[];
}

export function useProductFilterOptionsQuery(params: {
  brand_id?: string;
  sub_brand_id?: string;
  category_id?: string;
  sub_category_id?: string;
}) {
  return useQuery({
    queryKey: ["app", "product-filter-options", params],
    queryFn: async () => {
      const response = await apiClient.get<{ success: boolean; data: FilterOptionsData }>(
        "/api/company/products/filter-options",
        { params },
      );
      return response.data.data;
    },
    placeholderData: (previous) => previous,
  });
}
