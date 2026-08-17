import { apiClient } from "@/shared/lib/api/client";

export async function deleteTask(id: number | string) {
  return (await apiClient.delete(`/api/company/tasks/${id}`)).data;
}
