"use client";

import { useMutation } from "@tanstack/react-query";

import { createBrandService } from "@/modules/company/dashboard/services/create-brand-service";

export function useCreateBrandMutation() {
  return useMutation({ mutationFn: createBrandService });
}
