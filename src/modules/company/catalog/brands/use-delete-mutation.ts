"use client";

import { useMutation } from "@tanstack/react-query";

import { deleteBrandService } from "@/modules/company/catalog/brands/delete-service";

export function useDeleteBrandMutation() {
  return useMutation({ mutationFn: deleteBrandService });
}
