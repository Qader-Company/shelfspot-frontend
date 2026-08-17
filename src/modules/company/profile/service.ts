import { apiClient } from "@/shared/lib/api/client";

export interface CompanyProfile {
  id: number;
  name: string;
  email: string;
  type: string;
  company_id: number;
  is_owner: boolean;
  is_active: boolean;
  roles?: Array<string | { name: string }>;
}

interface ProfileResponse {
  success: boolean;
  data: CompanyProfile;
  message?: string;
}

export interface UpdateCompanyProfilePayload {
  name: string;
  email: string;
  password?: string;
  password_confirmation?: string;
}

export async function getCompanyProfile(): Promise<CompanyProfile> {
  const response = await apiClient.get<ProfileResponse>("/api/company/profile");
  return response.data.data;
}

export async function updateCompanyProfile(payload: UpdateCompanyProfilePayload): Promise<CompanyProfile> {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("email", payload.email);
  if (payload.password) formData.append("password", payload.password);
  if (payload.password_confirmation) formData.append("password_confirmation", payload.password_confirmation);

  const response = await apiClient.post<ProfileResponse>("/api/company/profile", formData);
  return response.data.data;
}
