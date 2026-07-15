import { apiClient } from "@/shared/lib/api/client";

export async function importSubBrandsService(file: File): Promise<{ success: boolean; message: string }> {
  const formData = new FormData();
  formData.append("file", file, file.name);
  const response = await apiClient.post<{ success: boolean; message: string }>("/api/company/sub-brands/excel/import", formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
