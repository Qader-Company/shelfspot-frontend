import type {
  CompanyBrand,
  GetBrandsMeta,
  GetBrandsParams,
  GetBrandsResponse,
} from "@/modules/dashboard/types/brand";
import { apiClient } from "@/shared/lib/api/client";

const BRANDS_ENDPOINT = "/api/company/brands";

type PaginatedBrands = Partial<GetBrandsMeta> & {
  data: CompanyBrand[];
  meta?: GetBrandsMeta;
};

type RawGetBrandsResponse = Omit<GetBrandsResponse, "data"> & {
  data: CompanyBrand[] | PaginatedBrands;
  pagination?: GetBrandsMeta;
};

export async function getBrandsService(
  params: GetBrandsParams,
): Promise<GetBrandsResponse> {
  const response = await apiClient.get<RawGetBrandsResponse>(BRANDS_ENDPOINT, {
    params,
  });

  const payload = response.data;
  if (Array.isArray(payload.data)) return payload as GetBrandsResponse;

  const paginated = payload.data;
  const meta =
    paginated.meta ??
    payload.pagination ??
    (paginated.current_page != null && paginated.last_page != null
      ? {
          current_page: paginated.current_page,
          last_page: paginated.last_page,
          per_page: paginated.per_page ?? params.per_page ?? 10,
          total: paginated.total ?? paginated.data.length,
        }
      : undefined);

  return {
    success: payload.success,
    message: payload.message,
    data: paginated.data,
    meta,
  };
}
