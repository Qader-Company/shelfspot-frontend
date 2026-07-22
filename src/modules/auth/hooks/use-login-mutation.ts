"use client";

import { useMutation } from "@tanstack/react-query";

import {
  loginService,
  type AuthContext,
} from "@/modules/auth/services/login-service";
import { useAuthStore } from "@/shared/stores/auth-store";

export function useLoginMutation(authContext: AuthContext = "company") {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload) => loginService(payload, authContext),
    onSuccess: () => {
      setSession({
        isAuthenticated: true,
        user: null,
      });
    },
  });
}
