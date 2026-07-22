import { apiClient } from "@/shared/lib/api/client";
import type { PaginatedTaskData, TaskListParams, TaskListResponse } from "./types";

const endpoint = "/api/company/tasks";

export async function getTasks(params?: TaskListParams) {
  const payload = (await apiClient.get<TaskListResponse | (Omit<TaskListResponse, "data"> & { data: PaginatedTaskData })>(endpoint, { params })).data;
  if (Array.isArray(payload.data)) return payload as TaskListResponse;
  const page = payload.data;
  return {
    success: payload.success,
    data: page.data,
    meta: page.meta ?? (page.current_page != null && page.last_page != null ? {
      current_page: page.current_page,
      last_page: page.last_page,
      per_page: page.per_page ?? 10,
      total: page.total ?? page.data.length,
    } : undefined),
  } satisfies TaskListResponse;
}
