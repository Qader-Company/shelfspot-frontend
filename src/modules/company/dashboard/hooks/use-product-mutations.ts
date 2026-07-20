"use client";
import { useMutation } from "@tanstack/react-query";
import { createProductService, deleteProductService, updateProductService } from "@/modules/company/dashboard/services/product-services";
export function useCreateProductMutation() { return useMutation({ mutationFn: createProductService }); }
export function useUpdateProductMutation() { return useMutation({ mutationFn: updateProductService }); }
export function useDeleteProductMutation() { return useMutation({ mutationFn: deleteProductService }); }
