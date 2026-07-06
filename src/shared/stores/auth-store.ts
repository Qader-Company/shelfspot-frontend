import { create } from "zustand";

interface AuthState {
  isAuthenticated: boolean;
  user: unknown | null;
}

export const useAuthStore = create<AuthState>(() => ({
  isAuthenticated: false,
  user: null,
}));
