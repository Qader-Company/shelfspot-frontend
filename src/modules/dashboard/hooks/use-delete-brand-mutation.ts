"use client";

import { useMutation } from "@tanstack/react-query";

import { deleteBrandService } from "@/modules/dashboard/services/delete-brand-service";

export function useDeleteBrandMutation() {
  return useMutation({ mutationFn: deleteBrandService });
}
