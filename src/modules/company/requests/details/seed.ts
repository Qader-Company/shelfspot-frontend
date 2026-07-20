import type { StatusBadgeStatus } from "@/shared/components/dashboard/status-badge";

// ─── Types ─────────────────────────────────────────────────────────────────

export type RequestDetailStatus = Extract<
  StatusBadgeStatus,
  | "inProgress"
  | "pending"
  | "failed"
  | "rejected"
  | "inReview"
  | "accepted"
  | "reopened"
  | "completed"
  | "canceled"
>;

export interface RequestProduct {
  id: string;
  name: string;
  thumbnailAlt: string;
  sku: string;
  quantity: number;
  expiryDate: string;
}

export interface RequestService {
  id: string;
  label: string;
  name: string;
  cost: string;
  duration: string;
  timeWindow: string;
  brand: string;
  subBrand: string;
  category: string;
  subCategory: string;
  products: RequestProduct[];
  guideline: { name: string; description: string } | null;
}

export interface RequestDetail {
  id: string;
  status: RequestDetailStatus;
  createdAt: string;
  location: string;
  assignedBy: string;
  executionDate: string;
  timeWindow: string;
  totalCost: string;
  totalCostSubtitle: string;
  totalProducts: number;
  timeRemaining: string;
  isExpired: boolean;
  services: RequestService[];
}

// ─── Mock services (reused across requests) ────────────────────────────────

const demoProducts: RequestProduct[] = [
  { id: "p1", name: "Diet Drinks", thumbnailAlt: "Diet Drinks product", sku: "123SKU", quantity: 234, expiryDate: "12 May 2026" },
  { id: "p2", name: "Diet Drinks", thumbnailAlt: "Diet Drinks product", sku: "123SKU", quantity: 65,  expiryDate: "12 May 2026" },
  { id: "p3", name: "Diet Drinks", thumbnailAlt: "Diet Drinks product", sku: "123SKU", quantity: 89,  expiryDate: "12 May 2026" },
];

const demoServices: RequestService[] = [
  {
    id: "svc-1",
    label: "Service #1",
    name: "Freshness Report \u201CMust go backdoor\u201D",
    cost: "$50",
    duration: "30 min",
    timeWindow: "09:00 AM",
    brand: "Pepsico",
    subBrand: "Pepsi Diet",
    category: "Soft Drinks",
    subCategory: "Soft Drinks",
    products: demoProducts,
    guideline: { name: "Planogram", description: "Self layout diagram" },
  },
  {
    id: "svc-2",
    label: "Service #2",
    name: "Freshness Report \u201CMust go backdoor\u201D",
    cost: "$50",
    duration: "30 min",
    timeWindow: "09:00 AM",
    brand: "Pepsico",
    subBrand: "Pepsi Diet",
    category: "Soft Drinks",
    subCategory: "Soft Drinks",
    products: demoProducts,
    guideline: { name: "Planogram", description: "Self layout diagram" },
  },
];

// ─── Mock requests (one per status) ────────────────────────────────────────

const baseRequest: Omit<RequestDetail, "id" | "status" | "timeRemaining" | "isExpired"> = {
  createdAt: "22 May 2026, 10:30 AM",
  location: "Panda Hypermarket",
  assignedBy: "Mohamed Ali",
  executionDate: "25 May 2026",
  timeWindow: "09:00 AM",
  totalCost: "$120",
  totalCostSubtitle: "For 3 services",
  totalProducts: 162,
  services: demoServices,
};

export const mockRequestDetails: RequestDetail[] = [
  { ...baseRequest, id: "REQ-4521", status: "failed",     timeRemaining: "0h 0m 0s",    isExpired: true  },
  { ...baseRequest, id: "REQ-4522", status: "inProgress", timeRemaining: "1h 41m 32s",  isExpired: false },
  { ...baseRequest, id: "REQ-4523", status: "pending",    timeRemaining: "1h 41m 32s",  isExpired: false },
  { ...baseRequest, id: "REQ-4524", status: "rejected",   timeRemaining: "0h 0m 0s",    isExpired: true  },
  { ...baseRequest, id: "REQ-4525", status: "inReview",   timeRemaining: "0h 0m 0s",    isExpired: true  },
  { ...baseRequest, id: "REQ-4526", status: "accepted",   timeRemaining: "0h 0m 0s",    isExpired: true  },
  { ...baseRequest, id: "REQ-4527", status: "reopened",   timeRemaining: "0h 0m 0s",    isExpired: true  },
  { ...baseRequest, id: "REQ-4528", status: "completed",  timeRemaining: "0h 0m 0s",    isExpired: true  },
  { ...baseRequest, id: "REQ-4529", status: "canceled",   timeRemaining: "0h 0m 0s",    isExpired: true  },
];

export function getRequestById(id: string): RequestDetail {
  return mockRequestDetails.find((r) => r.id === id) ?? mockRequestDetails[0];
}
