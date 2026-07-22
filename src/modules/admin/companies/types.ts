export interface AdminCompany {
  id: string | number;
  name: string;
  country?: string | null;
  industry?: string | { name?: string } | null;
  cr_number?: string | number | null;
  email?: string | null;
  work_email?: string | null;
  phone?: string | null;
  created_at?: string | null;
  is_active?: boolean | number | "0" | "1";
  active?: boolean;
  latest_tasks?: AdminCompanyTask[];
  total_requests_count?: number;
  completed_requests_count?: number;
  pending_requests_count?: number;
  total_spending?: number;
  total_products_count?: number;
}

export interface AdminCompanyTask {
  id: string | number;
  location?: {
    location_name?: string | null;
    address?: string | null;
  } | null;
  status: string;
  status_label?: string;
  created_at?: string | null;
  date?: string | null;
}

export interface CompanyResponse {
  success?: boolean;
  message?: string;
  data: AdminCompany;
}

export interface CompaniesMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface CompaniesResponse {
  success?: boolean;
  message?: string;
  data: AdminCompany[];
  meta?: CompaniesMeta;
}

export interface CompaniesParams {
  search?: string;
  page?: number;
  per_page?: number;
}

export const ADMIN_CATALOG_RESOURCES = [
  "brand",
  "sub-brand",
  "category",
  "sub-category",
  "product",
] as const;

export type AdminCatalogResource = (typeof ADMIN_CATALOG_RESOURCES)[number];
export type AdminCatalogApiResource =
  | "brands"
  | "sub-brands"
  | "categories"
  | "sub-categories"
  | "products";

export interface AdminCatalogTranslation {
  locale?: string;
  name?: string;
  description?: string;
}

export interface AdminCatalogRelation {
  id: string | number;
  name?: string;
}

export interface AdminCatalogItem {
  id: string | number;
  name?: string;
  description?: string | null;
  translations?:
    | AdminCatalogTranslation[]
    | Record<string, AdminCatalogTranslation | string | undefined>;
  active?: boolean;
  is_active?: boolean | number | "0" | "1";
  brand_id?: string | number;
  sub_brand_id?: string | number;
  category_id?: string | number;
  sub_category_id?: string | number;
  brand?: AdminCatalogRelation | string | null;
  sub_brand?: AdminCatalogRelation | string | null;
  category?: AdminCatalogRelation | string | null;
  sub_category?: AdminCatalogRelation | string | null;
  brand_name?: string | null;
  sub_brand_name?: string | null;
  category_name?: string | null;
  sub_category_name?: string | null;
  sku?: string | null;
  barcode?: string | null;
  logo?: string | null;
  logo_url?: string | null;
  image?: string | null;
  image_url?: string | null;
  created_at?: string | null;
}

export interface AdminCatalogParams {
  page?: number;
  per_page?: number;
  name?: string;
  active?: boolean;
  brand_id?: string;
  sub_brand_id?: string;
  category_id?: string;
  sub_category_id?: string;
}

export interface AdminCatalogResponse {
  success?: boolean;
  message?: string;
  data: AdminCatalogItem[];
  meta?: CompaniesMeta;
}

export interface AdminCatalogPayload {
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  sku?: string;
  barcode?: string;
  brandId?: string;
  subBrandId?: string;
  categoryId?: string;
  subCategoryId?: string;
  isActive: boolean;
  image?: File;
}

export interface AdminCatalogMutationInput {
  companyId: string;
  resource: AdminCatalogResource;
  payload: AdminCatalogPayload;
  id?: string;
}
