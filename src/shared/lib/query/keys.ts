export const QUERY_KEYS = {
  all: ["app"] as const,
  services: ["app", "services"] as const,
  products: (params?: Record<string, unknown>) =>
    params
      ? (["app", "products", params] as const)
      : (["app", "products"] as const),
} as const;
