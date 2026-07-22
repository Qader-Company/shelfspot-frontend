"use client";

import { useMutation } from "@tanstack/react-query";

import { createSubBrandService } from "@/modules/company/catalog/sub-brands/create-service";

export function useCreateSubBrandMutation() {
  return useMutation({ mutationFn: createSubBrandService });
}
