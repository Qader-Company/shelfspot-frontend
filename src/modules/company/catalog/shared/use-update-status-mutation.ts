"use client";

import { useMutation } from "@tanstack/react-query";
import { updateCatalogStatusService } from "@/modules/company/catalog/shared/update-status-service";

export function useUpdateCatalogStatusMutation() {
  return useMutation({ mutationFn: updateCatalogStatusService });
}
