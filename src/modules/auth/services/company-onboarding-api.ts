import { apiClient } from "@/shared/lib/api/client";

export interface RegisterPayload {
  companyName: string;
  crNumber: string;
  email: string;
  phoneNumber: string;
  password: string;
  passwordConfirmation: string;
  industry: string;
}

export interface RegisterResponse {
  message: string;
  verificationToken: string | null;
}

interface CompanyRegisterResponse {
  message: string;
  data?: {
    verification_token?: {
      token: string;
      ttl: number;
    };
  };
}

export interface ResendVerificationOtpPayload {
  token: string;
}

export interface ResendVerificationOtpResponse {
  message: string;
}

interface ResendVerificationOtpApiResponse {
  message: string;
}

export interface VerifyEmailPayload {
  otp: string;
  token: string;
}

export interface VerifyEmailResponse {
  message: string;
  user: unknown | null;
}

interface VerifyEmailApiResponse {
  message: string;
  data: {
    user: unknown | null;
  };
}

const REGISTER_ENDPOINT = "/api/auth/company/register";
const RESEND_VERIFICATION_OTP_ENDPOINT =
  "/api/auth/company/email-verification/send-otp";
const VERIFY_EMAIL_ENDPOINT = "/api/auth/company/email-verification";

export async function registerService(payload: RegisterPayload) {
  const response = await apiClient.post<CompanyRegisterResponse>(
    REGISTER_ENDPOINT,
    {
      name: payload.companyName,
      cr_number: payload.crNumber,
      email: payload.email,
      phone: payload.phoneNumber,
      password: payload.password,
      password_confirmation: payload.passwordConfirmation,
      industry: payload.industry,
    },
  );

  return {
    message: response.data.message,
    verificationToken:
      response.data.data?.verification_token?.token ?? null,
  } satisfies RegisterResponse;
}

export async function resendVerificationOtpService(
  payload: ResendVerificationOtpPayload,
) {
  const response = await apiClient.post<ResendVerificationOtpApiResponse>(
    RESEND_VERIFICATION_OTP_ENDPOINT,
    undefined,
    {
      headers: {
        Authorization: `Bearer ${payload.token}`,
      },
    },
  );

  return {
    message: response.data.message,
  } satisfies ResendVerificationOtpResponse;
}

export async function verifyEmailService(payload: VerifyEmailPayload) {
  const body = new URLSearchParams({
    otp: payload.otp,
  });

  const response = await apiClient.patch<VerifyEmailApiResponse>(
    VERIFY_EMAIL_ENDPOINT,
    body,
    {
      headers: {
        Authorization: `Bearer ${payload.token}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return {
    message: response.data.message,
    user: response.data.data.user,
  } satisfies VerifyEmailResponse;
}
