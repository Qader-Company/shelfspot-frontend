import { apiClient } from "@/shared/lib/api/client";

export interface AdminProfile {
  name: string;
  email: string;
}

export interface AdminProfileResponse {
  success: boolean;
  message?: string;
  data: AdminProfile;
}

export interface UpdateProfilePayload {
  name: string;
  email: string;
  current_password?: string;
  password?: string;
  password_confirmation?: string;
}

export async function getAdminProfile(): Promise<AdminProfile> {
  const { data } = await apiClient.get<AdminProfileResponse>("/api/admin/profile");
  return data.data;
}

export async function updateAdminProfile(
  payload: UpdateProfilePayload,
): Promise<AdminProfileResponse> {
  const { data } = await apiClient.put<AdminProfileResponse>(
    "/api/admin/profile",
    payload,
  );
  return data;
}
