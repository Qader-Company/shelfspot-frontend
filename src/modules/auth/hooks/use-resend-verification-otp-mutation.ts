"use client";

import { useMutation } from "@tanstack/react-query";

import { resendVerificationOtpService } from "@/modules/auth/services/resend-verification-otp-service";

export function useResendVerificationOtpMutation() {
  return useMutation({
    mutationFn: resendVerificationOtpService,
  });
}
