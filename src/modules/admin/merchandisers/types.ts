export type MerchandiserRequestStatus = "completed" | "failed" | "canceled";

export interface MerchandiserRequest {
  id: string;
  location: string;
  occurredAt: string;
  status: MerchandiserRequestStatus;
}

export interface AdminMerchandiser {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  photoUrl?: string;
  jobTitle: "merchandiser";
  startDate: string;
  loginEnabled: boolean;
  temporaryPassword: string;
  active: boolean;
  completedTasks: number;
  currentTask?: {
    name: string;
    company: string;
    dueDate: string;
    progress: number;
  };
  requests: MerchandiserRequest[];
}

export interface MerchandiserPayload {
  fullName: string;
  email: string;
  phone: string;
  loginEnabled: boolean;
  temporaryPassword: string;
}

export interface MerchandiserListParams {
  search?: string;
  status?: "all" | "active" | "inactive";
  page: number;
  perPage: number;
}

export interface MerchandiserListResult {
  data: AdminMerchandiser[];
  meta: { total: number; active: number; inactive: number; currentPage: number; lastPage: number };
}
