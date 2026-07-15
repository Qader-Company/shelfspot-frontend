"use client";
import { useMutation, useQuery } from "@tanstack/react-query";
import { createCategoryService, deleteCategoryService, getCategoriesService, updateCategoryService } from "@/modules/dashboard/services/category-services";
import type { GetCategoriesParams } from "@/modules/dashboard/types/category";
import { QUERY_KEYS } from "@/shared/lib/query/keys";
export function useCategoriesQuery(params: GetCategoriesParams) { return useQuery({ queryKey: QUERY_KEYS.categories(params as Record<string, unknown>), queryFn: () => getCategoriesService(params), placeholderData: (previous) => previous }); }
export function useCreateCategoryMutation() { return useMutation({ mutationFn: createCategoryService }); }
export function useUpdateCategoryMutation() { return useMutation({ mutationFn: updateCategoryService }); }
export function useDeleteCategoryMutation() { return useMutation({ mutationFn: deleteCategoryService }); }
