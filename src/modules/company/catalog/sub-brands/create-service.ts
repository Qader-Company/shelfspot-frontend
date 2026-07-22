import { apiClient } from "@/shared/lib/api/client";

const SUB_BRANDS_ENDPOINT = "/api/company/sub-brands";

export interface CreateSubBrandPayload {
  brandId: string;
  nameEn: string;
  nameAr: string;
  isActive: boolean;
  logo: File;
}

export interface CreateSubBrandResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export async function createSubBrandService(
  payload: CreateSubBrandPayload,
): Promise<CreateSubBrandResponse> {
  const formData = new FormData();

  formData.append("translations[en][name]", payload.nameEn);
  formData.append("translations[ar][name]", payload.nameAr);
  formData.append("is_active", payload.isActive ? "1" : "0");
  formData.append("brand_id", payload.brandId);
  formData.append("logo", payload.logo, payload.logo.name);

  const response = await apiClient.post<CreateSubBrandResponse>(
    SUB_BRANDS_ENDPOINT,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}
