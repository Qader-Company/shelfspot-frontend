import type { AuthContext } from "@/modules/auth/config/auth-context";

const keyFor = (context: AuthContext) => `shelfspot-${context}-password-reset`;

interface PasswordResetState { email: string; token?: string; }

export function getPasswordResetState(context: AuthContext): PasswordResetState | null {
  if (typeof window === "undefined") return null;
  const value = window.sessionStorage.getItem(keyFor(context));
  if (!value) return null;
  try { return JSON.parse(value) as PasswordResetState; } catch { return null; }
}

export function setPasswordResetState(context: AuthContext, state: PasswordResetState) {
  if (typeof window === "undefined") return;
  window.sessionStorage.setItem(keyFor(context), JSON.stringify(state));
}

export function clearPasswordResetState(context: AuthContext) {
  if (typeof window === "undefined") return;
  window.sessionStorage.removeItem(keyFor(context));
}
