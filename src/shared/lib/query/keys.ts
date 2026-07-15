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
  subBrands: (params?: Record<string, unknown>) =>
    params
      ? (["app", "sub-brands", params] as const)
      : (["app", "sub-brands"] as const),
  categories: (params?: Record<string, unknown>) => params ? (["app", "categories", params] as const) : (["app", "categories"] as const),
} as const;
