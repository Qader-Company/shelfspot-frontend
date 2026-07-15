export const QUERY_KEYS = {
  all: ["app"] as const,
  services: ["app", "services"] as const,
  dashboardReport: ["app", "dashboard-report"] as const,
  products: (params?: Record<string, unknown>) =>
    params
      ? (["app", "products", params] as const)
      : (["app", "products"] as const),
  brands: (params?: Record<string, unknown>) =>
    params
      ? (["app", "brands", params] as const)
      : (["app", "brands"] as const),
} as const;
