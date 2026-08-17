export type CompanyPermission =
  | "view_company" | "edit_company"
  | "view_brand" | "create_brand" | "edit_brand" | "delete_brand"
  | "view_sub_brand" | "create_sub_brand" | "edit_sub_brand" | "delete_sub_brand"
  | "view_category" | "create_category" | "edit_category" | "delete_category"
  | "view_sub_category" | "create_sub_category" | "edit_sub_category" | "delete_sub_category"
  | "view_product" | "create_product" | "edit_product" | "delete_product"
  | "view_service"
  | "view_wallet" | "recharge_wallet"
  | "view_task" | "create_task" | "edit_task" | "delete_task"
  | "view_role" | "create_role" | "edit_role" | "delete_role"
  | "view_admin" | "create_admin" | "edit_admin" | "delete_admin";

export const ALL_COMPANY_PERMISSIONS: readonly CompanyPermission[] = [
  "view_company", "edit_company",
  "view_brand", "create_brand", "edit_brand", "delete_brand",
  "view_sub_brand", "create_sub_brand", "edit_sub_brand", "delete_sub_brand",
  "view_category", "create_category", "edit_category", "delete_category",
  "view_sub_category", "create_sub_category", "edit_sub_category", "delete_sub_category",
  "view_product", "create_product", "edit_product", "delete_product",
  "view_service", "view_wallet", "recharge_wallet",
  "view_task", "create_task", "edit_task", "delete_task",
  "view_role", "create_role", "edit_role", "delete_role",
  "view_admin", "create_admin", "edit_admin", "delete_admin",
];

export function serializePermissions(permissions: unknown): string {
  if (!Array.isArray(permissions)) return "";
  return permissions
    .map((permission) => typeof permission === "string"
      ? permission
      : permission && typeof permission === "object" && "name" in permission
        ? String(permission.name)
        : "")
    .filter(Boolean)
    .join("|");
}

export function parsePermissions(value?: string): Set<string> {
  return new Set(value?.split("|").filter(Boolean) ?? []);
}

export function hasAnyPermission(
  permissions: ReadonlySet<string>,
  required: readonly CompanyPermission[],
) {
  return required.some((permission) => permissions.has(permission));
}
