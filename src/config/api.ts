import { publicEnv, serverEnv } from "@/config/env";

export const API_CONFIG = {
  browserBaseUrl: publicEnv.NEXT_PUBLIC_API_BASE_URL,
  serverBaseUrl:
    serverEnv.API_BASE_URL ?? serverEnv.NEXT_PUBLIC_API_BASE_URL,
  browserApiKey: publicEnv.NEXT_PUBLIC_API_KEY,
  serverApiKey: serverEnv.API_KEY ?? serverEnv.NEXT_PUBLIC_API_KEY,
  adminApiKey: serverEnv.ADMIN_API_KEY ?? serverEnv.API_KEY ?? serverEnv.NEXT_PUBLIC_API_KEY,
  companyApiKey: serverEnv.COMPANY_API_KEY ?? serverEnv.API_KEY ?? serverEnv.NEXT_PUBLIC_API_KEY,
  timeoutMs: 15_000,
} as const;
