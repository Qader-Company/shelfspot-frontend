"use client";
import { useMutation } from "@tanstack/react-query";
import { updateSubBrandService } from "@/modules/company/catalog/sub-brands/update-service";
export function useUpdateSubBrandMutation() { return useMutation({ mutationFn: updateSubBrandService }); }
