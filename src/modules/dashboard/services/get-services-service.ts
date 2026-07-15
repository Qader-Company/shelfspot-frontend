import { apiClient } from "@/shared/lib/api/client";
import type { GetServicesResponse } from "@/modules/dashboard/types/service";

const SERVICES_ENDPOINT = "/api/company/services";

export async function getServicesService(): Promise<GetServicesResponse> {
  const response = await apiClient.get<GetServicesResponse>(SERVICES_ENDPOINT);
  return response.data;
}
