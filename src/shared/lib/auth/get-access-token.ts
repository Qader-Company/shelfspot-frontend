"use client";

let cachedToken: string | null = null;
let tokenPromise: Promise<string | null> | null = null;

/**
 * Gets the access token from the server
 * The token is stored in HttpOnly cookies, so we need to fetch it from an API endpoint
 */
export async function getAccessToken(): Promise<string | null> {
  // Return cached token if available
  if (cachedToken) {
    return cachedToken;
  }

  // If a fetch is already in progress, wait for it
  if (tokenPromise) {
    return tokenPromise;
  }

  // Fetch the token from the server
  tokenPromise = (async () => {
    try {
      const response = await fetch("/api/auth/token", {
        credentials: "include",
      });

      if (!response.ok) {
        console.warn("Failed to fetch access token:", response.status);
        return null;
      }

      const data = await response.json();
      cachedToken = data.access_token || null;
      return cachedToken;
    } catch (error) {
      console.error("Error fetching access token:", error);
      return null;
    } finally {
      tokenPromise = null;
    }
  })();

  return tokenPromise;
}

/**
 * Clears the cached access token
 * Call this after logout or when the token expires
 */
export function clearAccessToken() {
  cachedToken = null;
  tokenPromise = null;
}
