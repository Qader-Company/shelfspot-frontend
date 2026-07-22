"use client";

import { useMutation, useQuery } from "@tanstack/react-query";

import {
  deleteCompany,
  getCompanies,
  getCompany,
  deleteAdminCatalogItem,
  downloadAdminCatalogTemplate,
  getAdminCatalog,
  importAdminCatalog,
  saveAdminCatalogItem,
  updateAdminCatalogStatus,
  updateCompanyStatus,
} from "./service";
import type {
  AdminCatalogParams,
  AdminCatalogResource,
  CompaniesParams,
} from "./types";

export const companiesQueryKey = (params?: CompaniesParams) =>
  ["admin", "companies", params] as const;

export function useCompanies(params: CompaniesParams) {
  return useQuery({
    queryKey: companiesQueryKey(params),
    queryFn: () => getCompanies(params),
    placeholderData: (previous) => previous,
  });
}

export function useCompany(id: string) {
  return useQuery({
    queryKey: ["admin", "companies", id],
    queryFn: () => getCompany(id),
  });
}

export function useUpdateCompanyStatus() {
  return useMutation({ mutationFn: updateCompanyStatus });
}

export function useDeleteCompany() {
  return useMutation({ mutationFn: deleteCompany });
}

export const adminCatalogQueryKey = (
  companyId: string,
  resource: AdminCatalogResource,
  params: AdminCatalogParams,
) => ["admin", "companies", companyId, "catalog", resource, params] as const;

export function useAdminCatalog(
  companyId: string,
  resource: AdminCatalogResource,
  params: AdminCatalogParams,
  enabled = true,
) {
  return useQuery({
    queryKey: adminCatalogQueryKey(companyId, resource, params),
    queryFn: () => getAdminCatalog(companyId, resource, params),
    placeholderData: (previous) => previous,
    enabled,
  });
}

export function useSaveAdminCatalogItem() {
  return useMutation({ mutationFn: saveAdminCatalogItem });
}

export function useDeleteAdminCatalogItem() {
  return useMutation({ mutationFn: deleteAdminCatalogItem });
}

export function useUpdateAdminCatalogStatus() {
  return useMutation({ mutationFn: updateAdminCatalogStatus });
}

export function useImportAdminCatalog() {
  return useMutation({ mutationFn: importAdminCatalog });
}

export function useDownloadAdminCatalogTemplate() {
  return useMutation({ mutationFn: downloadAdminCatalogTemplate });
}
