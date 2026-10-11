import { apiClient } from "@/shared/lib/api/client";

import type {
  PaymentResponse,
  PaymentsApiResponse,
  PaymentsParams,
  PaymentsResponse,
  WithdrawalResponse,
  WithdrawalsApiResponse,
  WithdrawalsParams,
  WithdrawalsResponse,
  Withdrawal,
  WithdrawalApiRecord,
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

// ─── Withdrawals (Merchandiser / Workers tab) ─────────────────────────────────

function normalizeWithdrawal(record: WithdrawalApiRecord): Withdrawal {
  return {
    ...record,
    merchandiser_id: record.worker_id ?? record.merchandiser_id,
    merchandiser: record.worker ?? record.merchandiser ?? {
      id: record.worker_id ?? record.merchandiser_id ?? 0,
      name: "—",
    },
    iban: record.payout_details?.iban ?? record.iban,
    date: record.created_at ?? record.date ?? "",
    status: record.status === "paid" ? "approved" : record.status,
  };
}

/**
 * Fetch a paginated list of admin withdrawal requests.
 * Backend: GET /admin/withdrawals
 */
export async function getWithdrawals(params?: WithdrawalsParams): Promise<WithdrawalsResponse> {
  const { data: response } = await apiClient.get<WithdrawalsApiResponse>(
    "/api/admin/withdrawals",
    { params: { ...params, status: params?.status === "approved" ? "paid" : params?.status } },
  );

  if (!response?.data) {
    return {
      success: false,
      message: "Invalid response from server",
      summary: { total_withdraw_requests: 0, pending_withdraw_requests: 0, total_withdraw: 0 },
      data: [],
      meta: { current_page: 1, last_page: 1, per_page: 10, total: 0 },
    };
  }

  const { summary, withdrawals } = response.data;

  if (!withdrawals || !Array.isArray(withdrawals.data)) {
    return {
      success: response.success ?? false,
      message: response.message,
      summary: {
        total_withdraw_requests: summary?.total_requests_count ?? summary?.total_withdraw_requests ?? 0,
        pending_withdraw_requests: summary?.pending_requests_count ?? summary?.pending_withdraw_requests ?? 0,
        total_withdraw: summary?.paid_amount ?? summary?.total_withdraw ?? 0,
      },
      data: [],
      meta: {
        current_page: 1,
        last_page: 1,
        per_page: params?.per_page ?? 10,
        total: 0,
      },
    };
  }

  const { data: rows, meta: nestedMeta, ...spread } = withdrawals;

  const current_page = nestedMeta?.current_page ?? spread.current_page ?? 1;
  const last_page    = nestedMeta?.last_page     ?? spread.last_page    ?? 1;
  const per_page     = nestedMeta?.per_page      ?? spread.per_page     ?? params?.per_page ?? 10;
  const total        = nestedMeta?.total         ?? spread.total        ?? rows.length;

  return {
    success: response.success,
    message: response.message,
    summary: {
      total_withdraw_requests: summary?.total_requests_count ?? summary?.total_withdraw_requests ?? 0,
      pending_withdraw_requests: summary?.pending_requests_count ?? summary?.pending_withdraw_requests ?? 0,
      total_withdraw: summary?.paid_amount ?? summary?.total_withdraw ?? 0,
    },
    data: rows.map(normalizeWithdrawal),
    meta: { current_page, last_page, per_page, total },
  };
}

/**
 * Fetch a single withdrawal request by ID.
 * Backend: GET /admin/withdrawals/:id
 */
export async function getWithdrawal(id: string): Promise<Withdrawal> {
  const { data } = await apiClient.get<WithdrawalResponse>(
    `/api/admin/withdrawals/${encodeURIComponent(id)}`,
  );
  return normalizeWithdrawal(data.data);
}

/**
 * Approve a withdrawal request.
 * Backend: POST /admin/withdrawals/:id/approve
 */
export async function approveWithdrawal(id: string): Promise<Withdrawal> {
  const { data } = await apiClient.post<WithdrawalResponse>(
    `/api/admin/withdrawals/${encodeURIComponent(id)}/approve`,
  );
  return normalizeWithdrawal(data.data);
}
