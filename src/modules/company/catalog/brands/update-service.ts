import type {
  CreateBrandPayload,
  CreateBrandResponse,
} from "@/modules/company/catalog/brands/create-service";
import { apiClient } from "@/shared/lib/api/client";

export interface UpdateBrandServiceParams {
  id: string;
  payload: CreateBrandPayload & { logoAction?: "keep" | "remove" | "replace" };
}

export async function updateBrandService({
  id,
  payload,
}: UpdateBrandServiceParams): Promise<CreateBrandResponse> {
  const formData = new FormData();

  formData.append("_method", "put");
  formData.append("translations[en][name]", payload.nameEn);
  formData.append("translations[ar][name]", payload.nameAr);
  formData.append("is_active", payload.isActive ? "1" : "0");
  formData.append("logo_action", payload.logoAction ?? (payload.logo ? "replace" : "keep"));

  if (payload.logo) {
    formData.append("logo", payload.logo, payload.logo.name);
  }

  const response = await apiClient.post<CreateBrandResponse>(
    `/api/company/brands/${encodeURIComponent(id)}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}
