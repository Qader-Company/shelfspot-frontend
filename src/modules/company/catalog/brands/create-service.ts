import { apiClient } from "@/shared/lib/api/client";

const BRANDS_ENDPOINT = "/api/company/brands";

export interface CreateBrandPayload {
  nameEn: string;
  nameAr: string;
  isActive: boolean;
  logo?: File;
}

export interface CreateBrandResponse {
  success: boolean;
  message: string;
  data?: unknown;
}

export async function createBrandService(
  payload: CreateBrandPayload,
): Promise<CreateBrandResponse> {
  const formData = new FormData();

  formData.append("translations[en][name]", payload.nameEn);
  formData.append("translations[ar][name]", payload.nameAr);
  formData.append("is_active", payload.isActive ? "1" : "0");

  if (payload.logo) {
    formData.append("logo", payload.logo, payload.logo.name);
  }

  const response = await apiClient.post<CreateBrandResponse>(
    BRANDS_ENDPOINT,
    formData,
    {
      // Override apiClient's application/json default. Axios will let the
      // browser attach the multipart boundary for this FormData request.
      headers: {
        "Content-Type": "multipart/form-data",
      },
    },
  );

  return response.data;
}
