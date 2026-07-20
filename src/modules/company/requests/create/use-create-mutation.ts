"use client";

import { useMutation } from "@tanstack/react-query";

import { createTaskService } from "@/modules/company/requests/create/task-service";

export function useCreateTaskMutation() {
  return useMutation({
    mutationFn: createTaskService,
  });
}
