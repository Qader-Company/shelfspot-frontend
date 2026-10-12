import { apiClient } from "@/shared/lib/api/client";
import type {
  AdminRequest,
  AdminRequestList,
  AdminRequestParams,
  AdminRequestProduct,
  AdminRequestService,
  AdminRequestStatus,
  ReassignmentWorkerList,
} from "./types";
import type { CompanyTaskAttachment, CompanyTaskProduct, CompanyTaskSubmission } from "@/modules/company/requests/details/types";

type ApiRecord = Record<string, unknown>;
type ApiResponse<T> = { success?: boolean; message?: string; data: T; meta?: ApiRecord };

const knownStatuses = new Set<AdminRequestStatus>([
  "draft", "pending", "failed", "in_progress", "canceled", "in_review",
  "accepted", "rejected", "reopened", "completed",
]);

function record(value: unknown): ApiRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as ApiRecord : {};
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function text(value: unknown, fallback = "—") {
  return typeof value === "string" && value.trim() ? value : typeof value === "number" ? String(value) : fallback;
}

function number(value: unknown) {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function status(value: unknown): AdminRequestStatus {
  const normalized = text(value, "pending").toLowerCase().replaceAll("-", "_").replaceAll(" ", "_")
    .replace("cancelled", "canceled").replace("worker_canceled", "canceled").replace("company_canceled", "canceled");
  if (normalized === "cancel" || normalized === "worker_cancel" || normalized === "company_cancel") return "canceled";
  return knownStatuses.has(normalized as AdminRequestStatus) ? normalized as AdminRequestStatus : "pending";
}

function normalizeAttachments(value: unknown): CompanyTaskAttachment[] {
  return array(value).map((item, index) => {
    const source = record(item);
    return {
      id: number(source.id) || index + 1, field: text(source.field, ""), collection: text(source.collection, ""),
      name: text(source.name ?? source.file_name), file_name: text(source.file_name ?? source.name),
      mime_type: text(source.mime_type, "application/octet-stream"), size: number(source.size), url: text(source.url, ""),
    };
  }).filter((item) => item.url);
}

function normalizeExecutionProducts(value: unknown): CompanyTaskProduct[] {
  return array(value).map((item, index) => {
    const source = record(item);
    const product = record(source.product);
    return {
      id: number(source.id) || index + 1,
      product_details: record(source.product_details) as CompanyTaskProduct["product_details"],
      product: { id: number(product.id), name: text(product.name ?? source.name), sku: text(product.sku ?? source.sku), image: text(product.image ?? source.image, "") || null },
    };
  });
}

function normalizeSubmission(value: unknown): CompanyTaskSubmission | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const source = record(value);
  return {
    id: number(source.id), task_service_id: number(source.task_service_id), worker_id: number(source.worker_id),
    form_data: record(source.form_data), status: text(source.status, ""), completed_at: text(source.completed_at, "") || null,
    attachments: normalizeAttachments(source.attachments),
  };
}

function normalizeProduct(value: unknown): AdminRequestProduct {
  const source = record(value);
  const product = record(source.product);
  const details = record(source.product_details);
  return {
    id: text(source.id ?? product.id, crypto.randomUUID()),
    name: text(product.name ?? source.name),
    sku: text(product.sku ?? source.sku),
    quantity: number(source.quantity ?? details.quantity ?? details.min_quantity),
    expiryDate: text(source.expiry_date ?? details.expiry_date, "") || undefined,
    image: text(product.image ?? source.image, "") || undefined,
  };
}

function normalizeService(value: unknown): AdminRequestService {
  const source = record(value);
  const service = record(source.service);
  const firstProduct = record(record(array(source.products)[0]).product);
  return {
    id: text(source.id ?? service.id, crypto.randomUUID()),
    name: text(service.name ?? source.name),
    price: number(source.unit_price ?? service.price ?? source.price),
    duration: text(service.minimum_execution_time ?? source.duration, "—"),
    brand: text(record(firstProduct.brand).name ?? source.brand_name, "") || undefined,
    subBrand: text(record(firstProduct.sub_brand).name ?? source.sub_brand_name, "") || undefined,
    category: text(record(firstProduct.category).name ?? source.category_name, "") || undefined,
    subCategory: text(record(firstProduct.sub_category).name ?? source.sub_category_name, "") || undefined,
    products: array(source.products).map(normalizeProduct),
    guideline: text(source.execution_instructions ?? source.guideline, "") || undefined,
    execution: {
      service: { name: text(service.name ?? source.name) },
      products: normalizeExecutionProducts(source.products), submission: normalizeSubmission(source.submission),
      attachments: normalizeAttachments(source.attachments), completed_at: text(source.completed_at, "") || null,
    },
  };
}

