import { adminApiClient } from "@/shared/lib/api/client";

import type {
  PromoCodeRecord,
  PromoListParams,
  PromoListResult,
  PromoPayload,
  PromoRedemption,
} from "./types";

type ApiCoupon = Partial<PromoCodeRecord> & {
  max_redemptions?: number;
  used_count?: number;
  redemptions_count?: number;
  expires_at?: string;
  is_active?: boolean | 0 | 1 | "0" | "1";
  assigned_company_id?: string | number | null;
  usage_history?: PromoRedemption[];
};

type ApiResponse<T> = {
  data: T;
  meta?: { current_page?: number; last_page?: number; total?: number };
};

function normalizeDate(value: string | undefined) {
  if (!value) return "";
  const dayFirst = value.match(/^(\d{2})-(\d{2})-(\d{4})$/);
  return dayFirst
    ? `${dayFirst[3]}-${dayFirst[2]}-${dayFirst[1]}`
    : value.slice(0, 10);
}

function toBackendDate(value: string) {
  const [year, month, day] = value.split("-");
  return `${day}-${month}-${year}`;
}

function normalize(item: ApiCoupon): PromoCodeRecord {
  return {
    id: String(item.id ?? ""),
    code: item.code ?? "—",
    amount: Number(item.amount ?? 0),
    maxRedemptions: Number(item.maxRedemptions ?? item.max_redemptions ?? 0),
    usedCount: Number(
      item.usedCount ?? item.used_count ?? item.redemptions_count ?? 0,
    ),
    expiresAt: normalizeDate(item.expiresAt ?? item.expires_at),
    active:
      item.active ??
      (item.is_active === true ||
        item.is_active === 1 ||
        item.is_active === "1"),
    assignedCompanyId: String(
      item.assignedCompanyId ?? item.assigned_company_id ?? "",
    ),
    notes: item.notes ?? "",
    redemptions: item.redemptions ?? item.usage_history ?? [],
  };
}

export async function getPromoCodes(
  params: PromoListParams,
): Promise<PromoListResult> {
  const { data: response } = await adminApiClient.get<
    ApiResponse<
      | ApiCoupon[]
      | {
          data: ApiCoupon[];
          current_page?: number;
          last_page?: number;
          total?: number;
        }
    >
  >("/api/admin/wallet-coupons", {
    params: {
      search: params.search || undefined,
      active: params.active,
      page: params.page,
      per_page: params.perPage,
    },
  });
  const nested = Array.isArray(response.data) ? null : response.data;
  const items = (
    Array.isArray(response.data) ? response.data : response.data.data
  ).map(normalize);

  return {
    data: items,
    meta: {
      page:
        response.meta?.current_page ?? nested?.current_page ?? params.page,
      lastPage: response.meta?.last_page ?? nested?.last_page ?? 1,
      total: response.meta?.total ?? nested?.total ?? items.length,
    },
  };
}

export async function getPromoCode(id: string) {
  const { data } = await adminApiClient.get<ApiResponse<ApiCoupon>>(
    `/api/admin/wallet-coupons/${encodeURIComponent(id)}`,
  );
  return normalize(data.data);
}

function toFormData(input: PromoPayload) {
  const data = new FormData();
  data.set("code", input.code);
  data.set("amount", String(input.amount));
  data.set("max_redemptions", String(input.maxRedemptions));
  data.set("expires_at", toBackendDate(input.expiresAt));
  data.set("is_active", input.active ? "1" : "0");
  if (input.assignedCompanyId) {
    data.set("assigned_company_id", input.assignedCompanyId);
  }
  if (input.notes) data.set("notes", input.notes);
  return data;
}

export async function createPromoCode(input: PromoPayload) {
  const response = (
    await adminApiClient.post("/api/admin/wallet-coupons", toFormData(input))
  ).data;
  const item = (response as { data?: ApiCoupon }).data ??
    (response as ApiCoupon);
  return normalize({
    ...item,
    code: input.code,
    amount: input.amount,
    max_redemptions: input.maxRedemptions,
    expires_at: input.expiresAt,
    is_active: input.active,
    assigned_company_id: input.assignedCompanyId,
    notes: input.notes,
    id: item.id,
  });
}

export async function updatePromoCode({
  id,
  input,
}: {
  id: string;
  input: PromoPayload;
}) {
  const response = (
    await adminApiClient.put(
      `/api/admin/wallet-coupons/${encodeURIComponent(id)}`,
      toFormData(input),
    )
  ).data;
  const item = (response as { data?: ApiCoupon }).data ??
    (response as ApiCoupon);
  return normalize({
    ...item,
    id,
    code: input.code,
    amount: input.amount,
    max_redemptions: input.maxRedemptions,
    expires_at: input.expiresAt,
    is_active: input.active,
    assigned_company_id: input.assignedCompanyId,
    notes: input.notes,
  });
}

export async function deletePromoCode(id: string) {
  return (
    await adminApiClient.delete(
      `/api/admin/wallet-coupons/${encodeURIComponent(id)}`,
    )
  ).data;
}

export async function updatePromoStatus({
  id,
  active,
}: {
  id: string;
  active: boolean;
}) {
  return (
    await adminApiClient.put(
      `/api/admin/wallet-coupons/${encodeURIComponent(id)}`,
      undefined,
      { params: { active: active ? 1 : 0 } },
    )
  ).data;
}
