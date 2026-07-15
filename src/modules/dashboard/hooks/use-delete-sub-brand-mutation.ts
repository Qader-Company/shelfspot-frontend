"use client";
import { useMutation } from "@tanstack/react-query";
import { deleteSubBrandService } from "@/modules/dashboard/services/delete-sub-brand-service";
export function useDeleteSubBrandMutation() { return useMutation({ mutationFn: deleteSubBrandService }); }
