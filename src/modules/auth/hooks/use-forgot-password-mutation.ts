"use client";

import { useMutation } from "@tanstack/react-query";

import { forgotPasswordService } from "@/modules/auth/services/forgot-password-service";

export function useForgotPasswordMutation() {
  return useMutation({
    mutationFn: forgotPasswordService,
  });
}
