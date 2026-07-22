"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { taskKeys } from "@/modules/company/requests/query-keys";
import { getTask, payDraftTask, taskAction, updateTask } from "./service";

export function useTaskQuery(id: number | string) {
  return useQuery({ queryKey: taskKeys.detail(id), queryFn: () => getTask(id), enabled: Boolean(id) });
}

export function useTaskMutations() {
  const queryClient = useQueryClient();
  const refresh = () => queryClient.invalidateQueries({ queryKey: taskKeys.all });
  return {
    update: useMutation({ mutationFn: ({ id, payload }: { id: number | string; payload: FormData | Record<string, unknown> }) => updateTask(id, payload), onSuccess: refresh }),
    pay: useMutation({ mutationFn: payDraftTask, onSuccess: refresh }),
    act: useMutation({ mutationFn: ({ id, action, payload }: { id: number | string; action: "cancel" | "accept" | "reject"; payload?: Record<string, unknown> }) => taskAction(id, action, payload), onSuccess: refresh }),
  };
}
