import { apiClient } from "@/shared/lib/api/client";

const IMPORT_BRANDS_ENDPOINT = "/api/company/brands/excel/import";

export interface ImportBrandsResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export async function importBrandsService(
  file: File,
): Promise<ImportBrandsResponse> {
  const formData = new FormData();
  formData.append("file", file, file.name);

  const response = await apiClient.post<ImportBrandsResponse>(
    IMPORT_BRANDS_ENDPOINT,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}
