import { apiClient } from "@/shared/lib/api/client";

export interface RegisterPayload {
  companyName: string;
  crNumber: string;
  email: string;
  phoneNumber: string;
  password: string;
  industry: string;
}

export interface RegisterResponse {
  message: string;
}

interface CompanyRegisterResponse {
  message: string;
}

const REGISTER_ENDPOINT = "/auth/company/register";

export async function registerService(payload: RegisterPayload) {
  const response = await apiClient.post<CompanyRegisterResponse>(
    REGISTER_ENDPOINT,
    {
      company_name: payload.companyName,
      cr_number: payload.crNumber,
      email: payload.email,
      phone_number: payload.phoneNumber,
      password: payload.password,
      industry: payload.industry,
    },
  );

  return {
    message: response.data.message,
  } satisfies RegisterResponse;
}
