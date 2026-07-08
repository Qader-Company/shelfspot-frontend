"use client";

import { useMutation } from "@tanstack/react-query";

import { registerService } from "@/modules/auth/services/register-service";

export function useRegisterMutation() {
  return useMutation({
    mutationFn: registerService,
  });
}
