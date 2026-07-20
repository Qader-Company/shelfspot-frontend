import { apiClient } from "@/shared/lib/api/client";

export type CatalogStatusResource =
  | "brands"
  | "sub-brands"
  | "categories"
  | "sub-categories"
  | "products";

export async function updateCatalogStatusService({
  resource,
  id,
  isActive,
}: {
  resource: CatalogStatusResource;
  id: string;
  isActive: boolean;
}) {
  const formData = new FormData();
  formData.append("is_active", isActive ? "1" : "0");
  formData.append("_method", "put");

  const response = await apiClient.post<{ success: boolean; message: string }>(
    `/api/company/${resource}/${encodeURIComponent(id)}`,
    formData,
    { headers: { "Content-Type": "multipart/form-data" } },
  );

  return response.data;
}
