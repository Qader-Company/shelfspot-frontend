export interface RequestFormFileField {
  type: string;
  required?: boolean;
  min_items?: number;
  attachment_type: string;
  accept?: string[];
}

export interface CompanyService {
  id: number;
  key: string;
  name: string;
  minimum_price: number;
  minimum_execution_time: number;
  description?: string | null;
  /** Root-level product_details_form — may be an empty array (no fields) or an object with fields */
  product_details_form?: { fields: Record<string, { type: string; required?: boolean; min?: number }> } | [] | null;
  request_form?: {
    requires_products?: boolean;
    /** product_details_form can also live inside request_form */
    product_details_form?: { fields: Record<string, { type: string; required?: boolean; min?: number }> } | null;
    /** File upload fields — key is the field name e.g. "planogram_files", "job_order_files" */
    fields?: Record<string, RequestFormFileField>;
  } | null;
}

export interface GetServicesResponse { success: boolean; message: string; data: CompanyService[] }
export interface TaskLocation { latitude: number; longitude: number; location_name?: string | null; address?: string | null }
export interface TaskProductDetails { [key: string]: unknown }
export interface TaskProduct { product_id: number; product_details?: TaskProductDetails }
export interface TaskService { service_key: string; price: number; execution_time_minutes: number; execution_instructions?: string | null; products: TaskProduct[]; planogramFiles?: File[]; jobOrderFiles?: File[] }
export interface CreateTaskPayload { date: string; location: TaskLocation; notes?: string | null; services: TaskService[] }
export interface CreateTaskResponse { success: boolean; message: string; data: { id: number; date: string; total_price: number; status: string; payment_status: string } }
