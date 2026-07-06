import { publicEnv, serverEnv } from "@/config/env";

export const API_CONFIG = {
  browserBaseUrl: publicEnv.NEXT_PUBLIC_API_BASE_URL,
  serverBaseUrl:
    serverEnv.API_BASE_URL ?? serverEnv.NEXT_PUBLIC_API_BASE_URL,
  timeoutMs: 15_000,
} as const;
