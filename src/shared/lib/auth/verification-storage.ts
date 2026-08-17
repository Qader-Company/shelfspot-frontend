const VERIFICATION_TOKEN_KEY = "shelfspot-auth-verification-token";

function isBrowser() {
  return typeof window !== "undefined";
}

export function getStoredVerificationToken() {
  if (!isBrowser()) {
    return null;
  }

  return window.sessionStorage.getItem(VERIFICATION_TOKEN_KEY);
}

export function setStoredVerificationToken(token: string) {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.setItem(VERIFICATION_TOKEN_KEY, token);
}

export function clearStoredVerificationToken() {
  if (!isBrowser()) {
    return;
  }

  window.sessionStorage.removeItem(VERIFICATION_TOKEN_KEY);
}
