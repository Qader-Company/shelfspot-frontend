export type CompanyTaskStatus =
  | "draft" | "pending" | "accepted" | "started" | "in_progress"
  | "worker_cancelled" | "company_cancelled" | "completed" | "rejected"
  | "reopened" | "failed";

export interface CompanyTaskListItem {
  id: number;
  company_id: number;
  date: string;
  location: { latitude: string; longitude: string; location_name?: string | null; address?: string | null };
  total_price: number;
  notes?: string | null;
  status: CompanyTaskStatus;
  status_label: string;
  payment_status: string;
  payment_status_label: string;
  created_by: string;
  created_at: string;
  updated_at: string;
  assigned_worker?: { id: number; name: string } | null;
}

export interface TaskListParams {
  company_id?: number;
  status?: string;
  payment_status?: string;
  date_from?: string;
  date_to?: string;
  page?: number;
}

export interface TaskListResponse {
  success: boolean;
  data: CompanyTaskListItem[];
  meta?: { current_page: number; last_page: number; per_page: number; total: number };
}

export interface PaginatedTaskData {
  data: CompanyTaskListItem[];
  current_page?: number;
  last_page?: number;
  per_page?: number;
  total?: number;
  meta?: TaskListResponse["meta"];
}
