import type { TaskListParams } from "@/modules/company/requests/list/types";

export const taskKeys = {
  all: ["app", "company-tasks"] as const,
  list: (params?: TaskListParams) => [...taskKeys.all, "list", params ?? {}] as const,
  detail: (id: number | string) => [...taskKeys.all, "detail", String(id)] as const,
};
