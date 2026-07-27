import { adminApiClient } from "@/shared/lib/api/client";
import type { TrashItem, TrashTab } from "./types";

type ApiRecord = Record<string, unknown>;
type ApiResponse = { data?: unknown };
const record = (value: unknown): ApiRecord => value && typeof value === "object" && !Array.isArray(value) ? value as ApiRecord : {};
const text = (value: unknown, fallback = "—") => typeof value === "string" && value.trim() ? value : typeof value === "number" ? String(value) : fallback;
const boolean = (value: unknown) => value === true || value === 1 || value === "1";
const relation = (value: unknown) => text(record(value).name ?? value, "");

function rows(response: ApiResponse) {
  if (Array.isArray(response.data)) return response.data;
  const nested = record(response.data);
  return Array.isArray(nested.data) ? nested.data : [];
}

function normalize(value: unknown, tab: TrashTab): TrashItem {
  const source = record(value);
  const company = record(source.company);
  const location = record(source.location);
  const name = tab === "requests" ? `REQ-${text(source.id)}` : text(source.full_name ?? source.name ?? company.name);
  const brand = relation(source.brand ?? source.brand_name);
  const subBrand = relation(source.sub_brand ?? source.sub_brand_name);
  const category = relation(source.category ?? source.category_name);
  const subCategory = relation(source.sub_category ?? source.sub_category_name);
  return {
    id: text(source.id, crypto.randomUUID()), name,
    secondary: text(source.country ?? company.country, "") || undefined,
    image: text(source.logo_url ?? source.logo ?? source.image_url ?? source.image ?? source.photo, "") || undefined,
    active: boolean(source.active ?? source.is_active), deletedAt: text(source.deleted_at, "") || undefined,
    brand: brand || undefined, subBrand: subBrand || undefined, category: category || undefined,
    family: [brand, subBrand, category, subCategory].filter(Boolean).join(" › ") || undefined,
    sku: text(source.sku, "") || undefined, description: text(source.description, "") || undefined,
    phone: text(source.phone, "") || undefined, email: text(source.email ?? source.work_email, "") || undefined,
    completedTasks: Number(source.completed_tasks ?? source.completed_tasks_count ?? 0),
    industry: relation(source.industry) || undefined, crNumber: text(source.cr_number, "") || undefined,
    storeName: text(location.location_name ?? source.store_name, "") || undefined,
    price: Number(source.total_price ?? source.price ?? 0), status: text(source.status, "") || undefined,
  };
}

const paths: Record<TrashTab, string> = {
  brands: "/api/admin/companies/1/brands/trash", "sub-brands": "/api/admin/companies/1/sub-brands/trash",
  categories: "/api/admin/companies/1/categories/trash", "sub-categories": "/api/admin/companies/1/sub-categories/trash",
  products: "/api/admin/companies/1/products/trash", requests: "/api/admin/tasks/company-deleted",
  freelancers: "/api/admin/workers/trash", companies: "/api/admin/companies/trash",
};

export async function getTrash(tab: TrashTab) {
  const { data } = await adminApiClient.get<ApiResponse>(paths[tab]);
  return rows(data).map((item) => normalize(item, tab));
}

export async function restoreTrashItem({ tab, id }: { tab: TrashTab; id: string }) {
  if (tab === "requests") throw new Error("Request restoration is not supported by the provided API contract.");
  return (await adminApiClient.post(`${paths[tab]}/${encodeURIComponent(id)}/restore`)).data;
}

export async function permanentlyDeleteTrashItem({ tab, id }: { tab: TrashTab; id: string }) {
  return (await adminApiClient.delete(`${paths[tab]}/${encodeURIComponent(id)}`)).data;
}

