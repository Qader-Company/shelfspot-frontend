import { adminApiClient, apiClient } from "@/shared/lib/api/client";

export interface PlatformSettings {
  email: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
}

export interface PlatformSettingsResponse {
  success: boolean;
  message?: string;
  data: PlatformSettings;
}

export type UpdatePlatformSettingsPayload = {
  email: string;
  phone: string;
  address: string;
  description: string;
};

export async function getPlatformSettings(): Promise<PlatformSettings> {
  const { data } = await adminApiClient.get<PlatformSettingsResponse>(
    "/api/admin/platform-settings",
  );
  return data.data;
}

export async function updatePlatformSettings(
  payload: UpdatePlatformSettingsPayload,
): Promise<PlatformSettingsResponse> {
  const { data } = await adminApiClient.put<PlatformSettingsResponse>(
    "/api/admin/platform-settings",
    payload,
  );
  return data;
}

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
