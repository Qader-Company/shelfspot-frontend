import { apiClient } from "@/shared/lib/api/client";
import type { CreateSubBrandResponse } from "./create-service";

export interface UpdateSubBrandPayload {
  brandId: string;
  nameEn: string;
  nameAr: string;
  isActive: boolean;
  logo?: File;
  logoAction?: "keep" | "remove" | "replace";
}

export async function updateSubBrandService({ id, payload }: { id: string; payload: UpdateSubBrandPayload }): Promise<CreateSubBrandResponse> {
  const formData = new FormData();
  formData.append("translations[en][name]", payload.nameEn);
  formData.append("translations[ar][name]", payload.nameAr);
  formData.append("is_active", payload.isActive ? "1" : "0");
  formData.append("brand_id", payload.brandId);
  formData.append("_method", "put");
  formData.append("logo_action", payload.logoAction ?? (payload.logo ? "replace" : "keep"));
  if (payload.logo) formData.append("logo", payload.logo, payload.logo.name);

  const response = await apiClient.post<CreateSubBrandResponse>(`/api/company/sub-brands/${encodeURIComponent(id)}`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
}
