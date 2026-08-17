import { z } from "zod";

const publicEnvSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().default(""),
  NEXT_PUBLIC_API_KEY: z.string().default(""),
  NEXT_PUBLIC_SITE_URL: z.union([z.string().url(), z.literal("")]).default(""),
});

const serverEnvSchema = publicEnvSchema.extend({
  API_BASE_URL: z.string().optional(),
  API_KEY: z.string().optional(),
  ADMIN_API_KEY: z.string().optional(),
  COMPANY_API_KEY: z.string().optional(),
  ALLOW_INSECURE_API_TLS: z.enum(["true", "false"]).default("false"),
});

export const publicEnv = publicEnvSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
});

export const serverEnv = serverEnvSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_API_KEY: process.env.NEXT_PUBLIC_API_KEY,
  NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
  API_BASE_URL: process.env.API_BASE_URL,
  API_KEY: process.env.API_KEY,
  ADMIN_API_KEY: process.env.ADMIN_API_KEY,
  COMPANY_API_KEY: process.env.COMPANY_API_KEY,
  ALLOW_INSECURE_API_TLS: process.env.ALLOW_INSECURE_API_TLS,
});
