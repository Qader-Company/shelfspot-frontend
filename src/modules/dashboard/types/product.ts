export interface CompanyProduct {
  id: number;
  name: string;
  sku: string;
  brand?: string | null;
  sub_brand?: string | null;
  category?: string | null;
  sub_category?: string | null;
  expiry_date?: string | null;
  image_url?: string | null;
}

export interface GetProductsParams {
  brand?: string;
  sub_brand?: string;
  category?: string;
  sub_category?: string;
  search?: string;
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
