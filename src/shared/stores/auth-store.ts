import { create } from "zustand";
import { getAuthContextConfig, type AuthContext } from "@/modules/auth/config/auth-context";

interface AuthState {
  isAuthenticated: boolean;
  user: unknown | null;
  context: AuthContext | null;
  hydrateSession: () => void;
  setSession: (session: {
    isAuthenticated: boolean;
    user: unknown | null;
    context: AuthContext;
  }) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  context: null,
  hydrateSession: () => {
    void fetch("/api/auth/session", { credentials: "include" })
      .then((response) => response.json() as Promise<{ authenticated: boolean; context: AuthContext | null }>)
      .then(({ authenticated, context }) => set({ isAuthenticated: authenticated, context }))
      .catch(() => set({ isAuthenticated: false }));
  },
  setSession: (session) => set(session),
  clearSession: () => {
    const context = useAuthStore.getState().context ?? "company";
    void fetch(getAuthContextConfig(context).logoutEndpoint, {
      method: "POST",
      credentials: "include",
    });
    set({ isAuthenticated: false, user: null, context: null });
  },
}));
