"use client";

import { useMutation } from "@tanstack/react-query";
import { updateCatalogStatusService } from "@/modules/dashboard/services/update-catalog-status-service";

export function useUpdateCatalogStatusMutation() {
  return useMutation({ mutationFn: updateCatalogStatusService });
}
