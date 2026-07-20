"use client";

import { useMutation } from "@tanstack/react-query";

import { createSubBrandService } from "@/modules/company/dashboard/services/create-sub-brand-service";

export function useCreateSubBrandMutation() {
  return useMutation({ mutationFn: createSubBrandService });
}
