import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  user: unknown | null;
  setSession: (session: { isAuthenticated: boolean; user: unknown | null }) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  user: null,
  setSession: (session) => set(session),
  clearSession: () => set({ isAuthenticated: false, user: null }),
}));
