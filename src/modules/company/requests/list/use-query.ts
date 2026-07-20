"use client";

import { useQuery } from "@tanstack/react-query";
import { taskKeys } from "@/modules/company/requests/query-keys";
import { getTasks } from "./service";
import type { TaskListParams } from "./types";

export function useTasksQuery(params?: TaskListParams) {
  return useQuery({ queryKey: taskKeys.list(params), queryFn: () => getTasks(params) });
}
