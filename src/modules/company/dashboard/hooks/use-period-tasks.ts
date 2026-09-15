"use client";
import { useQuery } from "@tanstack/react-query";
import { getTasks } from "@/modules/company/requests/list/service";
import { taskKeys } from "@/modules/company/requests/query-keys";
export async function getPeriodTasks(range: { date_from: string; date_to: string }) {
  const first = await getTasks({ ...range, page: 1 });
  const tasks = [...first.data];
  for (let page = 2; page <= (first.meta?.last_page ?? 1); page++) tasks.push(...(await getTasks({ ...range, page })).data);
  return tasks;
}
export function usePeriodTasks(range: { date_from: string; date_to: string }) {
  return useQuery({ queryKey: [...taskKeys.all, "dashboard-period", range], queryFn: () => getPeriodTasks(range) });
}
