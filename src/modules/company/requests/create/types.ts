export interface CompanyService {
  id: number;
  key: string;
  name: string;
  minimum_price: number;
  minimum_execution_time: number;
  description?: string | null;
}

export interface GetServicesResponse { success: boolean; message: string; data: CompanyService[] }
export interface TaskLocation { latitude: number; longitude: number; location_name?: string | null; address?: string | null }
export interface TaskProductDetails { [key: string]: unknown }
export interface TaskProduct { product_id: number; product_details?: TaskProductDetails }
export interface TaskService { service_key: string; price: number; execution_time_minutes: number; execution_instructions?: string | null; products: TaskProduct[]; request_files?: Record<string, unknown> }
export interface CreateTaskPayload { date: string; location: TaskLocation; notes?: string | null; services: TaskService[]; documentFiles?: File[] }
export interface CreateTaskResponse { success: boolean; message: string; data: { id: number; date: string; total_price: number; status: string; payment_status: string } }
