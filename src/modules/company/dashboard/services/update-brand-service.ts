import type {
  CreateBrandPayload,
  CreateBrandResponse,
} from "@/modules/company/dashboard/services/create-brand-service";
import { apiClient } from "@/shared/lib/api/client";

export interface UpdateBrandServiceParams {
  id: string;
  payload: CreateBrandPayload;
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
