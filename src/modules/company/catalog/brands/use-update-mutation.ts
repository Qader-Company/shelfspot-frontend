"use client";

import { useMutation } from "@tanstack/react-query";

import { updateBrandService } from "@/modules/company/catalog/brands/update-service";

export function useUpdateBrandMutation() {
  return useMutation({ mutationFn: updateBrandService });
}
