import { apiClient } from "@/shared/lib/api/client";
import type {
  GetProductsParams,
  GetProductsResponse,
} from "@/modules/company/dashboard/types/product";

const PRODUCTS_ENDPOINT = "/api/company/products";

export async function getProductsService(
  params?: GetProductsParams,
): Promise<GetProductsResponse> {
  const response = await apiClient.get<GetProductsResponse | (Omit<GetProductsResponse, "data"> & { data: GetProductsResponse["data"] | (Partial<NonNullable<GetProductsResponse["meta"]>> & { data: GetProductsResponse["data"]; meta?: GetProductsResponse["meta"] }) })>(
    PRODUCTS_ENDPOINT,
    { params },
  );
  const payload = response.data;
  if (Array.isArray(payload.data)) return payload as GetProductsResponse;
  const page = payload.data;
  return { success: payload.success, message: payload.message, data: page.data, meta: page.meta ?? (page.current_page != null && page.last_page != null ? { current_page: page.current_page, last_page: page.last_page, per_page: page.per_page ?? params?.per_page ?? 10, total: page.total ?? page.data.length } : undefined) };
}
