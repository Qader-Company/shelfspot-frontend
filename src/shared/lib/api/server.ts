import "server-only";

import axios from "axios";
import { cookies, headers } from "next/headers";

import { API_CONFIG } from "@/config/api";

export async function createServerApiClient() {
  const [cookieStore, requestHeaders] = await Promise.all([
    cookies(),
    headers(),
  ]);

  return axios.create({
    baseURL: API_CONFIG.serverBaseUrl || undefined,
    timeout: API_CONFIG.timeoutMs,
    headers: {
      Accept: "application/json",
      "X-Authorization": API_CONFIG.serverApiKey,
      Cookie: cookieStore.toString(),
      "Accept-Language": requestHeaders.get("accept-language") ?? undefined,
    },
  });
}
