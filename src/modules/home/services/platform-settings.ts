import "server-only";

import { cookies } from "next/headers";
import { cache } from "react";
import { getLocale } from "next-intl/server";
import { API_CONFIG } from "@/config/api";

import { createServerApiClient } from "@/shared/lib/api/server";
import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/session-cookies";

export interface PublicPlatformSettings {
  email: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
}

export const getPublicPlatformSettings = cache(async (): Promise<PublicPlatformSettings | null> => {
  try {
    const [client, cookieStore, locale] = await Promise.all([
      createServerApiClient(),
      cookies(),
      getLocale(),
    ]);
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

    const { data } = await client.get<{
      data?: Omit<PublicPlatformSettings, "description"> & { description_ar?: string | null; description_en?: string | null };
    }>(API_CONFIG.platformSettingsReadUrl, {
      signal: AbortSignal.timeout(2_000),
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });
    return data.data ? { ...data.data, description: (locale === "ar" ? data.data.description_ar : data.data.description_en) ?? null } : null;
  } catch {
    return null;
  }
});
