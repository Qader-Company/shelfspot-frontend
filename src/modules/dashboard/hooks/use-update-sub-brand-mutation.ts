"use client";
import { useMutation } from "@tanstack/react-query";
import { updateSubBrandService } from "@/modules/dashboard/services/update-sub-brand-service";
export function useUpdateSubBrandMutation() { return useMutation({ mutationFn: updateSubBrandService }); }
