import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  user: unknown | null;
  hydrateSession: () => void;
  setSession: (session: {
    isAuthenticated: boolean;
    user: unknown | null;
  }) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  hydrateSession: () => {
    void fetch("/api/auth/session", { credentials: "include" })
      .then((response) => response.json() as Promise<{ authenticated: boolean }>)
      .then(({ authenticated }) => set({ isAuthenticated: authenticated }))
      .catch(() => set({ isAuthenticated: false }));
  },
  setSession: (session) => set(session),
  clearSession: () => {
    void fetch("/api/auth/company/logout", {
      method: "POST",
      credentials: "include",
    });
    set({ isAuthenticated: false, user: null });
  },
}));
