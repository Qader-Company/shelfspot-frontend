import "server-only";

import axios from "axios";
import { Agent as HttpsAgent } from "node:https";
import { cookies, headers } from "next/headers";

import { API_CONFIG } from "@/config/api";
import { serverEnv } from "@/config/env";

export async function createServerApiClient(apiKey?: string) {
  const [cookieStore, requestHeaders] = await Promise.all([
    cookies(),
    headers(),
  ]);

  const allowInsecureTls =
    process.env.NODE_ENV !== "production" &&
    serverEnv.ALLOW_INSECURE_API_TLS === "true";

  return axios.create({
    baseURL: API_CONFIG.serverBaseUrl || undefined,
    timeout: API_CONFIG.timeoutMs,
    httpsAgent: allowInsecureTls
      ? new HttpsAgent({ rejectUnauthorized: false })
      : undefined,
    headers: {
      Accept: "application/json",
      "X-Authorization": apiKey || API_CONFIG.serverApiKey,
      Cookie: cookieStore.toString(),
      "Accept-Language": requestHeaders.get("accept-language") ?? undefined,
    },
  });
}
