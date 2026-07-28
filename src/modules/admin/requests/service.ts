import { apiClient } from "@/shared/lib/api/client";
import type {
  AdminRequest,
  AdminRequestList,
  AdminRequestParams,
  AdminRequestProduct,
  AdminRequestService,
  AdminRequestStatus,
  NearbyMerchandiser,
} from "./types";

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
  return knownStatuses.has(normalized as AdminRequestStatus) ? normalized as AdminRequestStatus : "pending";
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
    executionDate: text(source.date ?? source.execution_date, "") || undefined,
    timeWindow: text(source.time_window ?? source.execution_time, "") || undefined,
    expiresAt: text(source.expires_at, "") || undefined,
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

export async function getNearbyMerchandisers(requestId: string, radiusKm: number): Promise<NearbyMerchandiser[]> {
  const { data } = await apiClient.get<ApiResponse<unknown>>(
    `/api/admin/tasks/${encodeURIComponent(requestId)}/available-workers`,
    { params: { radius_km: radiusKm } },
  );
  const rows = Array.isArray(data.data) ? data.data : array(record(data.data).data);
  return rows.map((value) => {
    const source = record(value);
    const worker = record(source.worker);
    return {
      id: text(worker.id ?? source.id),
      name: text(worker.name ?? source.name),
      phone: text(worker.phone ?? source.phone),
      distanceKm: number(source.distance_km ?? source.distance),
      tasks: number(source.tasks_count ?? source.completed_tasks ?? source.tasks),
      rating: number(source.rating),
      available: Boolean(source.available ?? source.is_available ?? true),
    };
  });
}

export async function assignAdminRequest(input: { requestId: string; merchandiserId: string }) {
  const body = new URLSearchParams({ worker_id: input.merchandiserId });
  return (await apiClient.post(`/api/admin/tasks/${encodeURIComponent(input.requestId)}/reassign`, body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  })).data;
}

export async function reopenAdminRequest(requestId: string) {
  return (await apiClient.post(`/api/admin/tasks/${encodeURIComponent(requestId)}/reopen`)).data;
}

export async function deleteCompanyDeletedRequest(requestId: string) {
  return (await apiClient.delete(`/api/admin/tasks/company-deleted/${encodeURIComponent(requestId)}`)).data;
}
