import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { API_CONFIG } from "@/config/api";
import { ACCESS_TOKEN_COOKIE, AUTH_CONTEXT_COOKIE } from "@/shared/lib/auth/session-cookies";

/**
 * Proxies broadcasting/auth requests to Laravel backend
 * This is needed for Laravel Echo private channel authorization
 */
export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token = cookieStore.get(ACCESS_TOKEN_COOKIE)?.value;
  const authContext = cookieStore.get(AUTH_CONTEXT_COOKIE)?.value || "company";

  if (!token) {
    return NextResponse.json(
      { error: "Not authenticated" },
      { status: 401 }
    );
  }

  // Get the API key based on auth context
  const apiKey = authContext === "admin" 
    ? API_CONFIG.adminApiKey 
    : API_CONFIG.companyApiKey;

  try {
    // Get request body
    const body = await request.text();

    // Forward to Laravel backend
    const response = await fetch(
      `${API_CONFIG.serverBaseUrl.replace("/api/v1", "")}/broadcasting/auth`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
          "X-Authorization": apiKey,
        },
        body,
      }
    );

    const data = await response.json();

    if (!response.ok) {
      console.error("Broadcasting auth failed:", data);
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Broadcasting auth error:", error);
    return NextResponse.json(
      { error: "Failed to authorize channel" },
      { status: 500 }
    );
  }
}
