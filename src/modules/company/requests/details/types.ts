export interface CompanyTaskAttachment {
  id: number;
  field: string;
  collection: string;
  name: string;
  file_name: string;
  mime_type: string;
  size: number;
  url: string;
}

export interface CompanyTaskProduct {
  id: number;
  product_details: Record<string, string | number | null> | [];
  product: {
    id: number;
    name: string;
    sku: string;
    image?: string | null;
    brand?: { name: string } | null;
    sub_brand?: { name: string } | null;
    category?: { name: string } | null;
    sub_category?: { name: string } | null;
  };
}

export interface CompanyTaskService {
  id: number;
  execution_instructions?: string | null;
  unit_price: string;
  status: string;
  status_label: string;
  sort_order: number;
  service: {
    id: number;
    key: string;
    name: string;
    description: string;
    price: string;
    is_active: boolean;
  };
  products: CompanyTaskProduct[];
  submission: unknown | null;
  attachments: CompanyTaskAttachment[];
}

export interface CompanyTask {
  id: number;
  company_id: number;
  company?: { id: number; name: string; email: string; phone: string } | null;
  date: string;
  location: {
    latitude: string;
    longitude: string;
    location_name?: string | null;
    address?: string | null;
  };
  total_price: number;
  notes?: string | null;
  status: string;
  status_label: string;
  payment_status: string;
  payment_status_label: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  expires_at?: string | null;
  charged_at?: string | null;
  accepted_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  rejected_at?: string | null;
  rejection_reason?: string | null;
  assigned_worker_id?: number | null;
  assigned_worker?: { id: number; name: string } | null;
  progress: {
    total_services: number;
    completed_services: number;
    remaining_services: number;
    percentage: number;
  };
  services: CompanyTaskService[];
}

export interface TaskResponse {
  success: boolean;
  message?: string;
  data: CompanyTask;
}
