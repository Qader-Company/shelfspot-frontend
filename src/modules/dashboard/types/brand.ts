export interface BrandTranslation {
  locale?: string;
  name: string;
}

export interface CompanyBrand {
  id: number | string;
  name?: string;
  translations?:
    | BrandTranslation[]
    | Record<string, BrandTranslation | string | undefined>;
  active: boolean;
  is_active?: boolean | number | "0" | "1";
  logo?: string | null;
  logo_url?: string | null;
  created_at?: string | null;
}

export interface GetBrandsParams {
  per_page?: number;
  name?: string;
  active?: boolean;
  page?: number;
}

export interface GetBrandsMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface GetBrandsResponse {
  success: boolean;
  message: string;
  data: CompanyBrand[];
  meta?: GetBrandsMeta;
}
