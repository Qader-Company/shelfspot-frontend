import { apiClient } from "@/shared/lib/api/client";
import type {
  GetProductsParams,
  GetProductsResponse,
} from "@/modules/dashboard/types/product";

const PRODUCTS_ENDPOINT = "/api/company/products";

export async function getProductsService(
  params?: GetProductsParams,
): Promise<GetProductsResponse> {
  const response = await apiClient.get<GetProductsResponse>(
    PRODUCTS_ENDPOINT,
    { params },
  );
  return response.data;
}
