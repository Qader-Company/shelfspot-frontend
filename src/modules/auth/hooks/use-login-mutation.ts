"use client";

import { useMutation } from "@tanstack/react-query";

import { loginService } from "@/modules/auth/services/login-service";
import type { LoginPayload } from "@/modules/auth/services/login-service";
import { useAuthStore } from "@/shared/stores/auth-store";
import type { AuthContext } from "@/modules/auth/config/auth-context";

export function useLoginMutation(context: AuthContext = "company") {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: (payload: LoginPayload) => loginService(payload, context),
    onSuccess: () => {
      setSession({
        isAuthenticated: true,
        user: null,
        context,
      });
    },
  });
}
