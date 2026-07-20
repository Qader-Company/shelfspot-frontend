"use client";

import { useMutation } from "@tanstack/react-query";
import { updateCatalogStatusService } from "@/modules/company/dashboard/services/update-catalog-status-service";

export function useUpdateCatalogStatusMutation() {
  return useMutation({ mutationFn: updateCatalogStatusService });
}
