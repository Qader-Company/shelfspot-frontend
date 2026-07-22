export interface CompanyProduct {
  id: number;
  name: string;
  sku: string;
  description?: string | null;
  translations?: Array<{ locale?: string; name?: string; description?: string }> | Record<string, string | { name?: string; description?: string } | undefined>;
  barcode?: string | null;
  active: boolean;
  is_active?: boolean | number | "0" | "1";
  brand_id?: string | number;
  sub_brand_id?: string | number;
  category_id?: string | number;
  sub_category_id?: string | number;
  brand?: { id: string | number; name?: string } | string | null;
  sub_brand?: { id: string | number; name?: string } | string | null;
  category?: { id: string | number; name?: string } | string | null;
  sub_category?: { id: string | number; name?: string } | string | null;
  expiry_date?: string | null;
  image_url?: string | null;
  image?: string | null;
  logo?: string | null;
  logo_url?: string | null;
  created_at?: string | null;
}

export interface GetProductsParams {
  /** Legacy request-builder filters retained for its product picker. */
  brand?: string;
  sub_brand?: string;
  category?: string;
  sub_category?: string;
  search?: string;
  per_page?: number;
  name?: string;
  active?: boolean;
  brand_id?: string;
  sub_brand_id?: string;
  category_id?: string;
  sub_category_id?: string;
  page?: number;
}

export interface GetProductsMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
}

export interface GetProductsResponse {
  success: boolean;
  message: string;
  data: CompanyProduct[];
  meta?: GetProductsMeta;
}