function normalizeRequest(value: unknown, companyDeleted = false): AdminRequest {
  const source = record(value);
  const company = record(source.company);
  const location = record(source.location);
  const worker = record(source.assigned_worker ?? source.worker);
  const creator = record(source.created_by_user ?? source.assigned_by);
  const requestStatus = status(source.status);
  return {
    id: text(source.id),
    companyName: text(company.name ?? source.company_name),
    companyCountry: text(company.country ?? source.company_country, "") || undefined,
    companyDeleted: Boolean(source.company_deleted ?? source.is_company_deleted ?? companyDeleted),
    createdAt: text(source.created_at, new Date(0).toISOString()),
    storeName: text(location.location_name ?? location.name ?? source.store_name ?? source.location_name),
    price: number(source.total_price ?? source.price),
    status: requestStatus,
    location: text(location.location_name ?? location.address ?? source.location_name ?? source.store_name),
    assignedBy: text(creator.name ?? source.created_by, "") || undefined,
    worker: text(worker.name ?? source.worker_name, "") || undefined,
    workerId: text(source.assigned_worker_id ?? source.worker_id ?? worker.id, "") || undefined,
    executionDate: text(source.date ?? source.execution_date, "") || undefined,
    timeWindow: text(source.time_window ?? source.execution_time, "") || undefined,
    expiresAt: text(source.expires_at, "") || undefined,
    startedAt: text(source.started_at, "") || undefined,
    completedAt: text(source.completed_at, "") || undefined,
    rejectionReason: text(source.rejection_reason, "") || undefined,
    services: array(source.services).map(normalizeService),
  };
}

function pagePayload(response: ApiResponse<unknown>) {
  const nested = record(response.data);
  const rows = Array.isArray(response.data) ? response.data : array(nested.data);
  const meta = { ...nested, ...record(nested.meta), ...record(response.meta) };
  return { rows, meta };
}

export async function getAdminRequests(params: AdminRequestParams): Promise<AdminRequestList> {
  const endpoint = params.companyDeleted ? "/api/admin/tasks/company-deleted" : "/api/admin/tasks";
  const { data: response } = await apiClient.get<ApiResponse<unknown>>(endpoint, {
    params: {
      company_id: params.companyId || undefined,
      page: params.page,
    },
  });
  const { rows, meta } = pagePayload(response);
  const normalized = rows.map((item) => normalizeRequest(item, Boolean(params.companyDeleted)));
  const search = params.search?.trim().toLowerCase();
  const filtered = normalized.filter((item) =>
    (!search || [item.id, item.companyName, item.storeName].some((field) => field.toLowerCase().includes(search))) &&
    (!params.status || params.status === "all" || item.status === params.status));
  const total = number(meta.total) || normalized.length;
  return {
    data: filtered,
    stats: {
      total,
      pending: normalized.filter((item) => item.status === "pending").length,
      inProgress: normalized.filter((item) => item.status === "in_progress").length,
      rejected: normalized.filter((item) => item.status === "rejected").length,
      completedWeek: normalized.filter((item) => item.status === "completed").length,
      commission: normalized.reduce((sum, item) => sum + item.price, 0),
    },
    meta: {
      page: number(meta.current_page) || params.page,
      lastPage: number(meta.last_page) || 1,
    },
  };
}

export async function getAdminRequest(id: string) {
  const { data } = await apiClient.get<ApiResponse<unknown>>(`/api/admin/tasks/${encodeURIComponent(id)}`);
  return normalizeRequest(data.data);
}

export async function getReassignmentWorkers(page: number, search: string): Promise<ReassignmentWorkerList> {
  // The existing /index proxy forwards to the supplied /admin/workers endpoint.
  const { data } = await apiClient.get<ApiResponse<unknown>>("/api/admin/workers/index", { params: { page, per_page: 20, search: search || undefined } });
  const { rows, meta } = pagePayload(data);
  return { lastPage: number(meta.last_page) || 1, data: rows.map((value) => {
    const source = record(value);
    const worker = record(source.worker);
    return {
      id: text(worker.id ?? source.id),
      name: text(worker.name ?? source.name ?? source.full_name),
      phone: text(worker.phone ?? source.phone),
      tasks: number(source.tasks_count ?? source.completed_tasks ?? source.tasks),
      rating: number(source.rating),
      available: ![false, 0, "0"].includes((source.available ?? source.is_available ?? true) as boolean | number | string),
    };
  }) };
}

export async function assignAdminRequest(input: { requestId: string; merchandiserId: string }) {
  const workerId = Number(input.merchandiserId);
  if (!Number.isSafeInteger(workerId) || workerId <= 0) throw new Error("A valid worker id is required.");
  return (await apiClient.patch(`/api/admin/tasks/${encodeURIComponent(input.requestId)}/reassign`, { worker_id: workerId }, {
    headers: { "Content-Type": "application/json" },
  })).data;
}

export async function reopenAdminRequest(input: { requestId: string; workerId: string; reason?: string }) {
  if (!input.workerId.trim()) throw new Error("The worker id field is required.");
  const body = new URLSearchParams({ worker_id: input.workerId, reason: input.reason?.trim() ?? "" });
  return (await apiClient.post(`/api/admin/tasks/${encodeURIComponent(input.requestId)}/reopen`, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })).data;
}

export async function deleteCompanyDeletedRequest(requestId: string) {
  return (await apiClient.delete(`/api/admin/tasks/company-deleted/${encodeURIComponent(requestId)}`)).data;
}
