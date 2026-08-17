import type { BrandTranslation, GetBrandsMeta } from "@/modules/company/catalog/brands/types";

export interface CompanySubBrand {
  id: string | number;
  name?: string;
  translations?: BrandTranslation[] | Record<string, BrandTranslation | string | undefined>;
  active: boolean;
  is_active?: boolean | number | "0" | "1";
  brand_id: string | number;
  brand?: { id: string | number; name?: string } | string | null;
  brand_name?: string | null;
  logo?: string | null;
  logo_url?: string | null;
  created_at?: string | null;
}

export interface GetSubBrandsParams {
  per_page?: number;
  name?: string;
  active?: boolean;
  brand_id?: string;
  page?: number;
}

export interface GetSubBrandsResponse {
  success: boolean;
  message: string;
  data: CompanySubBrand[];
  meta?: GetBrandsMeta;
}
