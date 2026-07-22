"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { createTask } from "@/modules/company/requests/create/service";
import { taskKeys } from "@/modules/company/requests/query-keys";

export function useCreateTaskMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}
