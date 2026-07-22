"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { taskKeys } from "@/modules/company/requests/query-keys";
import { deleteTask } from "./service";

export function useDeleteTaskMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: taskKeys.all }),
  });
}
