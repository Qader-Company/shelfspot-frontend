import { apiClient } from "@/shared/lib/api/client";

export async function deleteSubBrandService(id: string): Promise<{ success: boolean; message: string }> {
  const response = await apiClient.delete<{ success: boolean; message: string }>(`/api/company/sub-brands/${encodeURIComponent(id)}`);
  return response.data;
}
