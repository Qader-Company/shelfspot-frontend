"use client";

import { useMutation } from "@tanstack/react-query";

import { forgotPasswordService } from "@/modules/auth/services/forgot-password-service";
import type { ForgotPasswordPayload } from "@/modules/auth/services/forgot-password-service";
import type { AuthContext } from "@/modules/auth/config/auth-context";

export function useForgotPasswordMutation(context: AuthContext = "company") {
  return useMutation({
    mutationFn: (payload: ForgotPasswordPayload) => forgotPasswordService(payload, context),
  });
}
