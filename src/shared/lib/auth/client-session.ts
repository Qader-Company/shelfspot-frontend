"use client";

/**
 * Fetches the access token from the server
 * Since the token is stored in an httpOnly cookie, we need to make an API call
 */
export async function fetchAccessToken(): Promise<string | null> {
  try {
    const response = await fetch("/api/auth/websocket-token");
    if (!response.ok) {
      return null;
    }
    const data = await response.json();
    return data.data?.access_token ?? null;
  } catch (error) {
    console.error("Failed to fetch access token:", error);
    return null;
  }
}

/**
 * Gets the auth context (portal) from cookies
 */
export function getAuthContextFromCookie(): "admin" | "company" | null {
  if (typeof document === "undefined") {
    return null;
  }

  const cookies = document.cookie.split(";");
  const prefix = process.env.NODE_ENV === "production" ? "__Host-" : "";
  const cookieName = `${prefix}shelfspot-auth-context`;

  for (const cookie of cookies) {
    const [name, value] = cookie.trim().split("=");
    if (name === cookieName) {
      return value as "admin" | "company";
    }
  }

  return null;
}
