import type { AuthTokens } from "@/shared/lib/auth/types";

const ACCESS_TOKEN_KEY = "shelfspot-auth-access-token";
const REFRESH_TOKEN_KEY = "shelfspot-auth-refresh-token";
const TOKEN_TYPE_KEY = "shelfspot-auth-token-type";
const STORAGE_SCOPE_KEY = "shelfspot-auth-storage-scope";

type StorageScope = "local" | "session";

function isBrowser() {
  return typeof window !== "undefined";
}

function getStorage(scope: StorageScope) {
  if (!isBrowser()) {
    return null;
  }

  return scope === "local" ? window.localStorage : window.sessionStorage;
}

function readScope(): StorageScope {
  if (!isBrowser()) {
    return "local";
  }

  if (window.localStorage.getItem(STORAGE_SCOPE_KEY) === "local") {
    return "local";
  }

  if (window.sessionStorage.getItem(STORAGE_SCOPE_KEY) === "session") {
    return "session";
  }

  return "local";
}

export function getStoredAuthTokens(): AuthTokens | null {
  if (!isBrowser()) {
    return null;
  }

  const scope = readScope();
  const storage = getStorage(scope);

  if (!storage) {
    return null;
  }

  const accessToken = storage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = storage.getItem(REFRESH_TOKEN_KEY);
  const tokenType = storage.getItem(TOKEN_TYPE_KEY);

  if (!accessToken || !refreshToken || !tokenType) {
    return null;
  }

  return {
    accessToken,
    refreshToken,
    tokenType,
  };
}

export function getStoredAccessToken() {
  return getStoredAuthTokens()?.accessToken ?? null;
}

export function getStoredRefreshToken() {
  return getStoredAuthTokens()?.refreshToken ?? null;
}

export function setStoredAuthTokens(
  tokens: AuthTokens,
  options?: { persistent?: boolean },
) {
  if (!isBrowser()) {
    return;
  }

  const scope: StorageScope = options?.persistent === false ? "session" : "local";
  const activeStorage = getStorage(scope);
  const inactiveStorage = getStorage(scope === "local" ? "session" : "local");

  inactiveStorage?.removeItem(ACCESS_TOKEN_KEY);
  inactiveStorage?.removeItem(REFRESH_TOKEN_KEY);
  inactiveStorage?.removeItem(TOKEN_TYPE_KEY);
  inactiveStorage?.removeItem(STORAGE_SCOPE_KEY);

  activeStorage?.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  activeStorage?.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
  activeStorage?.setItem(TOKEN_TYPE_KEY, tokens.tokenType);
  activeStorage?.setItem(STORAGE_SCOPE_KEY, scope);
}

export function replaceStoredAuthTokens(tokens: AuthTokens) {
  const currentScope = readScope();

  setStoredAuthTokens(tokens, {
    persistent: currentScope === "local",
  });
}

export function clearStoredAuthTokens() {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
  window.localStorage.removeItem(TOKEN_TYPE_KEY);
  window.localStorage.removeItem(STORAGE_SCOPE_KEY);
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(REFRESH_TOKEN_KEY);
  window.sessionStorage.removeItem(TOKEN_TYPE_KEY);
  window.sessionStorage.removeItem(STORAGE_SCOPE_KEY);
}
