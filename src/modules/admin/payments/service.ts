import { apiClient } from "@/shared/lib/api/client";

import type {
  PaymentResponse,
  PaymentsApiResponse,
  PaymentsParams,
  PaymentsResponse,
} from "./types";

/**
 * Fetch a paginated list of admin payment transactions.
 * Backend: GET /admin/payments
 * Response shape: { success, data: { summary, payments: { data: [...], current_page, ... } } }
 */
export async function getPayments(params?: PaymentsParams): Promise<PaymentsResponse> {
  const { data: response } = await apiClient.get<PaymentsApiResponse>(
    "/api/admin/payments",
    { params },
  );

  // Defensive: handle missing or malformed response
  if (!response?.data) {
    return {
      success: false,
      message: "Invalid response from server",
      summary: { total_incoming: 0, total_outgoing: 0, net_balance: 0 },
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
    };
  }

  const { summary, payments } = response.data;

  // Defensive: handle missing payments or invalid structure
  if (!payments || !Array.isArray(payments.data)) {
    return {
      success: response.success ?? false,
      message: response.message,
      summary: summary ?? { total_incoming: 0, total_outgoing: 0, net_balance: 0 },
      data: [],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: params?.per_page ?? 10,
        total: 0,
      },
    };
  }

  const { data: rows, meta: nestedMeta, ...spread } = payments;

  // Laravel pagination can be spread on the object OR nested under `meta`
  const current_page = nestedMeta?.current_page ?? spread.current_page ?? 1;
  const last_page    = nestedMeta?.last_page     ?? spread.last_page    ?? 1;
  const per_page     = nestedMeta?.per_page      ?? spread.per_page     ?? params?.per_page ?? 10;
  const total        = nestedMeta?.total         ?? spread.total        ?? rows.length;

  return {
    success: response.success,
    message: response.message,
    summary: summary ?? { total_incoming: 0, total_outgoing: 0, net_balance: 0 },
    data: rows,
    meta: { current_page, last_page, per_page, total },
  };
}

/**
 * Fetch a single payment transaction by ID.
 * Backend: GET /admin/payments/:id
 */
export async function getPayment(id: string): Promise<PaymentResponse["data"]> {
  const { data } = await apiClient.get<PaymentResponse>(
    `/api/admin/payments/${encodeURIComponent(id)}`,
  );
  return data.data;
}
