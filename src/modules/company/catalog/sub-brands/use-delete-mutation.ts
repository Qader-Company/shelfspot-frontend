"use client";
import { useMutation } from "@tanstack/react-query";
import { deleteSubBrandService } from "@/modules/company/catalog/sub-brands/delete-service";
export function useDeleteSubBrandMutation() { return useMutation({ mutationFn: deleteSubBrandService }); }
