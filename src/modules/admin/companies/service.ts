import { apiClient } from "@/shared/lib/api/client";

import type {
  AdminCompany,
  CompaniesMeta,
  CompaniesParams,
  CompaniesResponse,
  CompanyResponse,
  AdminCatalogApiResource,
  AdminCatalogMutationInput,
  AdminCatalogParams,
  AdminCatalogResource,
  AdminCatalogResponse,
} from "./types";

const catalogApiResources: Record<AdminCatalogResource, AdminCatalogApiResource> = {
  brand: "brands",
  "sub-brand": "sub-brands",
  category: "categories",
  "sub-category": "sub-categories",
  product: "products",
};

function catalogPath(companyId: string, resource: AdminCatalogResource) {
  return `/api/admin/companies/${encodeURIComponent(companyId)}/${catalogApiResources[resource]}`;
}

type PaginatedCompanies = Partial<CompaniesMeta> & {
  data: AdminCompany[];
  meta?: CompaniesMeta;
};

type RawCompaniesResponse = Omit<CompaniesResponse, "data"> & {
  data: AdminCompany[] | PaginatedCompanies;
  pagination?: CompaniesMeta;
};

export async function getCompanies(params: CompaniesParams) {
  const { data: response } = await apiClient.get<RawCompaniesResponse>(
    "/api/admin/companies",
    { params },
  );

  if (Array.isArray(response.data)) return response as CompaniesResponse;

  const page = response.data;
  return {
    success: response.success,
    message: response.message,
    data: page.data,
    meta:
      page.meta ??
      response.pagination ??
      (page.current_page != null && page.last_page != null
        ? {
            current_page: page.current_page,
            last_page: page.last_page,
            per_page: page.per_page ?? 10,
            total: page.total ?? page.data.length,
          }
        : undefined),
  } satisfies CompaniesResponse;
}

export async function getCompany(id: string) {
  const { data } = await apiClient.get<CompanyResponse>(
    `/api/admin/companies/${encodeURIComponent(id)}`,
  );
  return data.data;
}

export async function updateCompanyStatus({
  id,
  isActive,
}: {
  id: string;
  isActive: boolean;
}) {
  const body = new URLSearchParams({ is_active: isActive ? "1" : "0" });
  return (
    await apiClient.put(`/api/admin/companies/${encodeURIComponent(id)}`, body, {
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
    })
  ).data as { success?: boolean; message?: string };
}

export async function deleteCompany(id: string) {
  return (
    await apiClient.delete(`/api/admin/companies/${encodeURIComponent(id)}`)
  ).data as { success?: boolean; message?: string };
}

type RawCatalogResponse = Omit<AdminCatalogResponse, "data"> & {
  data:
    | AdminCatalogResponse["data"]
    | (Partial<CompaniesMeta> & {
        data: AdminCatalogResponse["data"];
        meta?: CompaniesMeta;
      });
  pagination?: CompaniesMeta;
};

export async function getAdminCatalog(
  companyId: string,
  resource: AdminCatalogResource,
  params: AdminCatalogParams,
) {
  const { data: response } = await apiClient.get<RawCatalogResponse>(
    catalogPath(companyId, resource),
    { params },
  );
  if (Array.isArray(response.data)) return response as AdminCatalogResponse;
  const page = response.data;
  return {
    success: response.success,
    message: response.message,
    data: page.data,
    meta:
      page.meta ??
      response.pagination ??
      (page.current_page != null && page.last_page != null
        ? {
            current_page: page.current_page,
            last_page: page.last_page,
            per_page: page.per_page ?? params.per_page ?? 10,
            total: page.total ?? page.data.length,
          }
        : undefined),
  } satisfies AdminCatalogResponse;
}

function catalogForm(
  resource: AdminCatalogResource,
  payload: AdminCatalogMutationInput["payload"],
  update = false,
) {
  const data = new FormData();
  data.append("translations[en][name]", payload.nameEn);
  data.append("translations[ar][name]", payload.nameAr);
  data.append("is_active", payload.isActive ? "1" : "0");
  if (payload.descriptionEn != null) data.append("translations[en][description]", payload.descriptionEn);
  if (payload.descriptionAr != null) data.append("translations[ar][description]", payload.descriptionAr);
  if (payload.sku != null) data.append("sku", payload.sku);
  if (payload.barcode != null) data.append("barcode", payload.barcode);
  if (payload.brandId) data.append("brand_id", payload.brandId);
  if (payload.subBrandId) data.append("sub_brand_id", payload.subBrandId);
  if (payload.categoryId) data.append("category_id", payload.categoryId);
  if (payload.subCategoryId) data.append("sub_category_id", payload.subCategoryId);
  if (update) {
    data.append("_method", "put");
    data.append("logo_action", payload.logoAction ?? (payload.image ? "replace" : "keep"));
  }
  if (payload.image) {
    const field = resource === "brand" || resource === "sub-brand" ? "logo" : "image";
    data.append(field, payload.image, payload.image.name);
  }
  return data;
}

export async function saveAdminCatalogItem(input: AdminCatalogMutationInput) {
  const path = `${catalogPath(input.companyId, input.resource)}${input.id ? `/${encodeURIComponent(input.id)}` : ""}`;
  const { data } = await apiClient.post<{ success?: boolean; message?: string }>(
    path,
    catalogForm(input.resource, input.payload, Boolean(input.id)),
    { headers: { "Content-Type": "multipart/form-data" } },
  );
  return data;
}

export async function deleteAdminCatalogItem({
  companyId,
  resource,
  id,
}: {
  companyId: string;
  resource: AdminCatalogResource;
  id: string;
}) {
  return (
    await apiClient.delete(
      `${catalogPath(companyId, resource)}/${encodeURIComponent(id)}`,
    )
  ).data as { success?: boolean; message?: string };
}

export async function updateAdminCatalogStatus({
  companyId,
  resource,
  id,
  isActive,
}: {
  companyId: string;
  resource: AdminCatalogResource;
  id: string;
  isActive: boolean;
}) {
  const data = new FormData();
  data.append("is_active", isActive ? "1" : "0");
  data.append("_method", "put");
  return (
    await apiClient.post(
      `${catalogPath(companyId, resource)}/${encodeURIComponent(id)}`,
      data,
      { headers: { "Content-Type": "multipart/form-data" } },
    )
  ).data as { success?: boolean; message?: string };
}

export async function importAdminCatalog({
  companyId,
  resource,
  file,
}: {
  companyId: string;
  resource: AdminCatalogResource;
  file: File;
}) {
  const data = new FormData();
  data.append("file", file, file.name);
  return (
    await apiClient.post(`${catalogPath(companyId, resource)}/excel/import`, data, {
      headers: { "Content-Type": "multipart/form-data" },
    })
  ).data as { success?: boolean; message?: string };
}

export async function downloadAdminCatalogTemplate({
  companyId,
  resource,
}: {
  companyId: string;
  resource: AdminCatalogResource;
}) {
  const response = await apiClient.get<Blob>(
    `${catalogPath(companyId, resource)}/excel/template`,
    { responseType: "blob" },
  );
  const disposition = response.headers["content-disposition"] as string | undefined;
  const url = URL.createObjectURL(response.data);
  const link = document.createElement("a");
  link.href = url;
  link.download = disposition?.match(/filename="?([^";]+)"?/i)?.[1] ?? `${catalogApiResources[resource]}-template.xlsx`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}
