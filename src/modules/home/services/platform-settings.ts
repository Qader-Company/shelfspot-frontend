import "server-only";

import { cookies } from "next/headers";

import { createServerApiClient } from "@/shared/lib/api/server";
import { ACCESS_TOKEN_COOKIE } from "@/shared/lib/auth/session-cookies";

export interface PublicPlatformSettings {
  email: string | null;
  phone: string | null;
  address: string | null;
  description: string | null;
}

export async function getPublicPlatformSettings(): Promise<PublicPlatformSettings | null> {
  try {
    const [client, cookieStore] = await Promise.all([
      createServerApiClient(),
      cookies(),
    ]);
    const accessToken = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;

    const { data } = await client.get<{
      data?: PublicPlatformSettings;
    }>("/admin/platform-settings/", {
      headers: accessToken
        ? { Authorization: `Bearer ${accessToken}` }
        : undefined,
    });
    return data.data ?? null;
  } catch {
    return null;
  }
}
