"use client";

import { useMutation } from "@tanstack/react-query";

import { loginService } from "@/modules/auth/services/login-service";
import { useAuthStore } from "@/shared/stores/auth-store";

export function useLoginMutation() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: loginService,
    onSuccess: (data) => {
      setSession({
        isAuthenticated: true,
        user: data.user ?? null,
      });
    },
  });
}
