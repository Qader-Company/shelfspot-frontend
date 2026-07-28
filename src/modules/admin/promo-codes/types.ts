export type PromoStatus = "active" | "inactive" | "expired";

export interface PromoRedemption {
  id: string;
  company: string;
  country: string;
  usedDate: string;
  amountSaved: number;
}

export interface PromoCodeRecord {
  id: string;
  code: string;
  amount: number;
  maxRedemptions: number;
  usedCount: number;
  expiresAt: string;
  active: boolean;
  assignedCompanyId: string;
  notes: string;
  redemptions: PromoRedemption[];
}

export interface PromoPayload {
  code: string;
  amount: number;
  maxRedemptions: number;
  expiresAt: string;
  active: boolean;
  assignedCompanyId: string;
  notes: string;
}

export type PromoFieldErrors = Partial<Record<keyof PromoPayload, string>>;

export interface PromoListParams {
  search?: string;
  active?: 0 | 1;
  page: number;
  perPage: number;
}

export interface PromoListResult {
  data: PromoCodeRecord[];
  meta: { page: number; lastPage: number; total: number };
}
