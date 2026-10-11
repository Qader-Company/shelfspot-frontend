export interface AdminService {
  id: string | number;
  key?: string;
  name?: string;
  title?: string;
  description?: string;
  price?: number | string;
  request_form?: { fields?: Record<string, { required?: boolean; min_items?: number }> };
  is_active?: boolean | number;
  active?: boolean;
}

export interface ServicePayload {
  description?: string;
  price?: number;
  is_active: 0 | 1;
}

export interface AdminServicesResponse {
  success?: boolean;
  message?: string;
  data: AdminService[] | { data: AdminService[] };
}

export interface AdminServiceResponse {
  success?: boolean;
  message?: string;
  data: AdminService;
}
