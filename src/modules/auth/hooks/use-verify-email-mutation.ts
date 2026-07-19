"use client";

import { useMutation } from "@tanstack/react-query";

import { verifyEmailService } from "@/modules/auth/services/verify-email-service";
import { clearStoredVerificationToken } from "@/shared/lib/auth/verification-storage";
import { useAuthStore } from "@/shared/stores/auth-store";

export function useVerifyEmailMutation() {
  const setSession = useAuthStore((state) => state.setSession);

  return useMutation({
    mutationFn: verifyEmailService,
    onSuccess: (data) => {
      clearStoredVerificationToken();
      setSession({
        isAuthenticated: true,
        user: data.user,
        context: "company",
      });
    },
  });
}
