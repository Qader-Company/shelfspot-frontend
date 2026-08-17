import type { PaymentTransaction } from "./types";

/** Temporary design-preview data. Remove when the Admin transactions API is provided. */
export const paymentPreview: PaymentTransaction[] = [
  { id: 1, company: { id: 1, name: "TechCorp" }, amount: 3455, direction: "incoming", date: "2026-03-19", status: "refunded" },
  { id: 2, company: { id: 1, name: "TechCorp" }, amount: 3455, direction: "incoming", date: "2026-03-19", status: "completed" },
  { id: 3, company: { id: 1, name: "TechCorp" }, amount: 3455, direction: "outgoing", date: "2026-03-19", status: "failed" },
  { id: 4, company: { id: 1, name: "TechCorp" }, amount: 3455, direction: "incoming", date: "2026-03-19", status: "completed" },
  { id: 5, company: { id: 1, name: "TechCorp" }, amount: 3455, direction: "outgoing", date: "2026-03-19", status: "refunded" },
  { id: 6, company: { id: 1, name: "TechCorp" }, amount: 3455, direction: "incoming", date: "2026-03-19", status: "failed" },
  { id: 7, company: { id: 1, name: "TechCorp" }, amount: 3455, direction: "outgoing", date: "2026-03-19", status: "completed" },
  { id: 8, company: { id: 1, name: "TechCorp" }, amount: 3455, direction: "outgoing", date: "2026-03-19", status: "failed" },
];
