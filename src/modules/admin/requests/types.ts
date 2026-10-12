export type AdminRequestStatus = "draft" | "pending" | "failed" | "in_progress" | "canceled" | "in_review" | "accepted" | "rejected" | "reopened" | "completed";
export interface AdminRequestProduct { id: string; name: string; sku: string; quantity: number; expiryDate?: string; image?: string }
import type { ExecutionServiceEvidence } from "@/shared/components/dashboard/execution-service-card";

export interface AdminRequestService { id: string; name: string; price: number; duration: string; brand?: string; subBrand?: string; category?: string; subCategory?: string; products: AdminRequestProduct[]; guideline?: string; execution: ExecutionServiceEvidence }
export interface AdminRequest { id: string; companyName: string; companyCountry?: string; companyDeleted?: boolean; createdAt: string; storeName: string; price: number; status: AdminRequestStatus; location: string; assignedBy?: string; worker?: string; workerId?: string; executionDate?: string; timeWindow?: string; expiresAt?: string; startedAt?: string; completedAt?: string; rejectionReason?: string; services: AdminRequestService[] }
export interface AdminRequestParams { companyId?: string; search?: string; status?: string; companyDeleted?: boolean; page: number; perPage: number }
export interface AdminRequestList { data: AdminRequest[]; stats: { total: number; pending: number; inProgress: number; rejected: number; completedWeek: number; commission: number }; meta: { page: number; lastPage: number } }
export interface ReassignmentWorker { id: string; name: string; phone: string; tasks: number; rating: number; available: boolean }
export interface ReassignmentWorkerList { data: ReassignmentWorker[]; lastPage: number }
