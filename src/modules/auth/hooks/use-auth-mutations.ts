"use client";

import { useMutation } from "@tanstack/react-query";

import type { AuthContext } from "@/modules/auth/config/auth-context";
import { getAuthContextConfig } from "@/modules/auth/config/auth-context";
import {
  registerService,
  resendVerificationOtpService,
  verifyEmailService,
} from "@/modules/auth/services/company-onboarding-api";
import { forgotPasswordService } from "@/modules/auth/services/password-reset-api";
import type { ForgotPasswordPayload } from "@/modules/auth/services/password-reset-api";
import { loginService } from "@/modules/auth/services/session-api";
import type { LoginPayload } from "@/modules/auth/services/session-api";
import { clearStoredVerificationToken } from "@/shared/lib/auth/verification-storage";

export function useLoginMutation(context: AuthContext = "company") {
  return useMutation({
    mutationFn: (payload: LoginPayload) => loginService(payload, context),
  });
}

export function useLogoutMutation(authContext: AuthContext) {
  return useMutation({
    mutationFn: async () => {
      await fetch(getAuthContextConfig(authContext).logoutEndpoint, {
        method: "POST",
        credentials: "include",
      });
    },
  });
}

export function useForgotPasswordMutation(context: AuthContext = "company") {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) =>
      forgotPasswordService(payload, context),
  });
}

export function useRegisterMutation() {
  return useMutation({
    mutationFn: registerService,
  });
}

export function useResendVerificationOtpMutation() {
  return useMutation({
    mutationFn: resendVerificationOtpService,
  });
}

export function useVerifyEmailMutation() {
  return useMutation({
    mutationFn: verifyEmailService,
    onSuccess: () => {
      clearStoredVerificationToken();
    },
  });
}
