import { apiClient } from "@/shared/lib/api/client";
import type { TaskResponse } from "./types";

const endpoint = "/api/company/tasks";

export async function getTask(id: number | string) { return (await apiClient.get<TaskResponse>(`${endpoint}/${id}`)).data; }
export async function updateTask(id: number | string, payload: FormData | Record<string, unknown>) { return (await apiClient.patch<TaskResponse>(`${endpoint}/${id}`, payload)).data; }
export async function payDraftTask(id: number | string) { return (await apiClient.post<TaskResponse>(`${endpoint}/${id}/pay`)).data; }
export async function taskAction(id: number | string, action: "cancel" | "accept" | "reject", payload?: Record<string, unknown>) { return (await apiClient.post<TaskResponse>(`${endpoint}/${id}/${action}`, payload)).data; }
