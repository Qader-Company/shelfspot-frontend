import { apiClient, adminApiClient } from "@/shared/lib/api/client";
import { getAuthContextConfig, type AuthContext } from "@/modules/auth/config/auth-context";

export async function verifyPasswordResetOtp(context: AuthContext, payload: { email: string; code: string }) {
  const client = context === "admin" ? adminApiClient : apiClient;
  const response = await client.post<unknown>(getAuthContextConfig(context).verifyResetOtpEndpoint, { email: payload.email, otp: payload.code });
  return response.data;
}

export function readPasswordResetToken(response: unknown) {
  if (!response || typeof response !== "object") return null;
  const root = response as { token?: unknown; data?: unknown };
  if (typeof root.token === "string") return root.token;
  if (typeof root.data === "string") return root.data;
  if (root.data && typeof root.data === "object") {
    const data = root.data as { token?: unknown; access_token?: unknown };
    if (typeof data.token === "string") return data.token;
    if (typeof data.access_token === "string") return data.access_token;
  }
  return null;
}

export async function resetPassword(context: AuthContext, payload: { password: string; confirmPassword: string; token: string }) {
  const client = context === "admin" ? adminApiClient : apiClient;
  await client.post(getAuthContextConfig(context).resetPasswordEndpoint, { password: payload.password, password_confirmation: payload.confirmPassword }, { headers: { Authorization: `Bearer ${payload.token}` } });
}
