"use client";

import { useMutation } from "@tanstack/react-query";

import { updateBrandService } from "@/modules/company/dashboard/services/update-brand-service";

export function useUpdateBrandMutation() {
  return useMutation({ mutationFn: updateBrandService });
}
