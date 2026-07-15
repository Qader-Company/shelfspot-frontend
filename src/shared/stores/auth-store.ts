import { create } from "zustand";

import type { AuthTokens } from "@/shared/lib/auth/types";
import {
  clearStoredAuthTokens,
  getStoredAuthTokens,
  setStoredAuthTokens,
} from "@/shared/lib/auth/token-storage";

interface AuthState {
  isAuthenticated: boolean;
  tokens: AuthTokens | null;
  user: unknown | null;
  hydrateSession: () => void;
  setSession: (session: {
    isAuthenticated: boolean;
    persistent?: boolean;
    tokens: AuthTokens | null;
    user: unknown | null;
  }) => void;
  updateTokens: (tokens: AuthTokens) => void;
  clearSession: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: false,
  tokens: null,
  user: null,
  hydrateSession: () => {
    const tokens = getStoredAuthTokens();

    set({
      isAuthenticated: !!tokens,
      tokens,
      user: null,
    });
  },
  setSession: ({ persistent = true, ...session }) => {
    if (session.tokens) {
      setStoredAuthTokens(session.tokens, { persistent });
    } else {
      clearStoredAuthTokens();
    }

    set(session);
  },
  updateTokens: (tokens) => {
    setStoredAuthTokens(tokens);

    set((state) => ({
      ...state,
      isAuthenticated: true,
      tokens,
    }));
  },
  clearSession: () => {
    clearStoredAuthTokens();

    set({ isAuthenticated: false, tokens: null, user: null });
  },
}));
