export type PaymentStatus = "completed" | "failed" | "refunded";

export interface PaymentCompany {
  id: number;
  name: string;
  email?: string | null;
  phone?: string | null;
}

export interface PaymentTransaction {
  id: number;
  task_id?: number | null;
  company_id?: number | null;
  company: PaymentCompany;
  amount: number;
  direction: "incoming" | "outgoing";
  status: PaymentStatus;
  status_label?: string | null;
  payment_status?: string | null;
  payment_status_label?: string | null;
  date: string;
  charged_at?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
}

export interface PaymentMeta {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  // Laravel also sends these — accept them if present
  from?: number | null;
  to?: number | null;
}

export interface PaymentSummary {
  total_incoming: number;
  total_outgoing: number;
  net_balance: number;
}

export interface PaymentsParams {
  page?: number;
  per_page?: number;
  search?: string;
  status?: PaymentStatus | "all";
  sort?: "newest" | "oldest";
}

export interface PaymentsApiResponse {
  success: boolean;
  message?: string;
  data: {
    summary: PaymentSummary;
    payments: {
      data: PaymentTransaction[];
      // Laravel pagination can send meta either spread or nested
      current_page?: number;
      last_page?: number;
      per_page?: number;
      total?: number;
      links?: unknown;
      meta?: PaymentMeta;
    };
  };
}

// Normalised shape used inside the app
export interface PaymentsResponse {
  success: boolean;
  message?: string;
  summary: PaymentSummary;
  data: PaymentTransaction[];
  meta?: PaymentMeta;
}

export interface PaymentResponse {
  success: boolean;
  message?: string;
  data: PaymentTransaction;
}
