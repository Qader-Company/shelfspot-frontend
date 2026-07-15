import { apiClient } from "@/shared/lib/api/client";

export interface DeleteBrandResponse {
  success: boolean;
  message: string;
}

export async function deleteBrandService(
  id: string,
): Promise<DeleteBrandResponse> {
  const response = await apiClient.delete<DeleteBrandResponse>(
    `/api/company/brands/${encodeURIComponent(id)}`,
  );

  return response.data;
}
