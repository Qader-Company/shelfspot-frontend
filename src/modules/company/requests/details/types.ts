export interface CompanyTaskProduct {
  id: number;
  product_details: Record<string, string | number | null> | [];
  product: {
    id: number; name: string; sku: string; image?: string | null;
    brand?: { name: string } | null; sub_brand?: { name: string } | null;
    category?: { name: string } | null; sub_category?: { name: string } | null;
  };
}

export interface CompanyTaskService {
  id: number;
  execution_instructions?: string | null;
  unit_price: string;
  status: string;
  status_label: string;
  service: { id: number; key: string; name: string; description: string; price: string };
  products: CompanyTaskProduct[];
  attachments: unknown[];
}

export interface CompanyTask {
  id: number; company_id: number; date: string;
  location: { latitude: string; longitude: string; location_name?: string | null; address?: string | null };
  total_price: number; notes?: string | null; status: string; status_label: string;
  payment_status: string; payment_status_label: string; created_by: string;
  created_at: string; updated_at: string; expires_at?: string | null;
  assigned_worker?: { id: number; name: string } | null;
  progress: { total_services: number; completed_services: number; remaining_services: number; percentage: number };
  services: CompanyTaskService[];
}

export interface TaskResponse { success: boolean; message?: string; data: CompanyTask }
