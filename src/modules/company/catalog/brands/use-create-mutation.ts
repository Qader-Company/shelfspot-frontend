"use client";

import { useMutation } from "@tanstack/react-query";

import { createBrandService } from "@/modules/company/catalog/brands/create-service";

export function useCreateBrandMutation() {
  return useMutation({ mutationFn: createBrandService });
}
