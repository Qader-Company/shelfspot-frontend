"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createSubCategoryService, deleteSubCategoryService, getSubCategoriesService, updateSubCategoryService } from "@/modules/company/dashboard/services/sub-category-services";
import type { GetSubCategoriesParams } from "@/modules/company/dashboard/types/sub-category";
import { QUERY_KEYS } from "@/shared/lib/query/keys";
export function useSubCategoriesQuery(params: GetSubCategoriesParams) { return useQuery({ queryKey: QUERY_KEYS.subCategories(params as Record<string, unknown>), queryFn: () => getSubCategoriesService(params), placeholderData: (previous) => previous }); }
export function useCreateSubCategoryMutation() { return useMutation({ mutationFn: createSubCategoryService }); }
export function useUpdateSubCategoryMutation() { return useMutation({ mutationFn: updateSubCategoryService }); }
export function useDeleteSubCategoryMutation() { return useMutation({ mutationFn: deleteSubCategoryService }); }
