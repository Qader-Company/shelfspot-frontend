import type { GetBrandsMeta } from "@/modules/company/dashboard/types/brand";
import type { CompanySubBrand, GetSubBrandsParams, GetSubBrandsResponse } from "@/modules/company/dashboard/types/sub-brand";
import { apiClient } from "@/shared/lib/api/client";

type Paginated = Partial<GetBrandsMeta> & { data: CompanySubBrand[]; meta?: GetBrandsMeta };
type RawResponse = Omit<GetSubBrandsResponse, "data"> & { data: CompanySubBrand[] | Paginated; pagination?: GetBrandsMeta };

export async function getSubBrandsService(params: GetSubBrandsParams): Promise<GetSubBrandsResponse> {
  const response = await apiClient.get<RawResponse>("/api/company/sub-brands", { params });
  const payload = response.data;
  if (Array.isArray(payload.data)) return payload as GetSubBrandsResponse;
  const paginated = payload.data;
  return {
    success: payload.success,
    message: payload.message,
    data: paginated.data,
    meta: paginated.meta ?? payload.pagination ?? (paginated.current_page != null && paginated.last_page != null ? {
      current_page: paginated.current_page,
      last_page: paginated.last_page,
      per_page: paginated.per_page ?? params.per_page ?? 10,
      total: paginated.total ?? paginated.data.length,
    } : undefined),
  };
}
