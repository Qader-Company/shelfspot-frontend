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
